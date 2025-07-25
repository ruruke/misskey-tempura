/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * note - 通知オンにしているユーザーが投稿した
 * follow - フォローされた
 * unfollow - フォロー解除された
 * mention - 投稿で自分が言及された
 * reply - 投稿に返信された
 * renote - 投稿がRenoteされた
 * quote - 投稿が引用Renoteされた
 * reaction - 投稿にリアクションされた
 * pollEnded - 自分のアンケートもしくは自分が投票したアンケートが終了した
 * receiveFollowRequest - フォローリクエストされた
 * followRequestAccepted - 自分の送ったフォローリクエストが承認された
 * followRequestRejected - 自分の送ったフォローリクエストが拒否された
 * blocked - ブロックされた
 * unblocked - ブロック解除された
 * roleAssigned - ロールが付与された
 * chatRoomInvitationReceived - チャットルームに招待された
 * achievementEarned - 実績を獲得
 * exportCompleted - エクスポートが完了
 * login - ログイン
 * loginFailed - ログインに失敗
 * createToken - トークン作成
 * scheduledNotePosted - 予約投稿をノート
 * scheduledNoteFailed - 予約投稿に失敗
 * app - アプリ通知
 * test - テスト通知（サーバー側）
 */
export const notificationTypes = [
	'note',
	'follow',
	'unfollow',
	'mention',
	'reply',
	'renote',
	'quote',
	'reaction',
	'pollEnded',
	'receiveFollowRequest',
	'followRequestAccepted',
	'followRequestRejected',
	'blocked',
	'unblocked',
	'roleAssigned',
	'chatRoomInvitationReceived',
	'achievementEarned',
	'exportCompleted',
	'login',
	'loginFailed',
	'createToken',
	'scheduledNotePosted',
	'scheduledNoteFailed',
	'app',
	'test',
] as const;

export const groupedNotificationTypes = [
	...notificationTypes,
	'reaction:grouped',
	'renote:grouped',
	'note:grouped',
] as const;

export const obsoleteNotificationTypes = ['pollVote', 'groupInvited'] as const;

export const noteVisibilities = ['public', 'public_non_ltl', 'home', 'followers', 'specified'] as const;

export const noteReactionAcceptances = ['likeOnly', 'likeOnlyForRemote', 'nonSensitiveOnly', 'nonSensitiveOnlyForLocalLikeOnlyForRemote', null] as const;

export const mutedNoteReasons = ['word', 'manual', 'spam', 'other'] as const;

export const followingVisibilities = ['public', 'followers', 'private'] as const;
export const followersVisibilities = ['public', 'followers', 'private'] as const;

/**
 * ユーザーがエクスポートできるものの種類
 *
 * （主にエクスポート完了通知で使用するものであり、既存のDBの名称等と必ずしも一致しない）
 */
export const userExportableEntities = ['antenna', 'blocking', 'clip', 'customEmoji', 'favorite', 'following', 'muting', 'note', 'userList'] as const;

/**
 * ユーザーがインポートできるものの種類
 *
 * （主にインポート完了通知で使用するものであり、既存のDBの名称等と必ずしも一致しない）
 */
export const userImportableEntities = ['antenna', 'blocking', 'customEmoji', 'following', 'muting', 'userList'] as const;

export const moderationLogTypes = [
	'updateServerSettings',
	'suspend',
	'unsuspend',
	'updateUserName',
	'updateUserNote',
	'sendNotification',
	'addCustomEmoji',
	'updateCustomEmoji',
	'deleteCustomEmoji',
	'assignRole',
	'unassignRole',
	'createRole',
	'updateRole',
	'deleteRole',
	'clearQueue',
	'promoteQueue',
	'deleteDriveFile',
	'deleteNote',
	'createGlobalAnnouncement',
	'createUserAnnouncement',
	'createRolesAnnouncement',
	'updateGlobalAnnouncement',
	'updateUserAnnouncement',
	'updateRolesAnnouncement',
	'deleteGlobalAnnouncement',
	'deleteUserAnnouncement',
	'deleteRolesAnnouncement',
	'resetPassword',
	'regenerateUserToken',
	'suspendRemoteInstance',
	'unsuspendRemoteInstance',
	'updateRemoteInstanceNote',
	'markSensitiveDriveFile',
	'unmarkSensitiveDriveFile',
	'resolveAbuseReport',
	'forwardAbuseReport',
	'updateAbuseReportNote',
	'createInvitation',
	'createAd',
	'updateAd',
	'deleteAd',
	'createAvatarDecoration',
	'updateAvatarDecoration',
	'deleteAvatarDecoration',
	'unsetUserAvatar',
	'unsetUserBanner',
	'createSystemWebhook',
	'updateSystemWebhook',
	'deleteSystemWebhook',
	'createAbuseReportNotificationRecipient',
	'updateAbuseReportNotificationRecipient',
	'deleteAbuseReportNotificationRecipient',
	'deleteAccount',
	'deletePage',
	'deleteFlash',
	'deleteGalleryPost',
	'deleteChatRoom',
	'updateProxyAccountDescription',
	'approve',
	'decline',
	'quarantineRemoteInstance',
	'unquarantineRemoteInstance',
	'dropAllNotes',
	'unsetUserMutualLink',
] as const;

