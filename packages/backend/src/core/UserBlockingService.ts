/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IdService } from '@/core/IdService.js';
import type { MiUser } from '@/models/User.js';
import type { MiBlocking } from '@/models/Blocking.js';
import type { MiMeta } from '@/models/Meta.js';
import { IdentifiableError } from '@/misc/identifiable-error.js';
import { QueueService } from '@/core/QueueService.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { NotificationService } from '@/core/NotificationService.js';
import { DI } from '@/di-symbols.js';
import type { FollowRequestsRepository, BlockingsRepository, UserListsRepository, UserListMembershipsRepository } from '@/models/_.js';
import Logger from '@/logger.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { ApRendererService } from '@/core/activitypub/ApRendererService.js';
import { LoggerService } from '@/core/LoggerService.js';
import { UserWebhookService } from '@/core/UserWebhookService.js';
import { bindThis } from '@/decorators.js';
import { CacheService } from '@/core/CacheService.js';
import { UserFollowingService } from '@/core/UserFollowingService.js';
import { RoleService } from '@/core/RoleService.js';
import { HistoryService } from '@/core/HistoryService.js';

@Injectable()
export class UserBlockingService implements OnModuleInit {
	private logger: Logger;
	private userFollowingService: UserFollowingService;

	constructor(
		private moduleRef: ModuleRef,

		@Inject(DI.meta)
		private serverSettings: MiMeta,

		@Inject(DI.followRequestsRepository)
		private followRequestsRepository: FollowRequestsRepository,

		@Inject(DI.blockingsRepository)
		private blockingsRepository: BlockingsRepository,

		@Inject(DI.userListsRepository)
		private userListsRepository: UserListsRepository,

		@Inject(DI.userListMembershipsRepository)
		private userListMembershipsRepository: UserListMembershipsRepository,

		private roleService: RoleService,
		private cacheService: CacheService,
		private userEntityService: UserEntityService,
		private idService: IdService,
		private queueService: QueueService,
		private globalEventService: GlobalEventService,
		private notificationService: NotificationService,
		private webhookService: UserWebhookService,
		private apRendererService: ApRendererService,
		private loggerService: LoggerService,
		private historyService: HistoryService,
	) {
		this.logger = this.loggerService.getLogger('user-block');
	}

	onModuleInit() {
		this.userFollowingService = this.moduleRef.get('UserFollowingService');
	}

	@bindThis
	public async block(blocker: MiUser, blockee: MiUser, silent = false) {
		// フォロー解除できない（＝ブロックもできない）ユーザーの場合
		if (
			blocker.host == null &&
			this.serverSettings.forciblyFollowedUsers.includes(blockee.id) &&
			!await this.roleService.isModerator(blocker)
		) {
			throw new IdentifiableError('e2f04d25-0d94-4ac3-a4d8-ba401062741b', 'You cannot block that user due to server policy.');
		}

		await Promise.all([
			this.cancelRequest(blocker, blockee, silent),
			this.cancelRequest(blockee, blocker, silent),
			this.userFollowingService.unfollow(blocker, blockee, silent),
			this.userFollowingService.unfollow(blockee, blocker, silent),
			this.removeFromList(blockee, blocker),
		]);

		const blocking = {
			id: this.idService.gen(),
			blocker,
			blockerId: blocker.id,
			blockee,
			blockeeId: blockee.id,
		} as MiBlocking;

		await this.blockingsRepository.insert(blocking);

		this.cacheService.userBlockingCache.refresh(blocker.id);
		this.cacheService.userBlockedCache.refresh(blockee.id);

		this.globalEventService.publishInternalEvent('blockingCreated', {
			blockerId: blocker.id,
			blockeeId: blockee.id,
		});

		if (this.userEntityService.isLocalUser(blocker) && this.userEntityService.isRemoteUser(blockee)) {
			const content = this.apRendererService.addContext(this.apRendererService.renderBlock(blocking));
			this.queueService.deliver(blocker, content, blockee.inbox, false);
		}

		const policies = await this.roleService.getUserPolicies(blockee.id);

		// 通知を作成（ブロックされた側に通知）
		if (this.userEntityService.isLocalUser(blockee) && policies.canUseBlockedNotification) {
			this.notificationService.createNotification(blockee.id, 'blocked', {
			}, blocker.id);
		}

		await this.historyService.addBlockHistory(blocker, blockee);
	}

