/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import ms from 'ms';
import { Inject, Injectable } from '@nestjs/common';
import type { UsersRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { NoteDeleteService } from '@/core/NoteDeleteService.js';
import { DI } from '@/di-symbols.js';
import { GetterService } from '@/server/api/GetterService.js';
import { RoleService } from '@/core/RoleService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['notes'],

	requireCredential: true,
	requireRolePolicy: 'canUseMakePrivate',

	kind: 'write:notes',

	limit: {
		duration: ms('1hour'),
		max: 1,
		minInterval: ms('1hour'),
	},

	errors: {
		accessDenied: {
			message: 'Access denied.',
			code: 'ACCESS_DENIED',
			id: 'fe8d7103-0ea8-4ec3-814d-f8b401dc69e9',
		},
		tooManyNotes: {
			message: 'you can\'t make private > 500 notes',
			code: 'TOO_MANY_NOTES',
			id: 'c61acfd1-6efa-409e-a6d7-3424a3c8c150',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		untilDate: { type: 'integer' },
		sinceDate: { type: 'integer' },
	},
	required: ['untilDate', 'sinceDate'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		// private getterService: GetterService,
		// private roleService: RoleService,
		private noteDeleteService: NoteDeleteService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const sinceDate = ps.sinceDate || 0;
			const untilDate = ps.untilDate || Date.now();
			if (sinceDate > untilDate) { return 0; }
			try {
				return await this.noteDeleteService.makePrivateMany(me, sinceDate, untilDate);
			} catch (e) {
				throw new ApiError(meta.errors.tooManyNotes);
			}
		});
	}
}
