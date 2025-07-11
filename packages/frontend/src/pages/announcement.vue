<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 800px;">
		<Transition
			:enterActiveClass="prefer.s.animation ? $style.fadeEnterActive : ''"
			:leaveActiveClass="prefer.s.animation ? $style.fadeLeaveActive : ''"
			:enterFromClass="prefer.s.animation ? $style.fadeEnterFrom : ''"
			:leaveToClass="prefer.s.animation ? $style.fadeLeaveTo : ''"
			mode="out-in"
		>
			<div v-if="announcement" :key="announcement.id" class="_panel" :class="$style.announcement">
				<div v-if="announcement.forYou" :class="$style.forYou"><i class="ti ti-pin"></i> {{ i18n.ts.forYou }}</div>
				<div v-if="announcement.forYourRoles" :class="$style.forYou">
					<i class="ti ti-pin"></i> {{ i18n.ts.forYourRoles }}: <span :class="$style.roleNames">{{ announcement.roleNames.join(', ') }}</span>
				</div>
				<div :class="$style.header">
					<span v-if="$i && !announcement.silence && !announcement.isRead" style="margin-right: 0.5em;">🆕</span>
					<span style="margin-right: 0.5em;">
						<i v-if="announcement.icon === 'info'" class="ti ti-info-circle"></i>
						<i v-else-if="announcement.icon === 'warning'" class="ti ti-alert-triangle" style="color: var(--MI_THEME-warn);"></i>
						<i v-else-if="announcement.icon === 'error'" class="ti ti-circle-x" style="color: var(--MI_THEME-error);"></i>
						<i v-else-if="announcement.icon === 'success'" class="ti ti-check" style="color: var(--MI_THEME-success);"></i>
					</span>
					<Mfm :text="announcement.title" class="_selectable"/>
				</div>
				<div :class="$style.content">
					<Mfm :text="announcement.text" class="_selectable"/>
					<img v-if="announcement.imageUrl" :src="announcement.imageUrl"/>
					<div style="margin-top: 8px; opacity: 0.7; font-size: 85%;">
						{{ i18n.ts.createdAt }}: <MkTime :time="announcement.createdAt" mode="detail"/>
					</div>
					<div v-if="announcement.updatedAt" style="opacity: 0.7; font-size: 85%;">
						{{ i18n.ts.updatedAt }}: <MkTime :time="announcement.updatedAt" mode="detail"/>
					</div>
				</div>
				<div v-if="$i && !announcement.silence && !announcement.isRead" :class="$style.footer">
					<MkButton primary @click="read(announcement)"><i class="ti ti-check"></i> {{ i18n.ts.gotIt }}</MkButton>
				</div>
			</div>
			<MkError v-else-if="error" @retry="fetch()"/>
			<MkLoading v-else/>
		</Transition>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import * as Misskey from 'misskey-js';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { $i } from '@/i.js';
import { prefer } from '@/preferences.js';
import { updateCurrentAccountPartial } from '@/accounts.js';

const props = defineProps<{
	announcementId: string;
}>();

const announcement = ref<Misskey.entities.Announcement | null>(null);
const error = ref<any>(null);
const path = computed(() => props.announcementId);

function fetch() {
	announcement.value = null;
	misskeyApi('announcements/show', {
		announcementId: props.announcementId,
	}).then(async _announcement => {
		announcement.value = _announcement;
	}).catch(err => {
		error.value = err;
	});
}

async function read(target: Misskey.entities.Announcement): Promise<void> {
	if (target.needConfirmationToRead) {
		const confirm = await os.confirm({
			type: 'question',
			title: i18n.ts._announcement.readConfirmTitle,
			text: i18n.tsx._announcement.readConfirmText({ title: target.title }),
		});
		if (confirm.canceled) return;
	}

	target.isRead = true;
	await misskeyApi('i/read-announcement', { announcementId: target.id });
	if ($i) {
		updateCurrentAccountPartial({
			unreadAnnouncements: $i.unreadAnnouncements.filter((a: { id: string; }) => a.id !== target.id),
		});
	}
}

watch(() => path.value, fetch, { immediate: true });

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: announcement.value ? announcement.value.title : i18n.ts.announcements,
	icon: 'ti ti-speakerphone',
}));
</script>

<style lang="scss" module>
.fadeEnterActive,
.fadeLeaveActive {
	transition: opacity 0.125s ease;
}
.fadeEnterFrom,
.fadeLeaveTo {
	opacity: 0;
}

.announcement {
	padding: 16px;
}

.forYou {
	display: flex;
	align-items: center;
	line-height: 24px;
	font-size: 90%;
	white-space: pre;
	color: #d28a3f;
}

.roleNames {
	font-weight: bold;
	color: var(--MI_THEME-accent);
}

.header {
	margin-bottom: 16px;
	font-weight: bold;
	font-size: 120%;
}

.content {
	> img {
		display: block;
		max-height: 300px;
		max-width: 100%;
	}
}

.footer {
	margin-top: 16px;
}
</style>