	@bindThis
	private async cancelRequest(follower: MiUser, followee: MiUser, silent = false) {
		const request = await this.followRequestsRepository.findOneBy({
			followeeId: followee.id,
			followerId: follower.id,
		});

		if (request == null) {
			return;
		}

		await this.followRequestsRepository.delete({
			followeeId: followee.id,
			followerId: follower.id,
		});

		if (this.userEntityService.isLocalUser(followee)) {
			this.userEntityService.pack(followee, followee, {
				schema: 'MeDetailed',
			}).then(packed => this.globalEventService.publishMainStream(followee.id, 'meUpdated', packed));
		}

		if (this.userEntityService.isLocalUser(follower) && !silent) {
			this.userEntityService.pack(followee, follower, {
				schema: 'UserDetailedNotMe',
			}).then(async packed => {
				this.globalEventService.publishMainStream(follower.id, 'unfollow', packed);
				this.webhookService.enqueueUserWebhook(follower.id, 'unfollow', { user: packed });
			});
		}

		// リモートにフォローリクエストをしていたらUndoFollow送信
		if (this.userEntityService.isLocalUser(follower) && this.userEntityService.isRemoteUser(followee)) {
			const content = this.apRendererService.addContext(this.apRendererService.renderUndo(this.apRendererService.renderFollow(follower, followee), follower));
			this.queueService.deliver(follower, content, followee.inbox, false);
		}

		// リモートからフォローリクエストを受けていたらReject送信
		if (this.userEntityService.isRemoteUser(follower) && this.userEntityService.isLocalUser(followee)) {
			const content = this.apRendererService.addContext(this.apRendererService.renderReject(this.apRendererService.renderFollow(follower, followee, request.requestId!), followee));
			this.queueService.deliver(followee, content, follower.inbox, false);
		}
	}

	@bindThis
	private async removeFromList(listOwner: MiUser, user: MiUser) {
		const userLists = await this.userListsRepository.findBy({
			userId: listOwner.id,
		});

		for (const userList of userLists) {
			await this.userListMembershipsRepository.delete({
				userListId: userList.id,
				userId: user.id,
			});
		}
	}

	@bindThis
	public async unblock(blocker: MiUser, blockee: MiUser) {
		const blocking = await this.blockingsRepository.findOneBy({
			blockerId: blocker.id,
			blockeeId: blockee.id,
		});

		if (blocking == null) {
			this.logger.warn('ブロック解除がリクエストされましたがブロックしていませんでした');
			return;
		}

		// Since we already have the blocker and blockee, we do not need to fetch
		// them in the query above and can just manually insert them here.
		blocking.blocker = blocker;
		blocking.blockee = blockee;

		await this.blockingsRepository.delete(blocking.id);

		this.cacheService.userBlockingCache.refresh(blocker.id);
		this.cacheService.userBlockedCache.refresh(blockee.id);

		this.globalEventService.publishInternalEvent('blockingDeleted', {
			blockerId: blocker.id,
			blockeeId: blockee.id,
		});

		// deliver if remote bloking
		if (this.userEntityService.isLocalUser(blocker) && this.userEntityService.isRemoteUser(blockee)) {
			const content = this.apRendererService.addContext(this.apRendererService.renderUndo(this.apRendererService.renderBlock(blocking), blocker));
			this.queueService.deliver(blocker, content, blockee.inbox, false);
		}

		const policies = await this.roleService.getUserPolicies(blockee.id);

		// 通知を作成（ブロック解除された側に通知）
		if (this.userEntityService.isLocalUser(blockee) && policies.canUseUnBlockedNotification) {
			this.notificationService.createNotification(blockee.id, 'unblocked', {
			}, blocker.id);
		}

		await this.historyService.addUnblockHistory(blocker, blockee);
	}

	@bindThis
	public async checkBlocked(blockerId: MiUser['id'], blockeeId: MiUser['id']): Promise<boolean> {
		return (await this.cacheService.userBlockingCache.fetch(blockerId)).has(blockeeId);
	}
}
