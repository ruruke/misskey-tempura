/*
 * SPDX-FileCopyrightText: lqvp
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const packedQuoteMutingSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
			example: 'xxxxxxxxxx',
		},
		createdAt: {
			type: 'string',
			optional: false, nullable: false,
			format: 'date-time',
		},
		muteeId: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
		},
		mutee: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'UserDetailedNotMe',
		},
	},
} as const;
