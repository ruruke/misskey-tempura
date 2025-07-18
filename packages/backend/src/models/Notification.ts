/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { userExportableEntities } from '@/types.js';
import { MiUser } from './User.js';
import { MiNote } from './Note.js';
import { MiAccessToken } from './AccessToken.js';
import { MiRole } from './Role.js';
import { MiDriveFile } from './DriveFile.js';

export type MiNotification = {
	type: 'note';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
	noteId: MiNote['id'];
} | {
	type: 'follow';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
} | {
	type: 'unfollow';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
} | {
	type: 'mention';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
	noteId: MiNote['id'];
} | {
	type: 'reply';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
	noteId: MiNote['id'];
} | {
	type: 'renote';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
	noteId: MiNote['id'];
	targetNoteId: MiNote['id'];
} | {
	type: 'quote';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
	noteId: MiNote['id'];
} | {
	type: 'reaction';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
	noteId: MiNote['id'];
	reaction: string;
} | {
	type: 'pollEnded';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
	noteId: MiNote['id'];
} | {
	type: 'receiveFollowRequest';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
} | {
	type: 'followRequestAccepted';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
	message: string | null;
} | {
	type: 'followRequestRejected';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
	message: string | null;
} | {
	type: 'blocked';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
} | {
	type: 'unblocked';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
} | {
	type: 'roleAssigned';
	id: string;
	createdAt: string;
	roleId: MiRole['id'];
} | {
	type: 'chatRoomInvitationReceived';
	id: string;
	createdAt: string;
	notifierId: MiUser['id'];
	invitationId: string;
} | {
	type: 'achievementEarned';
	id: string;
	createdAt: string;
	achievement: string;
} | {
	type: 'exportCompleted';
	id: string;
	createdAt: string;
	exportedEntity: typeof userExportableEntities[number];
	fileId: MiDriveFile['id'];
} | {
	type: 'login';
	id: string;
	createdAt: string;
	userIp: string;
} | {
	type: 'loginFailed';
	id: string;
	createdAt: string;
	userIp: string;
} | {
	type: 'createToken';
	id: string;
	createdAt: string;
} | {
	type: 'createToken';
	id: string;
	createdAt: string;
} | {
	type: 'app';
	id: string;
	createdAt: string;

	/**
	 * アプリ通知のbody
	 */
	customBody: string;

	/**
	 * アプリ通知のheader
	 * (省略時はアプリ名で表示されることを期待)
	 */
	customHeader: string | null;

	/**
	 * アプリ通知のicon(URL)
	 * (省略時はアプリアイコンで表示されることを期待)
	 */
	customIcon: string | null;

	/**
	 * アプリ通知のアプリ(のトークン)
	 */
	appAccessTokenId: MiAccessToken['id'] | null;
} | {
	type: 'test';
	id: string;
	createdAt: string;
} | {
	type: 'scheduledNotePosted';
	id: string;
	createdAt: string;
	noteId: MiNote['id'];
} | {
	type: 'scheduledNoteFailed';
	id: string;
	createdAt: string;
	reason: string;
};

export type MiGroupedNotification = MiNotification | {
	type: 'reaction:grouped';
	id: string;
	createdAt: string;
	noteId: MiNote['id'];
	reactions: {
		userId: string;
		reaction: string;
	}[];
} | {
	type: 'renote:grouped';
	id: string;
	createdAt: string;
	noteId: MiNote['id'];
	userIds: string[];
} | {
	type: 'note:grouped';
	id: string;
	createdAt: string;
	noteIds: string[];
	notifierIds: MiUser['id'][];
};
