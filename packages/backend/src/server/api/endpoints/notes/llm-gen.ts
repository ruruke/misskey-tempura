/*
 * SPDX-FileCopyrightText: lqvp
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import ms from 'ms';
import { Inject, Injectable } from '@nestjs/common';
import type { MiMeta } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { RoleService } from '@/core/RoleService.js';
import { HttpRequestService } from '@/core/HttpRequestService.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['notes'],

	requireCredential: true,
	requireRolePolicy: 'canUseGeminiLLMAPI',

	kind: 'write:notes',

	limit: {
		duration: ms('1hour'),
		max: 30,
		minInterval: ms('10sec'),
	},

	errors: {
		emptyText: {
			message: 'Text is empty.',
			code: 'EMPTY_TEXT',
			id: '7bfbaf47-52fe-42fb-9b13-0626265cef21',
		},

		emptyPrompt: {
			message: 'Prompt is empty.',
			code: 'EMPTY_PROMPT',
			id: 'b27d240a-5fd4-41af-9346-286b22f08eab',
		},

		llmApiError: {
			message: 'LLM API error: {0}',
			code: 'LLM_API_ERROR',
			id: '7767ca48-e402-426e-8583-75091f5337eb',
		},

		llmNotEnabled: {
			message: 'Server LLM feature is not enabled',
			code: 'LLM_NOT_ENABLED',
			id: '58f1cb83-fb0b-47be-9dc8-0cf39ecf44e2',
		},

		accessDenied: {
			message: 'Access denied. Requires canUseGeminiLLMAPI role.',
			code: 'ACCESS_DENIED',
			id: '5eb8d909-2540-4970-90b8-dd6f86088121',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		text: { type: 'string' },
		prompt: { type: 'string' },
		fileUris: {
			type: 'array',
			nullable: true,
			items: {
				type: 'object',
				properties: {
					mimeType: { type: 'string' },
					fileUri: { type: 'string' },
				},
				required: ['mimeType', 'fileUri'],
			},
		},
	},
	required: ['text', 'prompt'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.meta)
		private serverSettings: MiMeta,

		private httpRequestService: HttpRequestService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const policies = await this.roleService.getUserPolicies(me.id);

			if (!policies.canUseGeminiLLMAPI) {
				throw new ApiError(meta.errors.accessDenied);
			}

			if (ps.text == null || ps.text === '') {
				throw new ApiError(meta.errors.emptyText);
			}

			if (ps.prompt == null || ps.prompt === '') {
				throw new ApiError(meta.errors.emptyPrompt);
			}

			// metaからサーバー設定を取得
			const serverGeminiEnabled = this.serverSettings.serverGeminiEnabled;
			const serverGeminiApiKey = this.serverSettings.serverGeminiApiKey;
			const serverGeminiModels = this.serverSettings.serverGeminiModels;

			if (!serverGeminiEnabled) {
				throw new ApiError(meta.errors.llmNotEnabled);
			}

			if (!serverGeminiApiKey) {
				throw new ApiError(meta.errors.llmApiError, 'Gemini API key is not configured on server');
			}

			// リクエストボディのコンテンツ部分を作成
			const parts: any[] = [{ text: ps.text }];

			// ファイルURIがある場合は追加
			if (ps.fileUris && ps.fileUris.length > 0) {
				for (const fileInfo of ps.fileUris) {
					parts.push({
						file_data: {
							mime_type: fileInfo.mimeType,
							file_uri: fileInfo.fileUri,
						},
					});
				}
			}

			// リクエストボディの作成
			const requestBody = JSON.stringify({
				system_instruction: {
					parts: [{ text: ps.prompt }],
				},
				contents: [{
					parts: parts,
				}],
			});

			// Gemini APIへのリクエスト
			try {
				const url = `https://generativelanguage.googleapis.com/v1beta/models/${serverGeminiModels}:generateContent?key=${serverGeminiApiKey}`;

				const response = await this.httpRequestService.send(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: requestBody,
					timeout: 30000, // 30秒タイムアウト
					isLocalAddressAllowed: false,
				}, {
					throwErrorWhenResponseNotOk: true,
				});

				// JSONレスポンスを返す
				const responseData = await response.json();
				return responseData;
			} catch (error) {
				// エラーの詳細を記録
				console.error('LLM API error:', error);
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				throw new ApiError(meta.errors.llmApiError, errorMessage);
			}
		});
	}
}
