/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { RegistrationTicketsRepository } from '@/models/_.js';
import { InviteCodeEntityService } from '@/core/entities/InviteCodeEntityService.js';
import { IdService } from '@/core/IdService.js';
import { DI } from '@/di-symbols.js';
import { generateInviteCode } from '@/misc/generate-invite-code.js';
import { ModerationLogService } from '@/core/ModerationLogService.js';
import { ApiError } from '../../../error.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireAdmin: true,
	kind: 'write:admin:invite-codes',

	errors: {
		invalidDateTime: {
			message: 'Invalid date-time format',
			code: 'INVALID_DATE_TIME',
			id: 'f1380b15-3760-4c6c-a1db-5c3aaf1cbd49',
		},
	},

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'InviteCode',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		count: { type: 'integer', minimum: 1, maximum: 100, default: 1 },
		expiresAt: { type: 'string', nullable: true },
		skipEmailAuth: { type: 'boolean', default: false },
		skipApproval: { type: 'boolean', default: false },
		description: { type: 'string', nullable: true, maxLength: 256 },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.registrationTicketsRepository)
		private registrationTicketsRepository: RegistrationTicketsRepository,

		private inviteCodeEntityService: InviteCodeEntityService,
		private idService: IdService,
		private moderationLogService: ModerationLogService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (ps.expiresAt && isNaN(Date.parse(ps.expiresAt))) {
				throw new ApiError(meta.errors.invalidDateTime);
			}

			const ticketsPromises = [];

			for (let i = 0; i < ps.count; i++) {
				ticketsPromises.push(this.registrationTicketsRepository.insertOne({
					id: this.idService.gen(),
					createdBy: me,
					createdById: me.id,
					expiresAt: ps.expiresAt ? new Date(ps.expiresAt) : null,
					code: generateInviteCode(),
					skipEmailAuth: ps.skipEmailAuth,
					skipApproval: ps.skipApproval,
					description: ps.description?.trim() ? ps.description : null,
				}));
			}

			const tickets = await Promise.all(ticketsPromises);

			this.moderationLogService.log(me, 'createInvitation', {
				invitations: tickets,
			});

			return await this.inviteCodeEntityService.packMany(tickets, me);
		});
	}
}
