/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsNull } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import type { EmojisRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { EmojiEntityService } from '@/core/entities/EmojiEntityService.js';
import { DI } from '@/di-symbols.js';

export const meta = {
	tags: ['meta'],

	requireCredential: false,
	allowGet: true,
	cacheSec: 3600,

	res: {
		type: 'object',
		optional: false, nullable: false,
		ref: 'EmojiDetailed',
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		name: {
			type: 'string',
		},
	},
	required: ['name'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.emojisRepository)
		private emojisRepository: EmojisRepository,

		private emojiEntityService: EmojiEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			let emoji = undefined;
			const custom = /^([\w+-]+)(?:@([\w.-]+))?$/.exec(ps.name);
			if (custom && custom.length >= 3) {
				emoji = await this.emojisRepository.findOneOrFail({
					where: {
						name: custom[1],
						host: custom[2] === '.' ? IsNull() : (custom[2] ? custom[2] : IsNull()),
					},
				});
			} else {
				emoji = await this.emojisRepository.findOneOrFail({
					where: {
						name: ps.name,
						host: IsNull(),
					},
				});
			}

			return this.emojiEntityService.packDetailed(emoji);
		});
	}
}
