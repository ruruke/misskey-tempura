/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { MetaService } from '@/core/MetaService.js';
import type { Config } from '@/config.js';
import { DI } from '@/di-symbols.js';
import { DEFAULT_POLICIES } from '@/core/RoleService.js';
import { SystemAccountService } from '@/core/SystemAccountService.js';

export const meta = {
	tags: ['meta'],

	requireCredential: true,
	requireAdmin: true,
	kind: 'read:admin:meta',

	res: {
		type: 'object',
		optional: false, nullable: false,
		properties: {
			cacheRemoteFiles: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			cacheRemoteSensitiveFiles: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			emailRequiredForSignup: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			approvalRequiredForSignup: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			enableHcaptcha: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			hcaptchaSiteKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			enableMcaptcha: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			mcaptchaSiteKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			mcaptchaInstanceUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			enableRecaptcha: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			recaptchaSiteKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			enableTurnstile: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			turnstileSiteKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			enableTestcaptcha: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			googleAnalyticsMeasurementId: {
				type: 'string',
				optional: false, nullable: true,
			},
			swPublickey: {
				type: 'string',
				optional: false, nullable: true,
			},
			mascotImageUrl: {
				type: 'string',
				optional: false, nullable: true,
				default: '/assets/ai.png',
			},
			bannerUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			serverErrorImageUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			infoImageUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			notFoundImageUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			youBlockedImageUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			iconUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			enableLongIconUrl: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			longIconUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			app192IconUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			app512IconUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			enableEmail: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			enableServiceWorker: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			translatorAvailable: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			silencedHosts: {
				type: 'array',
				optional: true,
				nullable: false,
				items: {
					type: 'string',
					optional: false,
					nullable: false,
				},
			},
			mediaSilencedHosts: {
				type: 'array',
				optional: false,
				nullable: false,
				items: {
					type: 'string',
					optional: false,
					nullable: false,
				},
			},
			pinnedUsers: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			hiddenTags: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			blockedHosts: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			sensitiveWords: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			prohibitedWords: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			prohibitedWordsForNameOfUser: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			bannedEmailDomains: {
				type: 'array',
				optional: true, nullable: false,
				items: {
					type: 'string',
					optional: false, nullable: false,
				},
			},
			emailWhitelist: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			preservedUsernames: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			hcaptchaSecretKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			mcaptchaSecretKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			recaptchaSecretKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			turnstileSecretKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			sensitiveMediaDetection: {
				type: 'string',
				optional: false, nullable: false,
			},
			sensitiveMediaDetectionSensitivity: {
				type: 'string',
				optional: false, nullable: false,
			},
			setSensitiveFlagAutomatically: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			enableSensitiveMediaDetectionForVideos: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			proxyAccountId: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
			email: {
				type: 'string',
				optional: false, nullable: true,
			},
			smtpSecure: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			smtpHost: {
				type: 'string',
				optional: false, nullable: true,
			},
			smtpPort: {
				type: 'number',
				optional: false, nullable: true,
			},
			smtpUser: {
				type: 'string',
				optional: false, nullable: true,
			},
			smtpPass: {
				type: 'string',
				optional: false, nullable: true,
			},
			swPrivateKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			useObjectStorage: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			objectStorageBaseUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			objectStorageBucket: {
				type: 'string',
				optional: false, nullable: true,
			},
			objectStoragePrefix: {
				type: 'string',
				optional: false, nullable: true,
			},
			objectStoragePrefixForRemote: {
				type: 'string',
				optional: false, nullable: true,
			},
			objectStorageEndpoint: {
				type: 'string',
				optional: false, nullable: true,
			},
			objectStorageRegion: {
				type: 'string',
				optional: false, nullable: true,
			},
			objectStoragePort: {
				type: 'number',
				optional: false, nullable: true,
			},
			objectStorageAccessKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			objectStorageSecretKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			objectStorageUseSSL: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			objectStorageUseProxy: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			objectStorageSetPublicRead: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			objectStorageCacheDays: {
				type: 'number',
				optional: false, nullable: true,
			},
			enableIpLogging: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			enableActiveEmailValidation: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			enableVerifymailApi: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			verifymailAuthKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			enableTruemailApi: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			truemailInstance: {
				type: 'string',
				optional: false, nullable: true,
			},
			truemailAuthKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			enableChartsForRemoteUser: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			enableChartsForFederatedInstances: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			enableStatsForFederatedInstances: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			enableServerMachineStats: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			enableIdenticonGeneration: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			manifestJsonOverride: {
				type: 'string',
				optional: false, nullable: false,
			},
			policies: {
				type: 'object',
				optional: false, nullable: false,
			},
			enableFanoutTimeline: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			enableFanoutTimelineDbFallback: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			perLocalUserUserTimelineCacheMax: {
				type: 'number',
				optional: false, nullable: false,
			},
			perRemoteUserUserTimelineCacheMax: {
				type: 'number',
				optional: false, nullable: false,
			},
			perUserHomeTimelineCacheMax: {
				type: 'number',
				optional: false, nullable: false,
			},
			perUserListTimelineCacheMax: {
				type: 'number',
				optional: false, nullable: false,
			},
			enableReactionsBuffering: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			notesPerOneAd: {
				type: 'number',
				optional: false, nullable: false,
			},
			backgroundImageUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			backgroundImageUrls: {
				type: 'array',
				optional: false, nullable: true,
			},
			deeplAuthKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			deeplIsPro: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			defaultDarkTheme: {
				type: 'string',
				optional: false, nullable: true,
			},
			defaultLightTheme: {
				type: 'string',
				optional: false, nullable: true,
			},
			description: {
				type: 'string',
				optional: false, nullable: true,
			},
			disableRegistration: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			impressumUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			maintainerEmail: {
				type: 'string',
				optional: false, nullable: true,
			},
			maintainerName: {
				type: 'string',
				optional: false, nullable: true,
			},
			name: {
				type: 'string',
				optional: false, nullable: true,
			},
			shortName: {
				type: 'string',
				optional: false, nullable: true,
			},
			objectStorageS3ForcePathStyle: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			privacyPolicyUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			inquiryUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			repositoryUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			summalyProxy: {
				type: 'string',
				optional: false, nullable: true,
				deprecated: true,
				description: '[Deprecated] Use "urlPreviewSummaryProxyUrl" instead.',
			},
			themeColor: {
				type: 'string',
				optional: false, nullable: true,
			},
			tosUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			uri: {
				type: 'string',
				optional: false, nullable: false,
			},
			version: {
				type: 'string',
				optional: false, nullable: false,
			},
			urlPreviewEnabled: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			urlPreviewAllowRedirect: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			urlPreviewTimeout: {
				type: 'number',
				optional: false, nullable: false,
			},
			urlPreviewMaximumContentLength: {
				type: 'number',
				optional: false, nullable: false,
			},
			urlPreviewRequireContentLength: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			urlPreviewUserAgent: {
				type: 'string',
				optional: false, nullable: true,
			},
			urlPreviewSummaryProxyUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			federation: {
				type: 'string',
				enum: ['all', 'specified', 'none'],
				optional: false, nullable: false,
			},
			customSplashText: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			blockMentionsFromUnfamiliarRemoteUsers: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			validateMinimumUsernameLength: {
				type: 'number',
				optional: false, nullable: false,
			},
			useHanaEntrance: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			hanaThemeColor: {
				type: 'string',
				optional: false, nullable: false,
			},
			hanaThemeAltColor: {
				type: 'string',
				optional: false, nullable: false,
			},
			hanaThemeWeakOpacity: {
				type: 'number',
				optional: false, nullable: false,
			},
			hanaModeIcon: {
				type: 'string',
				optional: false, nullable: true,
			},
			hanaModeIconSize: {
				type: 'number',
				optional: false, nullable: false,
			},
			hanaModeIconRadius: {
				type: 'number',
				optional: false, nullable: false,
			},
			hanaModeBackground: {
				type: 'string',
				optional: false, nullable: true,
			},
			defaultFollowedUsers: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			forciblyFollowedUsers: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			deeplFreeMode: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			deeplFreeInstance: {
				type: 'string',
				optional: false, nullable: true,
			},
			enableCpuModel: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			customCpuModel: {
				type: 'string',
				optional: false, nullable: true,
			},
			enableCpuCore: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			customCpuCore: {
				type: 'number',
				optional: false, nullable: true,
			},
			enableMemTotal: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			customMemTotal: {
				type: 'number',
				optional: false, nullable: true,
			},
			enableFsTotal: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			customFsTotal: {
				type: 'number',
				optional: false, nullable: true,
			},
			secondsPerSignup: {
				type: 'number',
				optional: false, nullable: false,
			},
			entranceShowTimeLine: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			entranceShowFeatured: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			entranceShowEmojis: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			entranceSelectEmojis: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'string',
				},
			},
			entranceShowStats: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			entranceShowFederation: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			entranceShowDashboard: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			entranceShowSignup: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			entranceShowAnotherInstance: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			entranceShowSignin: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			entranceMarginLeft: {
				type: 'number',
				optional: false, nullable: false,
			},
			entranceMarginRight: {
				type: 'number',
				optional: false, nullable: false,
			},
			entranceMarginTop: {
				type: 'number',
				optional: false, nullable: false,
			},
			entranceMarginBottom: {
				type: 'number',
				optional: false, nullable: false,
			},
			serverGeminiEnabled: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			serverGeminiApiKey: {
				type: 'string',
				optional: false, nullable: true,
			},
			serverGeminiModels: {
				type: 'string',
				optional: false, nullable: false,
			},
			customCursorUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			customCursorPointerUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			customCursorTextUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			customCursorProgressUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			customCursorWaitUrl: {
				type: 'string',
				optional: false, nullable: true,
			},
			// Contact Form Settings
			enableContactForm: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			contactFormLimit: {
				type: 'number',
				optional: false, nullable: false,
			},
			contactFormRequireAuth: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			contactFormCategories: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'object',
					optional: false, nullable: false,
					properties: {
						key: {
							type: 'string',
							optional: false, nullable: false,
						},
						text: {
							type: 'string',
							optional: false, nullable: false,
						},
						enabled: {
							type: 'boolean',
							optional: false, nullable: false,
						},
						order: {
							type: 'number',
							optional: false, nullable: false,
						},
						isDefault: {
							type: 'boolean',
							optional: false, nullable: false,
						},
					},
				},
			},
			deliverSuspendedSoftware: {
				type: 'array',
				optional: false, nullable: false,
				items: {
					type: 'object',
					optional: false, nullable: false,
					properties: {
						software: {
							type: 'string',
							optional: false, nullable: false,
						},
						versionRange: {
							type: 'string',
							optional: false, nullable: false,
						},
					},
				},
			},
			singleUserMode: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			ugcVisibilityForVisitor: {
				type: 'string',
				enum: ['all', 'local', 'none'],
				optional: false, nullable: false,
			},
			proxyRemoteFiles: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			signToActivityPubGet: {
				type: 'boolean',
				optional: false, nullable: false,
			},
			allowExternalApRedirect: {
				type: 'boolean',
				optional: false, nullable: false,
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.config)
		private config: Config,

		private metaService: MetaService,
		private systemAccountService: SystemAccountService,
	) {
		super(meta, paramDef, async () => {
			const instance = await this.metaService.fetch(true);

			const proxy = await this.systemAccountService.fetch('proxy');

			return {
				maintainerName: instance.maintainerName,
				maintainerEmail: instance.maintainerEmail,
				version: this.config.version,
				name: instance.name,
				shortName: instance.shortName,
				uri: this.config.url,
				description: instance.description,
				langs: instance.langs,
				tosUrl: instance.termsOfServiceUrl,
				repositoryUrl: instance.repositoryUrl,
				feedbackUrl: instance.feedbackUrl,
				impressumUrl: instance.impressumUrl,
				privacyPolicyUrl: instance.privacyPolicyUrl,
				inquiryUrl: instance.inquiryUrl,
				disableRegistration: instance.disableRegistration,
				emailRequiredForSignup: instance.emailRequiredForSignup,
				approvalRequiredForSignup: instance.approvalRequiredForSignup,
				enableHcaptcha: instance.enableHcaptcha,
				hcaptchaSiteKey: instance.hcaptchaSiteKey,
				enableMcaptcha: instance.enableMcaptcha,
				mcaptchaSiteKey: instance.mcaptchaSitekey,
				mcaptchaInstanceUrl: instance.mcaptchaInstanceUrl,
				enableRecaptcha: instance.enableRecaptcha,
				recaptchaSiteKey: instance.recaptchaSiteKey,
				enableTurnstile: instance.enableTurnstile,
				turnstileSiteKey: instance.turnstileSiteKey,
				enableTestcaptcha: instance.enableTestcaptcha,
				googleAnalyticsMeasurementId: instance.googleAnalyticsMeasurementId,
				swPublickey: instance.swPublicKey,
				themeColor: instance.themeColor,
				mascotImageUrl: instance.mascotImageUrl,
				bannerUrl: instance.bannerUrl,
				serverErrorImageUrl: instance.serverErrorImageUrl,
				notFoundImageUrl: instance.notFoundImageUrl,
				infoImageUrl: instance.infoImageUrl,
				youBlockedImageUrl: instance.youBlockedImageUrl,
				iconUrl: instance.iconUrl,
				enableLongIconUrl: instance.enableLongIconUrl,
				longIconUrl: instance.longIconUrl,
				app192IconUrl: instance.app192IconUrl,
				app512IconUrl: instance.app512IconUrl,
				backgroundImageUrl: instance.backgroundImageUrl,
				backgroundImageUrls: instance.backgroundImageUrls,
				logoImageUrl: instance.logoImageUrl,
				defaultLightTheme: instance.defaultLightTheme,
				defaultDarkTheme: instance.defaultDarkTheme,
				enableEmail: instance.enableEmail,
				enableServiceWorker: instance.enableServiceWorker,
				translatorAvailable: instance.deeplAuthKey != null,
				cacheRemoteFiles: instance.cacheRemoteFiles,
				cacheRemoteSensitiveFiles: instance.cacheRemoteSensitiveFiles,
				pinnedUsers: instance.pinnedUsers,
				hiddenTags: instance.hiddenTags,
				blockedHosts: instance.blockedHosts,
				silencedHosts: instance.silencedHosts,
				mediaSilencedHosts: instance.mediaSilencedHosts,
				sensitiveWords: instance.sensitiveWords,
				prohibitedWords: instance.prohibitedWords,
				prohibitedWordsForNameOfUser: instance.prohibitedWordsForNameOfUser,
				preservedUsernames: instance.preservedUsernames,
				hcaptchaSecretKey: instance.hcaptchaSecretKey,
				mcaptchaSecretKey: instance.mcaptchaSecretKey,
				recaptchaSecretKey: instance.recaptchaSecretKey,
				turnstileSecretKey: instance.turnstileSecretKey,
				sensitiveMediaDetection: instance.sensitiveMediaDetection,
				sensitiveMediaDetectionSensitivity: instance.sensitiveMediaDetectionSensitivity,
				setSensitiveFlagAutomatically: instance.setSensitiveFlagAutomatically,
				enableSensitiveMediaDetectionForVideos: instance.enableSensitiveMediaDetectionForVideos,
				proxyAccountId: proxy.id,
				email: instance.email,
				smtpSecure: instance.smtpSecure,
				smtpHost: instance.smtpHost,
				smtpPort: instance.smtpPort,
				smtpUser: instance.smtpUser,
				smtpPass: instance.smtpPass,
				swPrivateKey: instance.swPrivateKey,
				useObjectStorage: instance.useObjectStorage,
				objectStorageBaseUrl: instance.objectStorageBaseUrl,
				objectStorageBucket: instance.objectStorageBucket,
				objectStoragePrefix: instance.objectStoragePrefix,
				objectStoragePrefixForRemote: instance.objectStoragePrefixForRemote,
				objectStorageEndpoint: instance.objectStorageEndpoint,
				objectStorageRegion: instance.objectStorageRegion,
				objectStoragePort: instance.objectStoragePort,
				objectStorageAccessKey: instance.objectStorageAccessKey,
				objectStorageSecretKey: instance.objectStorageSecretKey,
				objectStorageUseSSL: instance.objectStorageUseSSL,
				objectStorageUseProxy: instance.objectStorageUseProxy,
				objectStorageSetPublicRead: instance.objectStorageSetPublicRead,
				objectStorageS3ForcePathStyle: instance.objectStorageS3ForcePathStyle,
				objectStorageCacheDays: instance.objectStorageCacheDays,
				deeplAuthKey: instance.deeplAuthKey,
				deeplIsPro: instance.deeplIsPro,
				enableIpLogging: instance.enableIpLogging,
				enableActiveEmailValidation: instance.enableActiveEmailValidation,
				enableVerifymailApi: instance.enableVerifymailApi,
				verifymailAuthKey: instance.verifymailAuthKey,
				enableTruemailApi: instance.enableTruemailApi,
				truemailInstance: instance.truemailInstance,
				truemailAuthKey: instance.truemailAuthKey,
				enableChartsForRemoteUser: instance.enableChartsForRemoteUser,
				enableChartsForFederatedInstances: instance.enableChartsForFederatedInstances,
				enableStatsForFederatedInstances: instance.enableStatsForFederatedInstances,
				enableServerMachineStats: instance.enableServerMachineStats,
				enableIdenticonGeneration: instance.enableIdenticonGeneration,
				bannedEmailDomains: instance.bannedEmailDomains,
				emailWhitelist: instance.emailWhitelist,
				policies: { ...DEFAULT_POLICIES, ...instance.policies },
				manifestJsonOverride: instance.manifestJsonOverride,
				enableFanoutTimeline: instance.enableFanoutTimeline,
				enableFanoutTimelineDbFallback: instance.enableFanoutTimelineDbFallback,
				perLocalUserUserTimelineCacheMax: instance.perLocalUserUserTimelineCacheMax,
				perRemoteUserUserTimelineCacheMax: instance.perRemoteUserUserTimelineCacheMax,
				perUserHomeTimelineCacheMax: instance.perUserHomeTimelineCacheMax,
				perUserListTimelineCacheMax: instance.perUserListTimelineCacheMax,
				enableReactionsBuffering: instance.enableReactionsBuffering,
				notesPerOneAd: instance.notesPerOneAd,
				summalyProxy: instance.urlPreviewSummaryProxyUrl,
				urlPreviewEnabled: instance.urlPreviewEnabled,
				urlPreviewAllowRedirect: instance.urlPreviewAllowRedirect,
				urlPreviewTimeout: instance.urlPreviewTimeout,
				urlPreviewMaximumContentLength: instance.urlPreviewMaximumContentLength,
				urlPreviewRequireContentLength: instance.urlPreviewRequireContentLength,
				urlPreviewUserAgent: instance.urlPreviewUserAgent,
				urlPreviewSummaryProxyUrl: instance.urlPreviewSummaryProxyUrl,
				federation: instance.federation,
				federationHosts: instance.federationHosts,
				deliverSuspendedSoftware: instance.deliverSuspendedSoftware,
				singleUserMode: instance.singleUserMode,
				ugcVisibilityForVisitor: instance.ugcVisibilityForVisitor,
				proxyRemoteFiles: instance.proxyRemoteFiles,
				signToActivityPubGet: instance.signToActivityPubGet,
				allowExternalApRedirect: instance.allowExternalApRedirect,
				customSplashText: instance.customSplashText,
				blockMentionsFromUnfamiliarRemoteUsers: instance.blockMentionsFromUnfamiliarRemoteUsers,
				validateMinimumUsernameLength: instance.validateMinimumUsernameLength,
				useHanaEntrance: instance.useHanaEntrance,
				hanaThemeColor: instance.hanaThemeColor,
				hanaThemeAltColor: instance.hanaThemeAltColor,
				hanaThemeWeakOpacity: instance.hanaThemeWeakOpacity,
				hanaModeIcon: instance.hanaModeIcon,
				hanaModeIconSize: instance.hanaModeIconSize,
				hanaModeIconRadius: instance.hanaModeIconRadius,
				hanaModeBackground: instance.hanaModeBackground,
				defaultFollowedUsers: instance.defaultFollowedUsers,
				forciblyFollowedUsers: instance.forciblyFollowedUsers,
				deeplFreeMode: instance.deeplFreeMode,
				deeplFreeInstance: instance.deeplFreeInstance,
				enableCpuModel: instance.enableCpuModel,
				customCpuModel: instance.customCpuModel,
				enableCpuCore: instance.enableCpuCore,
				customCpuCore: instance.customCpuCore,
				enableMemTotal: instance.enableMemTotal,
				customMemTotal: instance.customMemTotal,
				enableFsTotal: instance.enableFsTotal,
				customFsTotal: instance.customFsTotal,
				secondsPerSignup: instance.secondsPerSignup,
				entranceShowTimeLine: instance.entranceShowTimeLine,
				entranceShowFeatured: instance.entranceShowFeatured,
				entranceShowEmojis: instance.entranceShowEmojis,
				entranceSelectEmojis: instance.entranceSelectEmojis,
				entranceShowStats: instance.entranceShowStats,
				entranceShowFederation: instance.entranceShowFederation,
				entranceShowDashboard: instance.entranceShowDashboard,
				entranceShowSignup: instance.entranceShowSignup,
				entranceShowAnotherInstance: instance.entranceShowAnotherInstance,
				entranceShowSignin: instance.entranceShowSignin,
				entranceMarginLeft: instance.entranceMarginLeft,
				entranceMarginRight: instance.entranceMarginRight,
				entranceMarginTop: instance.entranceMarginTop,
				entranceMarginBottom: instance.entranceMarginBottom,
				serverGeminiEnabled: instance.serverGeminiEnabled,
				serverGeminiApiKey: instance.serverGeminiApiKey,
				serverGeminiModels: instance.serverGeminiModels,
				customCursorUrl: instance.customCursorUrl,
				customCursorPointerUrl: instance.customCursorPointerUrl,
				customCursorTextUrl: instance.customCursorTextUrl,
				customCursorProgressUrl: instance.customCursorProgressUrl,
				customCursorWaitUrl: instance.customCursorWaitUrl,
				enableContactForm: instance.enableContactForm,
				contactFormLimit: instance.contactFormLimit,
				contactFormRequireAuth: instance.contactFormRequireAuth,
				contactFormCategories: instance.contactFormCategories,
			};
		});
	}
}
