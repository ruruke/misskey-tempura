/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { notificationTypes, userExportableEntities } from '@/types.js';

const baseSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
		},
		createdAt: {
			type: 'string',
			optional: false, nullable: false,
			format: 'date-time',
		},
		type: {
			type: 'string',
			optional: false, nullable: false,
			enum: [...notificationTypes, 'reaction:grouped', 'renote:grouped', 'note:grouped'],
		},
	},
} as const;

export const packedNotificationSchema = {
	type: 'object',
	oneOf: [{
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['note'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['mention'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['reply'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['renote'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['quote'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['reaction'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
			reaction: {
				type: 'string',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['pollEnded'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['follow'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['unfollow'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['receiveFollowRequest'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['followRequestAccepted'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			message: {
				type: 'string',
				optional: false, nullable: true,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['followRequestRejected'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			message: {
				type: 'string',
				optional: false, nullable: true,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['blocked'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['unblocked'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['roleAssigned'],
			},
			role: {
				type: 'object',
				ref: 'Role',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['chatRoomInvitationReceived'],
			},
			invitation: {
				type: 'object',
				ref: 'ChatRoomInvitation',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['achievementEarned'],
			},
			achievement: {
				ref: 'AchievementName',
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['exportCompleted'],
			},
			exportedEntity: {
				type: 'string',
				optional: false, nullable: false,
				enum: userExportableEntities,
			},
			fileId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['login'],
			},
			ip: {
				type: 'string',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['loginFailed'],
			},
			ip: {
				type: 'string',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['createToken'],
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['createToken'],
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['app'],
			},
			body: {
				type: 'string',
				optional: false, nullable: false,
			},
			header: {
				type: 'string',
				optional: false, nullable: true,
			},
			icon: {
				type: 'string',
				optional: false, nullable: true,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['scheduledNotePosted'],
			},
			user: {
				type: 'object',
				ref: 'UserLite',
				optional: false, nullable: false,
			},
			userId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['scheduledNoteFailed'],
			},
			reason: {
				type: 'string',
				optional: false, nullable: false,
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['reaction:grouped'],
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
			reactions: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'object',
					properties: {
						user: {
							type: 'object',
							ref: 'UserLite',
							optional: false, nullable: false,
						},
						reaction: {
							type: 'string',
							optional: false, nullable: false,
						},
					},
					required: ['user', 'reaction'],
				},
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['renote:grouped'],
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
			users: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'object',
					ref: 'UserLite',
					optional: false, nullable: false,
				},
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['note:grouped'],
			},
			note: {
				type: 'object',
				ref: 'Note',
				optional: false, nullable: false,
			},
			users: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'object',
					ref: 'UserLite',
					optional: false, nullable: false,
				},
			},
		},
	}, {
		type: 'object',
		properties: {
			...baseSchema.properties,
			type: {
				type: 'string',
				optional: false, nullable: false,
				enum: ['test'],
			},
		},
	}],
} as const;
