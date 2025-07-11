/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable, Inject } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { MiMeta } from '@/models/Meta.js';
import { ModerationLogService } from '@/core/ModerationLogService.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { MetaService } from '@/core/MetaService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireAdmin: true,
	kind: 'write:admin:meta',

	errors: {
		followedUserDuplicated: {
			message: 'Some items in "defaultFollowedUsers" and "forciblyFollowedUsers" are duplicated.',
			code: 'FOLLOWED_USER_DUPLICATED',
			id: 'bcf088ec-fec5-42d0-8b9e-16d3b4797a4d',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		disableRegistration: { type: 'boolean', nullable: true },
		pinnedUsers: {
			type: 'array', nullable: true, items: {
				type: 'string',
			},
		},
		hiddenTags: {
			type: 'array', nullable: true, items: {
				type: 'string',
			},
		},
		blockedHosts: {
			type: 'array', nullable: true, items: {
				type: 'string',
			},
		},
		sensitiveWords: {
			type: 'array', nullable: true, items: {
				type: 'string',
			},
		},
		prohibitedWords: {
			type: 'array', nullable: true, items: {
				type: 'string',
			},
		},
		prohibitedWordsForNameOfUser: {
			type: 'array', nullable: true, items: {
				type: 'string',
			},
		},
		themeColor: { type: 'string', nullable: true, pattern: '^#[0-9a-fA-F]{6}$' },
		mascotImageUrl: { type: 'string', nullable: true },
		bannerUrl: { type: 'string', nullable: true },
		serverErrorImageUrl: { type: 'string', nullable: true },
		infoImageUrl: { type: 'string', nullable: true },
		notFoundImageUrl: { type: 'string', nullable: true },
		youBlockedImageUrl: { type: 'string', nullable: true },
		iconUrl: { type: 'string', nullable: true },
		enableLongIconUrl: { type: 'boolean' },
		longIconUrl: { type: 'string', nullable: true },
		app192IconUrl: { type: 'string', nullable: true },
		app512IconUrl: { type: 'string', nullable: true },
		backgroundImageUrl: { type: 'string', nullable: true },
		backgroundImageUrls: { type: 'array', nullable: true },
		logoImageUrl: { type: 'string', nullable: true },
		name: { type: 'string', nullable: true },
		shortName: { type: 'string', nullable: true },
		description: { type: 'string', nullable: true },
		defaultLightTheme: { type: 'string', nullable: true },
		defaultDarkTheme: { type: 'string', nullable: true },
		cacheRemoteFiles: { type: 'boolean' },
		cacheRemoteSensitiveFiles: { type: 'boolean' },
		emailRequiredForSignup: { type: 'boolean' },
		approvalRequiredForSignup: { type: 'boolean' },
		enableHcaptcha: { type: 'boolean' },
		hcaptchaSiteKey: { type: 'string', nullable: true },
		hcaptchaSecretKey: { type: 'string', nullable: true },
		enableMcaptcha: { type: 'boolean' },
		mcaptchaSiteKey: { type: 'string', nullable: true },
		mcaptchaInstanceUrl: { type: 'string', nullable: true },
		mcaptchaSecretKey: { type: 'string', nullable: true },
		enableRecaptcha: { type: 'boolean' },
		recaptchaSiteKey: { type: 'string', nullable: true },
		recaptchaSecretKey: { type: 'string', nullable: true },
		enableTurnstile: { type: 'boolean' },
		turnstileSiteKey: { type: 'string', nullable: true },
		turnstileSecretKey: { type: 'string', nullable: true },
		enableTestcaptcha: { type: 'boolean' },
		googleAnalyticsMeasurementId: { type: 'string', nullable: true },
		sensitiveMediaDetection: { type: 'string', enum: ['none', 'all', 'local', 'remote'] },
		sensitiveMediaDetectionSensitivity: { type: 'string', enum: ['medium', 'low', 'high', 'veryLow', 'veryHigh'] },
		setSensitiveFlagAutomatically: { type: 'boolean' },
		enableSensitiveMediaDetectionForVideos: { type: 'boolean' },
		maintainerName: { type: 'string', nullable: true },
		maintainerEmail: { type: 'string', nullable: true },
		langs: {
			type: 'array', items: {
				type: 'string',
			},
		},
		deeplAuthKey: { type: 'string', nullable: true },
		deeplIsPro: { type: 'boolean' },
		enableEmail: { type: 'boolean' },
		email: { type: 'string', nullable: true },
		smtpSecure: { type: 'boolean' },
		smtpHost: { type: 'string', nullable: true },
		smtpPort: { type: 'integer', nullable: true },
		smtpUser: { type: 'string', nullable: true },
		smtpPass: { type: 'string', nullable: true },
		enableServiceWorker: { type: 'boolean' },
		swPublicKey: { type: 'string', nullable: true },
		swPrivateKey: { type: 'string', nullable: true },
		tosUrl: { type: 'string', nullable: true },
		repositoryUrl: { type: 'string', nullable: true },
		feedbackUrl: { type: 'string', nullable: true },
		impressumUrl: { type: 'string', nullable: true },
		privacyPolicyUrl: { type: 'string', nullable: true },
		inquiryUrl: { type: 'string', nullable: true },
		useObjectStorage: { type: 'boolean' },
		objectStorageBaseUrl: { type: 'string', nullable: true },
		objectStorageBucket: { type: 'string', nullable: true },
		objectStoragePrefix: { type: 'string', pattern: /^[a-zA-Z0-9-._]*$/.source, nullable: true },
		objectStoragePrefixForRemote: { type: 'string', nullable: true },
		objectStorageEndpoint: { type: 'string', nullable: true },
		objectStorageRegion: { type: 'string', nullable: true },
		objectStoragePort: { type: 'integer', nullable: true },
		objectStorageAccessKey: { type: 'string', nullable: true },
		objectStorageSecretKey: { type: 'string', nullable: true },
		objectStorageUseSSL: { type: 'boolean' },
		objectStorageUseProxy: { type: 'boolean' },
		objectStorageSetPublicRead: { type: 'boolean' },
		objectStorageS3ForcePathStyle: { type: 'boolean' },
		objectStorageCacheDays: { type: 'integer', nullable: true },
		enableIpLogging: { type: 'boolean' },
		enableActiveEmailValidation: { type: 'boolean' },
		enableVerifymailApi: { type: 'boolean' },
		verifymailAuthKey: { type: 'string', nullable: true },
		enableTruemailApi: { type: 'boolean' },
		truemailInstance: { type: 'string', nullable: true },
		truemailAuthKey: { type: 'string', nullable: true },
		enableChartsForRemoteUser: { type: 'boolean' },
		enableChartsForFederatedInstances: { type: 'boolean' },
		enableStatsForFederatedInstances: { type: 'boolean' },
		enableServerMachineStats: { type: 'boolean' },
		enableIdenticonGeneration: { type: 'boolean' },
		serverRules: { type: 'array', items: { type: 'string' } },
		bannedEmailDomains: { type: 'array', items: { type: 'string' } },
		emailWhitelist: { type: 'boolean' },
		preservedUsernames: { type: 'array', items: { type: 'string' } },
		manifestJsonOverride: { type: 'string' },
		enableFanoutTimeline: { type: 'boolean' },
		enableFanoutTimelineDbFallback: { type: 'boolean' },
		perLocalUserUserTimelineCacheMax: { type: 'integer' },
		perRemoteUserUserTimelineCacheMax: { type: 'integer' },
		perUserHomeTimelineCacheMax: { type: 'integer' },
		perUserListTimelineCacheMax: { type: 'integer' },
		enableReactionsBuffering: { type: 'boolean' },
		notesPerOneAd: { type: 'integer' },
		blockMentionsFromUnfamiliarRemoteUsers: { type: 'boolean' },
		validateMinimumUsernameLength: { type: 'integer', minimum: 1, maximum: 20 },
		useHanaEntrance: { type: 'boolean' },
		hanaThemeColor: { type: 'string' },
		hanaThemeAltColor: { type: 'string' },
		hanaThemeWeakOpacity: { type: 'number' },
		hanaModeIcon: { type: 'string', nullable: true },
		hanaModeIconSize: { type: 'number' },
		hanaModeIconRadius: { type: 'number' },
		hanaModeBackground: { type: 'string', nullable: true },
		silencedHosts: {
			type: 'array',
			nullable: true,
			items: {
				type: 'string',
			},
		},
		mediaSilencedHosts: {
			type: 'array',
			nullable: true,
			items: {
				type: 'string',
			},
		},
		summalyProxy: {
			type: 'string', nullable: true,
			description: '[Deprecated] Use "urlPreviewSummaryProxyUrl" instead.',
		},
		urlPreviewEnabled: { type: 'boolean' },
		urlPreviewAllowRedirect: { type: 'boolean' },
		urlPreviewTimeout: { type: 'integer' },
		urlPreviewMaximumContentLength: { type: 'integer' },
		urlPreviewRequireContentLength: { type: 'boolean' },
		urlPreviewUserAgent: { type: 'string', nullable: true },
		urlPreviewSummaryProxyUrl: { type: 'string', nullable: true },
		federation: {
			type: 'string',
			enum: ['all', 'none', 'specified'],
		},
		federationHosts: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		deliverSuspendedSoftware: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					software: { type: 'string' },
					versionRange: { type: 'string' },
				},
				required: ['software', 'versionRange'],
			},
		},
		singleUserMode: { type: 'boolean' },
		ugcVisibilityForVisitor: {
			type: 'string',
			enum: ['all', 'local', 'none'],
		},
		proxyRemoteFiles: { type: 'boolean' },
		signToActivityPubGet: { type: 'boolean' },
		allowExternalApRedirect: { type: 'boolean' },
		customSplashText: { type: 'array', nullable: true, items: {
			type: 'string',
		} },
		defaultFollowedUsers: {
			type: 'array', nullable: true, items: {
				type: 'string',
				format: 'misskey:id',
			},
		},
		forciblyFollowedUsers: {
			type: 'array', nullable: true, items: {
				type: 'string',
				format: 'misskey:id',
			},
		},
		deeplFreeMode: { type: 'boolean' },
		deeplFreeInstance: { type: 'string', nullable: true },
		enableCpuModel: { type: 'boolean' },
		customCpuModel: { type: 'string', nullable: true },
		enableCpuCore: { type: 'boolean' },
		customCpuCore: { type: 'integer', nullable: true },
		enableMemTotal: { type: 'boolean' },
		customMemTotal: { type: 'integer', nullable: true },
		enableFsTotal: { type: 'boolean' },
		customFsTotal: { type: 'integer', nullable: true },
		secondsPerSignup: { type: 'integer' },
		entranceShowTimeLine: { type: 'boolean' },
		entranceShowFeatured: { type: 'boolean' },
		entranceShowEmojis: { type: 'boolean' },
		entranceSelectEmojis: { type: 'array', items: { type: 'string' } },
		entranceShowStats: { type: 'boolean' },
		entranceShowFederation: { type: 'boolean' },
		entranceShowDashboard: { type: 'boolean' },
		entranceShowSignup: { type: 'boolean' },
		entranceShowAnotherInstance: { type: 'boolean' },
		entranceShowSignin: { type: 'boolean' },
		entranceMarginLeft: { type: 'integer' },
		entranceMarginRight: { type: 'integer' },
		entranceMarginTop: { type: 'integer' },
		entranceMarginBottom: { type: 'integer' },
		serverGeminiEnabled: { type: 'boolean' },
		serverGeminiApiKey: { type: 'string', nullable: true },
		serverGeminiModels: { type: 'string', nullable: false },
		customCursorUrl: { type: 'string', nullable: true },
		customCursorPointerUrl: { type: 'string', nullable: true },
		customCursorTextUrl: { type: 'string', nullable: true },
		customCursorProgressUrl: { type: 'string', nullable: true },
		customCursorWaitUrl: { type: 'string', nullable: true },
		// Contact Form Settings
		enableContactForm: { type: 'boolean' },
		contactFormLimit: { type: 'integer', minimum: 1, maximum: 10 },
		contactFormRequireAuth: { type: 'boolean' },
		contactFormCategories: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					key: { type: 'string', maxLength: 64 },
					text: { type: 'string', maxLength: 256 },
					enabled: { type: 'boolean' },
					order: { type: 'integer', minimum: 1 },
					isDefault: { type: 'boolean' },
				},
				required: ['key', 'text', 'enabled', 'order', 'isDefault'],
			},
		},
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.meta)
		private serverSettings: MiMeta,

		private metaService: MetaService,
		private moderationLogService: ModerationLogService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const set = {} as Partial<MiMeta>;

			if (typeof ps.disableRegistration === 'boolean') {
				set.disableRegistration = ps.disableRegistration;
			}

			if (Array.isArray(ps.pinnedUsers)) {
				set.pinnedUsers = ps.pinnedUsers.filter(Boolean);
			}

			if (Array.isArray(ps.hiddenTags)) {
				set.hiddenTags = ps.hiddenTags.filter(Boolean);
			}

			if (Array.isArray(ps.blockedHosts)) {
				set.blockedHosts = ps.blockedHosts.filter(Boolean).map(x => x.toLowerCase());
			}

			if (Array.isArray(ps.sensitiveWords)) {
				set.sensitiveWords = ps.sensitiveWords.filter(Boolean);
			}
			if (Array.isArray(ps.prohibitedWords)) {
				set.prohibitedWords = ps.prohibitedWords.filter(Boolean);
			}
			if (Array.isArray(ps.prohibitedWordsForNameOfUser)) {
				set.prohibitedWordsForNameOfUser = ps.prohibitedWordsForNameOfUser.filter(Boolean);
			}
			if (Array.isArray(ps.silencedHosts)) {
				let lastValue = '';
				set.silencedHosts = ps.silencedHosts.sort().filter((h) => {
					const lv = lastValue;
					lastValue = h;
					return h !== '' && h !== lv && !set.blockedHosts?.includes(h);
				});
			}
			if (Array.isArray(ps.mediaSilencedHosts)) {
				let lastValue = '';
				set.mediaSilencedHosts = ps.mediaSilencedHosts.sort().filter((h) => {
					const lv = lastValue;
					lastValue = h;
					return h !== '' && h !== lv && !set.blockedHosts?.includes(h);
				});
			}
			if (ps.themeColor !== undefined) {
				set.themeColor = ps.themeColor;
			}

			if (ps.mascotImageUrl !== undefined) {
				set.mascotImageUrl = ps.mascotImageUrl;
			}

			if (ps.bannerUrl !== undefined) {
				set.bannerUrl = ps.bannerUrl;
			}

			if (ps.iconUrl !== undefined) {
				set.iconUrl = ps.iconUrl;
			}

			if (ps.enableLongIconUrl !== undefined) {
				set.enableLongIconUrl = ps.enableLongIconUrl;
			}

			if (ps.longIconUrl !== undefined) {
				set.longIconUrl = ps.longIconUrl;
			}

			if (ps.app192IconUrl !== undefined) {
				set.app192IconUrl = ps.app192IconUrl;
			}

			if (ps.app512IconUrl !== undefined) {
				set.app512IconUrl = ps.app512IconUrl;
			}

			if (ps.serverErrorImageUrl !== undefined) {
				set.serverErrorImageUrl = ps.serverErrorImageUrl;
			}

			if (ps.infoImageUrl !== undefined) {
				set.infoImageUrl = ps.infoImageUrl;
			}

			if (ps.notFoundImageUrl !== undefined) {
				set.notFoundImageUrl = ps.notFoundImageUrl;
			}

			if (ps.youBlockedImageUrl !== undefined) {
				set.youBlockedImageUrl = ps.youBlockedImageUrl;
			}

			if (ps.backgroundImageUrl !== undefined) {
				set.backgroundImageUrl = ps.backgroundImageUrl;
			}

			if (ps.backgroundImageUrls !== undefined) {
				set.backgroundImageUrls = ps.backgroundImageUrls ?? [];
			}

			if (ps.logoImageUrl !== undefined) {
				set.logoImageUrl = ps.logoImageUrl;
			}

			if (ps.name !== undefined) {
				set.name = ps.name;
			}

			if (ps.shortName !== undefined) {
				set.shortName = ps.shortName;
			}

			if (ps.description !== undefined) {
				set.description = ps.description;
			}

			if (ps.defaultLightTheme !== undefined) {
				set.defaultLightTheme = ps.defaultLightTheme;
			}

			if (ps.defaultDarkTheme !== undefined) {
				set.defaultDarkTheme = ps.defaultDarkTheme;
			}

			if (ps.cacheRemoteFiles !== undefined) {
				set.cacheRemoteFiles = ps.cacheRemoteFiles;
			}

			if (ps.cacheRemoteSensitiveFiles !== undefined) {
				set.cacheRemoteSensitiveFiles = ps.cacheRemoteSensitiveFiles;
			}

			if (ps.emailRequiredForSignup !== undefined) {
				set.emailRequiredForSignup = ps.emailRequiredForSignup;
			}

			if (ps.approvalRequiredForSignup !== undefined) {
				set.approvalRequiredForSignup = ps.approvalRequiredForSignup;
			}

			if (ps.enableHcaptcha !== undefined) {
				set.enableHcaptcha = ps.enableHcaptcha;
			}

			if (ps.hcaptchaSiteKey !== undefined) {
				set.hcaptchaSiteKey = ps.hcaptchaSiteKey;
			}

			if (ps.hcaptchaSecretKey !== undefined) {
				set.hcaptchaSecretKey = ps.hcaptchaSecretKey;
			}

			if (ps.enableMcaptcha !== undefined) {
				set.enableMcaptcha = ps.enableMcaptcha;
			}

			if (ps.mcaptchaSiteKey !== undefined) {
				set.mcaptchaSitekey = ps.mcaptchaSiteKey;
			}

			if (ps.mcaptchaInstanceUrl !== undefined) {
				set.mcaptchaInstanceUrl = ps.mcaptchaInstanceUrl;
			}

			if (ps.mcaptchaSecretKey !== undefined) {
				set.mcaptchaSecretKey = ps.mcaptchaSecretKey;
			}

			if (ps.enableRecaptcha !== undefined) {
				set.enableRecaptcha = ps.enableRecaptcha;
			}

			if (ps.recaptchaSiteKey !== undefined) {
				set.recaptchaSiteKey = ps.recaptchaSiteKey;
			}

			if (ps.recaptchaSecretKey !== undefined) {
				set.recaptchaSecretKey = ps.recaptchaSecretKey;
			}

			if (ps.enableTurnstile !== undefined) {
				set.enableTurnstile = ps.enableTurnstile;
			}

			if (ps.turnstileSiteKey !== undefined) {
				set.turnstileSiteKey = ps.turnstileSiteKey;
			}

			if (ps.turnstileSecretKey !== undefined) {
				set.turnstileSecretKey = ps.turnstileSecretKey;
			}

			if (ps.enableTestcaptcha !== undefined) {
				set.enableTestcaptcha = ps.enableTestcaptcha;
			}

			if (ps.googleAnalyticsMeasurementId !== undefined) {
				// 空文字列をnullにしたいので??は使わない
				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				set.googleAnalyticsMeasurementId = ps.googleAnalyticsMeasurementId || null;
			}

			if (ps.sensitiveMediaDetection !== undefined) {
				set.sensitiveMediaDetection = ps.sensitiveMediaDetection;
			}

			if (ps.sensitiveMediaDetectionSensitivity !== undefined) {
				set.sensitiveMediaDetectionSensitivity = ps.sensitiveMediaDetectionSensitivity;
			}

			if (ps.setSensitiveFlagAutomatically !== undefined) {
				set.setSensitiveFlagAutomatically = ps.setSensitiveFlagAutomatically;
			}

			if (ps.enableSensitiveMediaDetectionForVideos !== undefined) {
				set.enableSensitiveMediaDetectionForVideos = ps.enableSensitiveMediaDetectionForVideos;
			}

			if (ps.maintainerName !== undefined) {
				set.maintainerName = ps.maintainerName;
			}

			if (ps.maintainerEmail !== undefined) {
				set.maintainerEmail = ps.maintainerEmail;
			}

			if (Array.isArray(ps.langs)) {
				set.langs = ps.langs.filter(Boolean);
			}

			if (ps.enableEmail !== undefined) {
				set.enableEmail = ps.enableEmail;
			}

			if (ps.email !== undefined) {
				set.email = ps.email;
			}

			if (ps.smtpSecure !== undefined) {
				set.smtpSecure = ps.smtpSecure;
			}

			if (ps.smtpHost !== undefined) {
				set.smtpHost = ps.smtpHost;
			}

			if (ps.smtpPort !== undefined) {
				set.smtpPort = ps.smtpPort;
			}

			if (ps.smtpUser !== undefined) {
				set.smtpUser = ps.smtpUser;
			}

			if (ps.smtpPass !== undefined) {
				set.smtpPass = ps.smtpPass;
			}

			if (ps.enableServiceWorker !== undefined) {
				set.enableServiceWorker = ps.enableServiceWorker;
			}

			if (ps.swPublicKey !== undefined) {
				set.swPublicKey = ps.swPublicKey;
			}

			if (ps.swPrivateKey !== undefined) {
				set.swPrivateKey = ps.swPrivateKey;
			}

			if (ps.tosUrl !== undefined) {
				set.termsOfServiceUrl = ps.tosUrl;
			}

			if (ps.repositoryUrl !== undefined) {
				set.repositoryUrl = URL.canParse(ps.repositoryUrl!) ? ps.repositoryUrl : null;
			}

			if (ps.feedbackUrl !== undefined) {
				set.feedbackUrl = ps.feedbackUrl;
			}

			if (ps.impressumUrl !== undefined) {
				set.impressumUrl = ps.impressumUrl;
			}

			if (ps.privacyPolicyUrl !== undefined) {
				set.privacyPolicyUrl = ps.privacyPolicyUrl;
			}

			if (ps.inquiryUrl !== undefined) {
				set.inquiryUrl = ps.inquiryUrl;
			}

			if (ps.useObjectStorage !== undefined) {
				set.useObjectStorage = ps.useObjectStorage;
			}

			if (ps.objectStorageBaseUrl !== undefined) {
				set.objectStorageBaseUrl = ps.objectStorageBaseUrl;
			}

			if (ps.objectStorageBucket !== undefined) {
				set.objectStorageBucket = ps.objectStorageBucket;
			}

			if (ps.objectStoragePrefix !== undefined) {
				set.objectStoragePrefix = ps.objectStoragePrefix;
			}

			if (ps.objectStoragePrefixForRemote !== undefined) {
				set.objectStoragePrefixForRemote = ps.objectStoragePrefixForRemote;
			}

			if (ps.objectStorageEndpoint !== undefined) {
				set.objectStorageEndpoint = ps.objectStorageEndpoint;
			}

			if (ps.objectStorageRegion !== undefined) {
				set.objectStorageRegion = ps.objectStorageRegion;
			}

			if (ps.objectStoragePort !== undefined) {
				set.objectStoragePort = ps.objectStoragePort;
			}

			if (ps.objectStorageAccessKey !== undefined) {
				set.objectStorageAccessKey = ps.objectStorageAccessKey;
			}

			if (ps.objectStorageSecretKey !== undefined) {
				set.objectStorageSecretKey = ps.objectStorageSecretKey;
			}

			if (ps.objectStorageUseSSL !== undefined) {
				set.objectStorageUseSSL = ps.objectStorageUseSSL;
			}

			if (ps.objectStorageUseProxy !== undefined) {
				set.objectStorageUseProxy = ps.objectStorageUseProxy;
			}

			if (ps.objectStorageSetPublicRead !== undefined) {
				set.objectStorageSetPublicRead = ps.objectStorageSetPublicRead;
			}

			if (ps.objectStorageS3ForcePathStyle !== undefined) {
				set.objectStorageS3ForcePathStyle = ps.objectStorageS3ForcePathStyle;
			}

			if (ps.objectStorageCacheDays !== undefined) {
				set.objectStorageCacheDays = ps.objectStorageCacheDays;
			}

			if (ps.deeplAuthKey !== undefined) {
				if (ps.deeplAuthKey === '') {
					set.deeplAuthKey = null;
				} else {
					set.deeplAuthKey = ps.deeplAuthKey;
				}
			}

			if (ps.deeplIsPro !== undefined) {
				set.deeplIsPro = ps.deeplIsPro;
			}

			if (ps.enableIpLogging !== undefined) {
				set.enableIpLogging = ps.enableIpLogging;
			}

			if (ps.enableActiveEmailValidation !== undefined) {
				set.enableActiveEmailValidation = ps.enableActiveEmailValidation;
			}

			if (ps.enableVerifymailApi !== undefined) {
				set.enableVerifymailApi = ps.enableVerifymailApi;
			}

			if (ps.verifymailAuthKey !== undefined) {
				if (ps.verifymailAuthKey === '') {
					set.verifymailAuthKey = null;
				} else {
					set.verifymailAuthKey = ps.verifymailAuthKey;
				}
			}

			if (ps.enableTruemailApi !== undefined) {
				set.enableTruemailApi = ps.enableTruemailApi;
			}

			if (ps.truemailInstance !== undefined) {
				if (ps.truemailInstance === '') {
					set.truemailInstance = null;
				} else {
					set.truemailInstance = ps.truemailInstance;
				}
			}

			if (ps.truemailAuthKey !== undefined) {
				if (ps.truemailAuthKey === '') {
					set.truemailAuthKey = null;
				} else {
					set.truemailAuthKey = ps.truemailAuthKey;
				}
			}

			if (ps.enableChartsForRemoteUser !== undefined) {
				set.enableChartsForRemoteUser = ps.enableChartsForRemoteUser;
			}

			if (ps.enableChartsForFederatedInstances !== undefined) {
				set.enableChartsForFederatedInstances = ps.enableChartsForFederatedInstances;
			}

			if (ps.enableStatsForFederatedInstances !== undefined) {
				set.enableStatsForFederatedInstances = ps.enableStatsForFederatedInstances;
			}

			if (ps.enableServerMachineStats !== undefined) {
				set.enableServerMachineStats = ps.enableServerMachineStats;
			}

			if (ps.enableIdenticonGeneration !== undefined) {
				set.enableIdenticonGeneration = ps.enableIdenticonGeneration;
			}

			if (ps.serverRules !== undefined) {
				set.serverRules = ps.serverRules;
			}

			if (ps.preservedUsernames !== undefined) {
				set.preservedUsernames = ps.preservedUsernames;
			}

			if (ps.manifestJsonOverride !== undefined) {
				set.manifestJsonOverride = ps.manifestJsonOverride;
			}

			if (ps.enableFanoutTimeline !== undefined) {
				set.enableFanoutTimeline = ps.enableFanoutTimeline;
			}

			if (ps.enableFanoutTimelineDbFallback !== undefined) {
				set.enableFanoutTimelineDbFallback = ps.enableFanoutTimelineDbFallback;
			}

			if (ps.perLocalUserUserTimelineCacheMax !== undefined) {
				set.perLocalUserUserTimelineCacheMax = ps.perLocalUserUserTimelineCacheMax;
			}

			if (ps.perRemoteUserUserTimelineCacheMax !== undefined) {
				set.perRemoteUserUserTimelineCacheMax = ps.perRemoteUserUserTimelineCacheMax;
			}

			if (ps.perUserHomeTimelineCacheMax !== undefined) {
				set.perUserHomeTimelineCacheMax = ps.perUserHomeTimelineCacheMax;
			}

			if (ps.perUserListTimelineCacheMax !== undefined) {
				set.perUserListTimelineCacheMax = ps.perUserListTimelineCacheMax;
			}

			if (ps.enableReactionsBuffering !== undefined) {
				set.enableReactionsBuffering = ps.enableReactionsBuffering;
			}

			if (ps.notesPerOneAd !== undefined) {
				set.notesPerOneAd = ps.notesPerOneAd;
			}

			if (ps.bannedEmailDomains !== undefined) {
				set.bannedEmailDomains = ps.bannedEmailDomains;
			}

			if (ps.emailWhitelist !== undefined) {
				set.emailWhitelist = ps.emailWhitelist;
			}

			if (ps.urlPreviewEnabled !== undefined) {
				set.urlPreviewEnabled = ps.urlPreviewEnabled;
			}

			if (ps.urlPreviewAllowRedirect !== undefined) {
				set.urlPreviewAllowRedirect = ps.urlPreviewAllowRedirect;
			}

			if (ps.urlPreviewTimeout !== undefined) {
				set.urlPreviewTimeout = ps.urlPreviewTimeout;
			}

			if (ps.urlPreviewMaximumContentLength !== undefined) {
				set.urlPreviewMaximumContentLength = ps.urlPreviewMaximumContentLength;
			}

			if (ps.urlPreviewRequireContentLength !== undefined) {
				set.urlPreviewRequireContentLength = ps.urlPreviewRequireContentLength;
			}

			if (ps.urlPreviewUserAgent !== undefined) {
				const value = (ps.urlPreviewUserAgent ?? '').trim();
				set.urlPreviewUserAgent = value === '' ? null : ps.urlPreviewUserAgent;
			}

			if (ps.summalyProxy !== undefined || ps.urlPreviewSummaryProxyUrl !== undefined) {
				const value = ((ps.urlPreviewSummaryProxyUrl ?? ps.summalyProxy) ?? '').trim();
				set.urlPreviewSummaryProxyUrl = value === '' ? null : value;
			}

			if (ps.federation !== undefined) {
				set.federation = ps.federation;
			}

			if (ps.deliverSuspendedSoftware !== undefined) {
				set.deliverSuspendedSoftware = ps.deliverSuspendedSoftware;
			}

			if (Array.isArray(ps.federationHosts)) {
				set.federationHosts = ps.federationHosts.filter(Boolean).map(x => x.toLowerCase());
			}

			if (ps.singleUserMode !== undefined) {
				set.singleUserMode = ps.singleUserMode;
			}

			if (ps.ugcVisibilityForVisitor !== undefined) {
				set.ugcVisibilityForVisitor = ps.ugcVisibilityForVisitor;
			}

			if (ps.proxyRemoteFiles !== undefined) {
				set.proxyRemoteFiles = ps.proxyRemoteFiles;
			}

			if (ps.signToActivityPubGet !== undefined) {
				set.signToActivityPubGet = ps.signToActivityPubGet;
			}

			if (ps.allowExternalApRedirect !== undefined) {
				set.allowExternalApRedirect = ps.allowExternalApRedirect;
			}

			if (Array.isArray(ps.customSplashText)) {
				set.customSplashText = ps.customSplashText.filter(Boolean);
			}

			if (ps.blockMentionsFromUnfamiliarRemoteUsers !== undefined) {
				set.blockMentionsFromUnfamiliarRemoteUsers = ps.blockMentionsFromUnfamiliarRemoteUsers;
			}

			if (ps.validateMinimumUsernameLength !== undefined) {
				set.validateMinimumUsernameLength = ps.validateMinimumUsernameLength;
			}

			if (ps.useHanaEntrance !== undefined) {
				set.useHanaEntrance = ps.useHanaEntrance;
			}

			if (ps.hanaThemeColor !== undefined) {
				set.hanaThemeColor = ps.hanaThemeColor;
			}

			if (ps.hanaThemeAltColor !== undefined) {
				set.hanaThemeAltColor = ps.hanaThemeAltColor;
			}

			if (ps.hanaThemeWeakOpacity !== undefined) {
				set.hanaThemeWeakOpacity = ps.hanaThemeWeakOpacity;
			}

			if (ps.hanaModeIcon !== undefined) {
				set.hanaModeIcon = ps.hanaModeIcon;
			}

			if (ps.hanaModeIconSize !== undefined) {
				set.hanaModeIconSize = ps.hanaModeIconSize;
			}

			if (ps.hanaModeIconRadius !== undefined) {
				set.hanaModeIconRadius = ps.hanaModeIconRadius;
			}

			if (ps.hanaModeBackground !== undefined) {
				set.hanaModeBackground = ps.hanaModeBackground;
			}

			if (Array.isArray(ps.defaultFollowedUsers)) {
				if (ps.defaultFollowedUsers.some(x => this.serverSettings.forciblyFollowedUsers.includes(x) || ps.forciblyFollowedUsers?.includes(x))) {
					throw new ApiError(meta.errors.followedUserDuplicated);
				}

				set.defaultFollowedUsers = ps.defaultFollowedUsers.filter(Boolean);
			}

			if (Array.isArray(ps.forciblyFollowedUsers)) {
				if (ps.forciblyFollowedUsers.some(x => this.serverSettings.defaultFollowedUsers.includes(x) || ps.defaultFollowedUsers?.includes(x))) {
					throw new ApiError(meta.errors.followedUserDuplicated);
				}

				set.forciblyFollowedUsers = ps.forciblyFollowedUsers.filter(Boolean);
			}

			if (ps.deeplFreeMode !== undefined) {
				set.deeplFreeMode = ps.deeplFreeMode;
			}

			if (ps.deeplFreeInstance !== undefined) {
				if (ps.deeplFreeInstance === '') {
					set.deeplFreeInstance = null;
				} else {
					set.deeplFreeInstance = ps.deeplFreeInstance;
				}
			}

			if (ps.enableCpuModel !== undefined) {
				set.enableCpuModel = ps.enableCpuModel;
			}

			if (ps.customCpuModel !== undefined) {
				set.customCpuModel = ps.customCpuModel;
			}

			if (ps.enableCpuCore !== undefined) {
				set.enableCpuCore = ps.enableCpuCore;
			}

			if (ps.customCpuCore !== undefined) {
				set.customCpuCore = ps.customCpuCore;
			}

			if (ps.enableMemTotal !== undefined) {
				set.enableMemTotal = ps.enableMemTotal;
			}

			if (ps.customMemTotal !== undefined) {
				set.customMemTotal = ps.customMemTotal;
			}

			if (ps.enableFsTotal !== undefined) {
				set.enableFsTotal = ps.enableFsTotal;
			}

			if (ps.customFsTotal !== undefined) {
				set.customFsTotal = ps.customFsTotal;
			}

			if (ps.secondsPerSignup !== undefined) {
				set.secondsPerSignup = ps.secondsPerSignup;
			}

			if (ps.entranceShowTimeLine !== undefined) {
				set.entranceShowTimeLine = ps.entranceShowTimeLine;
			}

			if (ps.entranceShowFeatured !== undefined) {
				set.entranceShowFeatured = ps.entranceShowFeatured;
			}

			if (ps.entranceShowEmojis !== undefined) {
				set.entranceShowEmojis = ps.entranceShowEmojis;
			}

			if (Array.isArray(ps.entranceSelectEmojis)) {
				set.entranceSelectEmojis = ps.entranceSelectEmojis;
			}

			if (ps.entranceShowStats !== undefined) {
				set.entranceShowStats = ps.entranceShowStats;
			}

			if (ps.entranceShowFederation !== undefined) {
				set.entranceShowFederation = ps.entranceShowFederation;
			}

			if (ps.entranceShowDashboard !== undefined) {
				set.entranceShowDashboard = ps.entranceShowDashboard;
			}

			if (ps.entranceShowSignup !== undefined) {
				set.entranceShowSignup = ps.entranceShowSignup;
			}

			if (ps.entranceShowAnotherInstance !== undefined) {
				set.entranceShowAnotherInstance = ps.entranceShowAnotherInstance;
			}

			if (ps.entranceShowSignin !== undefined) {
				set.entranceShowSignin = ps.entranceShowSignin;
			}

			if (ps.entranceMarginLeft !== undefined) {
				set.entranceMarginLeft = ps.entranceMarginLeft;
			}

			if (ps.entranceMarginRight !== undefined) {
				set.entranceMarginRight = ps.entranceMarginRight;
			}

			if (ps.entranceMarginTop !== undefined) {
				set.entranceMarginTop = ps.entranceMarginTop;
			}

			if (ps.entranceMarginBottom !== undefined) {
				set.entranceMarginBottom = ps.entranceMarginBottom;
			}

			if (ps.serverGeminiEnabled !== undefined) {
				set.serverGeminiEnabled = ps.serverGeminiEnabled;
			}

			if ( ps.serverGeminiApiKey !== undefined) {
				set.serverGeminiApiKey = ps.serverGeminiApiKey;
			}

			if ( ps.serverGeminiModels !== undefined) {
				set.serverGeminiModels = ps.serverGeminiModels;
			}

			if (ps.customCursorUrl !== undefined) {
				set.customCursorUrl = ps.customCursorUrl;
			}

			if (ps.customCursorPointerUrl !== undefined) {
				set.customCursorPointerUrl = ps.customCursorPointerUrl;
			}

			if (ps.customCursorTextUrl !== undefined) {
				set.customCursorTextUrl = ps.customCursorTextUrl;
			}

			if (ps.customCursorProgressUrl !== undefined) {
				set.customCursorProgressUrl = ps.customCursorProgressUrl;
			}

			if (ps.customCursorWaitUrl !== undefined) {
				set.customCursorWaitUrl = ps.customCursorWaitUrl;
			}

			if (ps.enableContactForm !== undefined) {
				set.enableContactForm = ps.enableContactForm;
			}

			if (ps.contactFormLimit !== undefined) {
				set.contactFormLimit = ps.contactFormLimit;
			}

			if (ps.contactFormRequireAuth !== undefined) {
				set.contactFormRequireAuth = ps.contactFormRequireAuth;
			}

			if (ps.contactFormCategories !== undefined) {
				// Validate contactFormCategories array
				if (Array.isArray(ps.contactFormCategories)) {
					// Check for duplicate keys
					const keys = ps.contactFormCategories.map(cat => cat.key);
					const uniqueKeys = new Set(keys);
					if (keys.length !== uniqueKeys.size) {
						throw new Error('Duplicate category keys are not allowed');
					}

					// Check for multiple default categories
					const defaultCategories = ps.contactFormCategories.filter(cat => cat.isDefault);
					if (defaultCategories.length > 1) {
						throw new Error('Only one category can be set as default');
					}

					// Ensure at least one category exists and has a default
					if (ps.contactFormCategories.length > 0 && defaultCategories.length === 0) {
						throw new Error('At least one category must be set as default');
					}
				}

				set.contactFormCategories = ps.contactFormCategories;
			}

			const before = await this.metaService.fetch(true);

			await this.metaService.update(set);

			const after = await this.metaService.fetch(true);

			this.moderationLogService.log(me, 'updateServerSettings', {
				before,
				after,
			});
		});
	}
}
