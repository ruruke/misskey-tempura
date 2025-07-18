/*
 * SPDX-FileCopyrightText: lqvp
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { i18n } from '@/i18n.js';

export const bottomItemDef = {
	attachFileUpload: {
		title: i18n.ts.attachFile + ' (' + i18n.ts.upload + ')',
		icon: 'ti-photo-plus',
	},
	attachFileFromDrive: {
		title: i18n.ts.attachFile + ' (' + i18n.ts.fromDrive + ')',
		icon: 'ti-cloud-download',
	},
	poll: {
		title: i18n.ts.poll,
		icon: 'ti-chart-arrows',
	},
	scheduledNoteDelete: {
		title: i18n.ts.scheduledNoteDelete,
		icon: 'ti-bomb',
	},
	useCw: {
		title: i18n.ts.useCw,
		icon: 'ti-eye-off',
	},
	mention: {
		title: i18n.ts.mention,
		icon: 'ti-at',
	},
	hashtags: {
		title: i18n.ts.hashtags,
		icon: 'ti-hash',
	},
	plugins: {
		title: i18n.ts.plugins,
		icon: 'ti-plug',
	},
	addMfmFunction: {
		title: i18n.ts.addMfmFunction,
		icon: 'ti-palette',
	},
	clearPost: {
		title: i18n.ts.clearPost,
		icon: 'ti-trash',
	},
	scheduleNote: {
		title: i18n.ts.schedulePost,
		icon: 'ti ti-calendar-time',
	},
	schedulePostList: {
		title: i18n.ts.schedulePostList,
		icon: 'ti ti-calendar-event',
	},
	notesTransformation: {
		title: i18n.ts._llm.notesTransformation,
		icon: 'ti ti-notes',
	},
	deliveryTargets: {
		title: i18n.ts._deliveryTargetControl.deliveryTargetControl,
		icon: 'ti-server-2',
	},
};
