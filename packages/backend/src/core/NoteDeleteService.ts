/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Brackets, In, IsNull, Not } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import type { MiUser, MiLocalUser, MiRemoteUser } from '@/models/User.js';
import type { MiNote, IMentionedRemoteUsers } from '@/models/Note.js';
import type { InstancesRepository, MiMeta, NotesRepository, UsersRepository } from '@/models/_.js';
import { RelayService } from '@/core/RelayService.js';
import { FederatedInstanceService } from '@/core/FederatedInstanceService.js';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import NotesChart from '@/core/chart/charts/notes.js';
import PerUserNotesChart from '@/core/chart/charts/per-user-notes.js';
import InstanceChart from '@/core/chart/charts/instance.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { ApRendererService } from '@/core/activitypub/ApRendererService.js';
import { ApDeliverManagerService } from '@/core/activitypub/ApDeliverManagerService.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { bindThis } from '@/decorators.js';
import { SearchService } from '@/core/SearchService.js';
import { ModerationLogService } from '@/core/ModerationLogService.js';
import { isQuote, isRenote } from '@/misc/is-renote.js';
import { IdService } from '@/core/IdService.js';

@Injectable()
export class NoteDeleteService {
	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.meta)
		private meta: MiMeta,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.instancesRepository)
		private instancesRepository: InstancesRepository,

		private userEntityService: UserEntityService,
		private globalEventService: GlobalEventService,
		private relayService: RelayService,
		private federatedInstanceService: FederatedInstanceService,
		private apRendererService: ApRendererService,
		private apDeliverManagerService: ApDeliverManagerService,
		private searchService: SearchService,
		private moderationLogService: ModerationLogService,
		private notesChart: NotesChart,
		private perUserNotesChart: PerUserNotesChart,
		private instanceChart: InstanceChart,
		private idService: IdService,
	) {}

	/**
	 * 投稿を削除します。
	 * @param user 投稿者
	 * @param note 投稿
	 */
	async delete(user: { id: MiUser['id']; uri: MiUser['uri']; host: MiUser['host']; isBot: MiUser['isBot']; }, note: MiNote, quiet = false, deleter?: MiUser) {
		const deletedAt = new Date();
		const cascadingNotes = await this.findCascadingNotes(note);

		if (note.replyId) {
			await this.notesRepository.decrement({ id: note.replyId }, 'repliesCount', 1);
		}

		if (!quiet) {
			this.globalEventService.publishNoteStream(note.id, 'deleted', {
				deletedAt: deletedAt,
			});

			//#region ローカルの投稿なら削除アクティビティを配送
			if (this.userEntityService.isLocalUser(user) && !note.localOnly) {
				let renote: MiNote | null = null;

				// if deleted note is renote
				if (isRenote(note) && !isQuote(note)) {
					renote = await this.notesRepository.findOneBy({
						id: note.renoteId,
					});
				}

				const content = this.apRendererService.addContext(renote
					? this.apRendererService.renderUndo(this.apRendererService.renderAnnounce(renote.uri ?? `${this.config.url}/notes/${renote.id}`, note), user)
					: this.apRendererService.renderDelete(this.apRendererService.renderTombstone(`${this.config.url}/notes/${note.id}`), user));

				this.deliverToConcerned(user, note, content);
			}

			// also deliver delete activity to cascaded notes
			const federatedLocalCascadingNotes = (cascadingNotes).filter(note => !note.localOnly && note.userHost == null); // filter out local-only notes
			for (const cascadingNote of federatedLocalCascadingNotes) {
				if (!cascadingNote.user) continue;
				if (!this.userEntityService.isLocalUser(cascadingNote.user)) continue;
				const content = this.apRendererService.addContext(this.apRendererService.renderDelete(this.apRendererService.renderTombstone(`${this.config.url}/notes/${cascadingNote.id}`), cascadingNote.user));
				this.deliverToConcerned(cascadingNote.user, cascadingNote, content);
			}
			//#endregion

			this.notesChart.update(note, false);
			if (this.meta.enableChartsForRemoteUser || (user.host == null)) {
				this.perUserNotesChart.update(user, note, false);
			}

			if (this.meta.enableStatsForFederatedInstances) {
				if (this.userEntityService.isRemoteUser(user)) {
					this.federatedInstanceService.fetchOrRegister(user.host).then(async i => {
						this.instancesRepository.decrement({ id: i.id }, 'notesCount', 1);
						if (this.meta.enableChartsForFederatedInstances) {
							this.instanceChart.updateNote(i.host, note, false);
						}
					});
				}
			}
		}

		for (const cascadingNote of cascadingNotes) {
			this.searchService.unindexNote(cascadingNote);
		}
		this.searchService.unindexNote(note);

		await this.notesRepository.delete({
			id: note.id,
			userId: user.id,
		});

		if (deleter && (note.userId !== deleter.id)) {
			const user = await this.usersRepository.findOneByOrFail({ id: note.userId });
			this.moderationLogService.log(deleter, 'deleteNote', {
				noteId: note.id,
				noteUserId: note.userId,
				noteUserUsername: user.username,
				noteUserHost: user.host,
				note: note,
			});
		}
	}

	/**
	 * 投稿をmake privateします。
	 * @param user 投稿者
	 * @param note 投稿
	 */
	async makePrivate(user: { id: MiUser['id']; uri: MiUser['uri']; host: MiUser['host']; isBot: MiUser['isBot']; }, note: MiNote, quiet = false, deleter?: MiUser) {
		if (this.userEntityService.isRemoteUser(user)) {
			// SKIP: should not make private for remote user
			return;
		}
		if (note.visibility === 'specified') {
			// SKIP: should not make private for already private note
			return;
		}
		const deletedAt = new Date();
		if (!quiet) {
			//#region ローカルの投稿なら削除アクティビティを配送
			if (this.userEntityService.isLocalUser(user) && !note.localOnly) {
				let renote: MiNote | null = null;
				this.globalEventService.publishNoteStream(note.id, 'madePrivate', {
					deletedAt: deletedAt,
				});
				// if deleted note is renote
				if (isRenote(note) && !isQuote(note)) {
					renote = await this.notesRepository.findOneBy({
						id: note.renoteId,
					});
				}
				const content = this.apRendererService.addContext(renote
					? this.apRendererService.renderUndo(this.apRendererService.renderAnnounce(renote.uri ?? `${this.config.url}/notes/${renote.id}`, note), user)
					: this.apRendererService.renderDelete(this.apRendererService.renderTombstone(`${this.config.url}/notes/${note.id}`), user));
				this.deliverToConcerned(user, note, content);
			}
		}
		this.searchService.unindexNote(note);
		await this.notesRepository.update(note.id, {
			visibility: 'specified',
		});
		// if (deleter && (note.userId !== deleter.id)) {
		// 	const user = await this.usersRepository.findOneByOrFail({ id: note.userId });
		// 	this.moderationLogService.log(deleter, 'deleteNote', {
		// 		noteId: note.id,
		// 		noteUserId: note.userId,
		// 		noteUserUsername: user.username,
		// 		noteUserHost: user.host,
		// 		note: note,
		// 	});
		// }
	}
	async makePrivateMany(user: { id: MiUser['id']; uri: MiUser['uri']; host: MiUser['host']; isBot: MiUser['isBot']; }, sinceDate: number, untilDate: number, countOnly = false) {
		const untilId = this.idService.gen(untilDate);
		const sinceId = this.idService.gen(sinceDate);
		const query = this.notesRepository.createQueryBuilder()
			.where('"userId" = :userId', { userId: user.id })
			.andWhere('NOT visibility = \'specified\'')
			.andWhere('id < :untilId', { untilId })
			.andWhere('id > :sinceId', { sinceId });
		if (countOnly) {
			return query.getCount();
		} else {
			if (await query.getCount() > 500) {
				throw new Error('too many notes');
			}
			const shouldMakePrivateNotes = await query.getMany();
			const chunkSize = 10;
			const chunkInterval = 60000; // 1 minutes

			for (let i = 0; i < shouldMakePrivateNotes.length; i += chunkSize) {
				const chunk = shouldMakePrivateNotes.slice(i, i + chunkSize);
				for (const note of chunk) {
					this.makePrivate(user, note);
				}
				if (i + chunkSize < shouldMakePrivateNotes.length) {
					await new Promise(resolve => setTimeout(resolve, chunkInterval));
				}
			}
			return shouldMakePrivateNotes.length;
		}
	}

	@bindThis
	private async findCascadingNotes(note: MiNote): Promise<MiNote[]> {
		const recursive = async (noteId: string): Promise<MiNote[]> => {
			const query = this.notesRepository.createQueryBuilder('note')
				.where('note.replyId = :noteId', { noteId })
				.orWhere(new Brackets(q => {
					q.where('note.renoteId = :noteId', { noteId })
						.andWhere('note.text IS NOT NULL');
				}))
				.leftJoinAndSelect('note.user', 'user');
			const replies = await query.getMany();

			return [
				replies,
				...await Promise.all(replies.map(reply => recursive(reply.id))),
			].flat();
		};

		const cascadingNotes: MiNote[] = await recursive(note.id);

		return cascadingNotes;
	}

	@bindThis
	private async getMentionedRemoteUsers(note: MiNote) {
		const where = [] as any[];

		// mention / reply / dm
		const uris = (JSON.parse(note.mentionedRemoteUsers) as IMentionedRemoteUsers).map(x => x.uri);
		if (uris.length > 0) {
			where.push(
				{ uri: In(uris) },
			);
		}

		// renote / quote
		if (note.renoteUserId) {
			where.push({
				id: note.renoteUserId,
			});
		}

		if (where.length === 0) return [];

		return await this.usersRepository.find({
			where,
		}) as MiRemoteUser[];
	}

	@bindThis
	private async getRenotedOrRepliedRemoteUsers(note: MiNote) {
		const query = this.notesRepository.createQueryBuilder('note')
			.leftJoinAndSelect('note.user', 'user')
			.where(new Brackets(qb => {
				qb.orWhere('note.renoteId = :renoteId', { renoteId: note.id });
				qb.orWhere('note.replyId = :replyId', { replyId: note.id });
			}))
			.andWhere({ userHost: Not(IsNull()) });
		const notes = await query.getMany() as (MiNote & { user: MiRemoteUser })[];
		const remoteUsers = notes.map(({ user }) => user);
		return remoteUsers;
	}

	@bindThis
	private async deliverToConcerned(user: { id: MiLocalUser['id']; host: null; }, note: MiNote, content: any) {
		this.apDeliverManagerService.deliverToFollowers(user, content);
		this.relayService.deliverToRelays(user, content);
		this.apDeliverManagerService.deliverToUsers(user, content, [
			...await this.getMentionedRemoteUsers(note),
			...await this.getRenotedOrRepliedRemoteUsers(note),
		]);
	}
}
