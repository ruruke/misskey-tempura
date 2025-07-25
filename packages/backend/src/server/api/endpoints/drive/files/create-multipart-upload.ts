/*
 * SPDX-FileCopyrightText: lqvp
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import ms from 'ms';
import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { MiMultipartUpload } from '@/models/MultipartUpload.js';
import type { MultipartUploadsRepository } from '@/models/_.js';
import { DriveFileEntityService } from '@/core/entities/DriveFileEntityService.js';
import { RoleService } from '@/core/RoleService.js';
import { IdService } from '@/core/IdService.js';
import { ApiError } from '../../../error.js';

export const meta = {
	tags: ['drive'],

	requireCredential: true,

	prohibitMoved: true,

	limit: {
		duration: ms('1hour'),
		max: 30,
	},

	kind: 'write:drive',

	description: 'Initiate a multipart upload to bypass Cloudflare\'s 100MB upload limit.',

	res: {
		type: 'object',
		optional: false, nullable: false,
		properties: {
			id: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
				example: 'xxxxxxxxxx',
			},
			expiresAt: {
				type: 'string',
				optional: false, nullable: false,
				format: 'date-time',
			},
		},
	},

	errors: {
		invalidFileName: {
			message: 'Invalid file name.',
			code: 'INVALID_FILE_NAME',
			id: 'f449b209-0c60-4e51-84d5-29486263bfd4',
		},
		noFreeSpace: {
			message: 'No free space.',
			code: 'NO_FREE_SPACE',
			id: 'c6244ed2-a39a-4e1c-bf93-f0fbd7764fa6',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		name: { type: 'string', nullable: true, default: null },
		folderId: { type: 'string', format: 'misskey:id', nullable: true, default: null },
		comment: { type: 'string', nullable: true, maxLength: 512, default: null },
		isSensitive: { type: 'boolean', default: false },
		force: { type: 'boolean', default: false },
		totalSize: { type: 'integer', minimum: 1 },
		totalParts: { type: 'integer', minimum: 1, maximum: 10000 }, // Maximum number of parts
	},
	required: ['totalSize', 'totalParts'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.multipartUploadsRepository)
		private multipartUploadsRepository: MultipartUploadsRepository,
		private driveFileEntityService: DriveFileEntityService,
		private roleService: RoleService,
		private idService: IdService,
	) {
		super(meta, paramDef, async (ps, me) => {
			// Check drive capacity before creating multipart upload
			const policies = await this.roleService.getUserPolicies(me.id);
			const driveCapacity = 1024 * 1024 * policies.driveCapacityMb;
			const currentUsage = await this.driveFileEntityService.calcDriveUsageOf(me.id);

			console.log(`Creating multipart upload: capacity=${driveCapacity}, usage=${currentUsage}, totalSize=${ps.totalSize}`);

			if (driveCapacity < currentUsage + ps.totalSize) {
				console.error(`Drive capacity exceeded: ${currentUsage + ps.totalSize} > ${driveCapacity}`);
				throw new ApiError(meta.errors.noFreeSpace);
			}

			// Get 'name' parameter
			let name = ps.name;
			if (name != null) {
				name = name.trim();
				if (name.length === 0) {
					name = null;
				} else if (name === 'blob') {
					name = null;
				}
			}

			// Create multipart upload record
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 24); // Expire after 24 hours

			const multipartUpload = await this.multipartUploadsRepository.insert({
				id: this.idService.gen(),
				userId: me.id,
				name: name,
				folderId: ps.folderId,
				comment: ps.comment,
				isSensitive: ps.isSensitive,
				force: ps.force,
				totalSize: ps.totalSize,
				totalParts: ps.totalParts,
				completedParts: 0,
				expiresAt: expiresAt,
				createdAt: new Date(),
			}).then(x => this.multipartUploadsRepository.findOneByOrFail({ id: x.identifiers[0].id }));

			return {
				id: multipartUpload.id,
				expiresAt: multipartUpload.expiresAt.toISOString(),
			};
		});
	}
}
