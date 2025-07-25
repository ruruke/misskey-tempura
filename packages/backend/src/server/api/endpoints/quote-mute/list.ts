/*
 * SPDX-FileCopyrightText: lqvp
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { QuoteMutingsRepository } from '@/models/_.js';
import { QueryService } from '@/core/QueryService.js';
import { QuoteMutingEntityService } from '@/core/entities/QuoteMutingEntityService.js';
import { DI } from '@/di-symbols.js';

export const meta = {
	tags: ['account'],

	requireCredential: true,

	kind: 'read:mutes',

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'QuoteMuting',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 30 },
		sinceId: { type: 'string', format: 'misskey:id' },
		untilId: { type: 'string', format: 'misskey:id' },
		sinceDate: { type: 'integer' },
		untilDate: { type: 'integer' },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.quoteMutingsRepository)
		private quoteMutingsRepository: QuoteMutingsRepository,

		private quoteMutingEntityService: QuoteMutingEntityService,
		private queryService: QueryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.queryService.makePaginationQuery(this.quoteMutingsRepository.createQueryBuilder('muting'), ps.sinceId, ps.untilId, ps.sinceDate, ps.untilDate)
				.andWhere('muting.muterId = :meId', { meId: me.id });

			const mutings = await query
				.limit(ps.limit)
				.getMany();

			return await this.quoteMutingEntityService.packMany(mutings, me);
		});
	}
}
