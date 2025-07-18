/*
 * SPDX-FileCopyrightText: lqvp
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import bcrypt from 'bcryptjs';
import { Inject, Injectable } from '@nestjs/common';
import type { UsersRepository, UserProfilesRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { TruncateAccountService } from '@/core/TruncateAccountService.js';
import { DI } from '@/di-symbols.js';
import { UserAuthService } from '@/core/UserAuthService.js';

export const meta = {
	requireCredential: true,
	secure: true,
	requireRolePolicy: 'canUseTruncate',
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		password: { type: 'string' },
		token: { type: 'string', nullable: true },
	},
	required: ['password'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		private userAuthService: UserAuthService,
		private truncateAccountService: TruncateAccountService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const token = ps.token;
			const profile = await this.userProfilesRepository.findOneByOrFail({ userId: me.id });

			if (profile.twoFactorEnabled) {
				if (token == null) {
					throw new Error('authentication failed');
				}

				try {
					await this.userAuthService.twoFactorAuthenticate(profile, token);
				} catch (e) {
					throw new Error('authentication failed');
				}
			}

			const userDetailed = await this.usersRepository.findOneByOrFail({ id: me.id });
			if (userDetailed.isDeleted) {
				return;
			}

			const passwordMatched = await bcrypt.compare(ps.password, profile.password!);
			if (!passwordMatched) {
				throw new Error('incorrect password');
			}

			await this.truncateAccountService.truncateAccount(me);
		});
	}
}