export type ModerationLogPayloads = {
	updateServerSettings: {
		before: any | null;
		after: any | null;
	};
	suspend: {
		userId: string;
		userUsername: string;
		userHost: string | null;
	};
	approve: {
		userId: string;
		userUsername: string;
		//userHost: string | null; // User approval is local action
	};
	decline: {
		userId: string;
		userUsername: string;
		// userHost: string | null; // User approval is local action
		reason: string | null;
	};
	unsuspend: {
		userId: string;
		userUsername: string;
		userHost: string | null;
	};
	updateUserName: {
		userId: string;
		userUsername: string;
		userHost: string | null;
		before: string | null;
		after: string | null;
	};
	updateUserNote: {
		userId: string;
		userUsername: string;
		userHost: string | null;
		before: string | null;
		after: string | null;
	};
	sendNotification: {
		userId: string;
		userUsername: string;
		userHost: string | null;
		text: string;
	};
	addCustomEmoji: {
		emojiId: string;
		emoji: any;
	};
	updateCustomEmoji: {
		emojiId: string;
		before: any;
		after: any;
	};
	deleteCustomEmoji: {
		emojiId: string;
		emoji: any;
	};
	assignRole: {
		userId: string;
		userUsername: string;
		userHost: string | null;
		roleId: string;
		roleName: string;
		expiresAt: string | null;
	};
	unassignRole: {
		userId: string;
		userUsername: string;
		userHost: string | null;
		roleId: string;
		roleName: string;
	};
	createRole: {
		roleId: string;
		role: any;
	};
	updateRole: {
		roleId: string;
		before: any;
		after: any;
	};
	deleteRole: {
		roleId: string;
		role: any;
	};
	clearQueue: Record<string, never>;
	promoteQueue: Record<string, never>;
	deleteDriveFile: {
		fileId: string;
		fileUserId: string | null;
		fileUserUsername: string | null;
		fileUserHost: string | null;
	};
	deleteNote: {
		noteId: string;
		noteUserId: string;
		noteUserUsername: string;
		noteUserHost: string | null;
		note: any;
	};
	createGlobalAnnouncement: {
		announcementId: string;
		announcement: any;
	};
	createUserAnnouncement: {
		announcementId: string;
		announcement: any;
		userId: string;
		userUsername: string;
		userHost: string | null;
	};
	createRolesAnnouncement: {
		announcementId: string;
		announcement: any;
		roleIds: string[];
		roles: any[];
	};
	updateGlobalAnnouncement: {
		announcementId: string;
		before: any;
		after: any;
	};
	updateUserAnnouncement: {
		announcementId: string;
		before: any;
		after: any;
		userId: string;
		userUsername: string;
		userHost: string | null;
	};
	updateRolesAnnouncement: {
		announcementId: string;
		before: any;
		after: any;
		roleIds: string[];
		roles: any[];
	};
	deleteGlobalAnnouncement: {
		announcementId: string;
		announcement: any;
	};
	deleteUserAnnouncement: {
		announcementId: string;
		announcement: any;
		userId: string;
		userUsername: string;
		userHost: string | null;
	};
	deleteRolesAnnouncement: {
		announcementId: string;
		announcement: any;
		roleIds: string[];
		roles: any[];
	};
	resetPassword: {
		userId: string;
		userUsername: string;
		userHost: string | null;
	};
	regenerateUserToken: {
		userId: string;
		userUsername: string;
		userHost: string | null;
	};
	suspendRemoteInstance: {
		id: string;
		host: string;
	};
	unsuspendRemoteInstance: {
		id: string;
		host: string;
	};
	updateRemoteInstanceNote: {
		id: string;
		host: string;
		before: string | null;
		after: string | null;
	};
	markSensitiveDriveFile: {
		fileId: string;
		fileUserId: string | null;
		fileUserUsername: string | null;
		fileUserHost: string | null;
	};
	unmarkSensitiveDriveFile: {
		fileId: string;
		fileUserId: string | null;
		fileUserUsername: string | null;
		fileUserHost: string | null;
	};
	resolveAbuseReport: {
		reportId: string;
		report: any;
		forwarded?: boolean;
		resolvedAs?: string | null;
	};
	forwardAbuseReport: {
		reportId: string;
		report: any;
	};
	updateAbuseReportNote: {
		reportId: string;
		report: any;
		before: string;
		after: string;
	};
	createInvitation: {
		invitations: any[];
	};
	createAd: {
		adId: string;
		ad: any;
	};
	updateAd: {
		adId: string;
		before: any;
		after: any;
	};
	deleteAd: {
		adId: string;
		ad: any;
	};
	createAvatarDecoration: {
		avatarDecorationId: string;
		avatarDecoration: any;
	};
	updateAvatarDecoration: {
		avatarDecorationId: string;
		before: any;
		after: any;
	};
	deleteAvatarDecoration: {
		avatarDecorationId: string;
		avatarDecoration: any;
	};
	unsetUserAvatar: {
		userId: string;
		userUsername: string;
		userHost: string | null;
		fileId: string;
	};
	unsetUserBanner: {
		userId: string;
		userUsername: string;
		userHost: string | null;
		fileId: string;
	};
	createSystemWebhook: {
		systemWebhookId: string;
		webhook: any;
	};
	updateSystemWebhook: {
		systemWebhookId: string;
		before: any;
		after: any;
	};
	deleteSystemWebhook: {
		systemWebhookId: string;
		webhook: any;
	};
	createAbuseReportNotificationRecipient: {
		recipientId: string;
		recipient: any;
	};
	updateAbuseReportNotificationRecipient: {
		recipientId: string;
		before: any;
		after: any;
	};
	deleteAbuseReportNotificationRecipient: {
		recipientId: string;
		recipient: any;
	};
	deleteAccount: {
		userId: string;
		userUsername: string;
		userHost: string | null;
	};
	deletePage: {
		pageId: string;
		pageUserId: string;
		pageUserUsername: string;
		page: any;
	};
	deleteFlash: {
		flashId: string;
		flashUserId: string;
		flashUserUsername: string;
		flash: any;
	};
	deleteGalleryPost: {
		postId: string;
		postUserId: string;
		postUserUsername: string;
		post: any;
	};
	deleteChatRoom: {
		roomId: string;
		room: any;
	};
	updateProxyAccountDescription: {
		before: string | null;
		after: string | null;
	};
	quarantineRemoteInstance: {
		id: string;
		host: string;
	};
	unquarantineRemoteInstance: {
		id: string;
		host: string;
	};
	dropAllNotes: {
		userId: string;
		userUsername: string;
		userHost: string | null;
	};
	unsetUserMutualLink: {
		userId: string;
		userUsername: string;
		userHost: string | null;
	};
};

export type Serialized<T> = {
	[K in keyof T]:
	T[K] extends Date
		? string
		: T[K] extends (Date | null)
			? (string | null)
			: T[K] extends Record<string, any>
				? Serialized<T[K]>
				: T[K] extends (Record<string, any> | null)
					? (Serialized<T[K]> | null)
					: T[K] extends (Record<string, any> | undefined)
						? (Serialized<T[K]> | undefined)
						: T[K];
};

export type FilterUnionByProperty<
	Union,
	Property extends string | number | symbol,
	Condition,
> = Union extends Record<Property, Condition> ? Union : never;

// Added for receiveSpecifiedNotesFrom feature
export const receiveSpecifiedNotesFromVisibilities = ['all', 'following', 'nobody'] as const;
