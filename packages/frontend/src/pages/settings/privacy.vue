<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/privacy" :label="i18n.ts.privacy" :keywords="['privacy']" icon="ti ti-lock-open">
	<div class="_gaps_m">
		<MkFeatureBanner icon="/client-assets/unlocked_3d.png" color="#aeff00">
			<SearchKeyword>{{ i18n.ts._settings.privacyBanner }}</SearchKeyword>
		</MkFeatureBanner>

		<SearchMarker :keywords="['follow', 'lock']">
			<MkSwitch v-model="isLocked" @update:modelValue="save()">
				<template #label><SearchLabel>{{ i18n.ts.makeFollowManuallyApprove }}</SearchLabel></template>
				<template #caption><SearchKeyword>{{ i18n.ts.lockedAccountInfo }}</SearchKeyword></template>
			</MkSwitch>
		</SearchMarker>

		<MkDisableSection :disabled="!isLocked">
			<SearchMarker :keywords="['follow', 'auto', 'accept']">
				<MkSwitch v-model="autoAcceptFollowed" @update:modelValue="save()">
					<template #label><SearchLabel>{{ i18n.ts.autoAcceptFollowed }}</SearchLabel></template>
				</MkSwitch>
			</SearchMarker>
		</MkDisableSection>

		<MkSwitch v-if="isLocked" v-model="autoRejectFollowRequest" @update:modelValue="save()">
			{{ i18n.ts.autoRejectFollowRequest }}<span class="_beta">{{ i18n.ts.originalFeature }}</span>
			<template #caption>{{ i18n.ts.autoRejectFollowRequestDescription }}</template>
		</MkSwitch>
		<MkSwitch v-if="!isLocked" v-model="carefulBot" @update:modelValue="save()">{{ i18n.ts.carefulBot }}<template #caption>{{ i18n.ts.carefulBotDescription }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template></MkSwitch>

		<MkSwitch v-if="$i.policies.canAutoFollowBack" v-model="autoFollowBack" @update:modelValue="save()">
			{{ i18n.ts.autoFollowBack }}<span class="_beta">{{ i18n.ts.originalFeature }}</span>
			<template #caption>{{ i18n.ts.autoFollowBackDescription }}</template>
		</MkSwitch>

		<MkSwitch v-model="autoFollowOnMove" @update:modelValue="save()">
			{{ i18n.ts.autoFollowOnMove }}<span class="_beta">{{ i18n.ts.originalFeature }}</span>
			<template #caption>{{ i18n.ts.autoFollowOnMoveDescription }}</template>
		</MkSwitch>

		<MkFolder>
			<template #label>{{ i18n.ts._outboxFilter.title }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
			<template #caption>{{ i18n.ts._outboxFilter.description }}</template>
			<div class="_gpas_m">
				<MkSwitch v-model="outboxFilter.public" @update:modelValue="save()">
					{{ i18n.ts._outboxFilter.publicVisibility }}
					<template #caption>{{ i18n.ts._outboxFilter.publicVisibilityDescription }}</template>
				</MkSwitch>

				<MkSwitch v-model="outboxFilter.public_non_ltl" @update:modelValue="save()">
					{{ i18n.ts._outboxFilter.publicNonLtlVisibility }}
					<template #caption>{{ i18n.ts._outboxFilter.publicNonLtlVisibilityDescription }}</template>
				</MkSwitch>

				<MkSwitch v-model="outboxFilter.home" @update:modelValue="save()">
					{{ i18n.ts._outboxFilter.homeVisibility }}
					<template #caption>{{ i18n.ts._outboxFilter.homeVisibilityDescription }}</template>
				</MkSwitch>
			</div>
		</MkFolder>

		<MkSwitch v-model="hideActivity" @update:modelValue="save()">
			{{ i18n.ts.hideActivity }}<span class="_beta">{{ i18n.ts.originalFeature }}</span>
			<template #caption>{{ i18n.ts.hideActivityDescription }}</template>
		</MkSwitch>

		<MkFolder>
			<template #label>{{ i18n.ts.visibility }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
			<div class="_gpas_m">
				<MkSwitch v-model="hideNoteFromOverview" @update:modelValue="save()">
					{{ i18n.ts.hideNoteFromOverview }}<span class="_beta">{{ i18n.ts.originalFeature }}</span>
					<template #caption>{{ i18n.ts.hideNoteFromOverviewDescription }}</template>
				</MkSwitch>

				<MkSwitch v-model="hidePublicNotes" @update:modelValue="save()">
					{{ i18n.ts.hidePublicNotes }}<span class="_beta">{{ i18n.ts.originalFeature }}</span>
					<template #caption>{{ i18n.ts.hidePublicNotesDescription }}</template>
				</MkSwitch>

				<MkSwitch v-model="hideHomeNotes" @update:modelValue="save()">
					{{ i18n.ts.hideHomeNotes }}<span class="_beta">{{ i18n.ts.originalFeature }}</span>
					<template #caption>{{ i18n.ts.hideHomeNotesDescription }}</template>
				</MkSwitch>

				<MkSwitch v-model="hideLocalOnlyNotes" @update:modelValue="save()">
					{{ i18n.ts.hideLocalOnlyNotes }}<span class="_beta">{{ i18n.ts.originalFeature }}</span>
					<template #caption>{{ i18n.ts.hideLocalOnlyNotesDescription }}</template>
				</MkSwitch>
			</div>
		</MkFolder>

		<SearchMarker :keywords="['reaction', 'public']">
			<MkSwitch v-model="publicReactions" @update:modelValue="save()">
				<template #label><SearchLabel>{{ i18n.ts.makeReactionsPublic }}</SearchLabel></template>
				<template #caption><SearchKeyword>{{ i18n.ts.makeReactionsPublicDescription }}</SearchKeyword></template>
			</MkSwitch>
		</SearchMarker>

		<SearchMarker :keywords="['following', 'visibility']">
			<MkSelect v-model="followingVisibility" @update:modelValue="save()">
				<template #label><SearchLabel>{{ i18n.ts.followingVisibility }}</SearchLabel></template>
				<option value="public">{{ i18n.ts._ffVisibility.public }}</option>
				<option value="followers">{{ i18n.ts._ffVisibility.followers }}</option>
				<option value="private">{{ i18n.ts._ffVisibility.private }}</option>
			</MkSelect>
		</SearchMarker>

		<SearchMarker :keywords="['follower', 'visibility']">
			<MkSelect v-model="followersVisibility" @update:modelValue="save()">
				<template #label><SearchLabel>{{ i18n.ts.followersVisibility }}</SearchLabel></template>
				<option value="public">{{ i18n.ts._ffVisibility.public }}</option>
				<option value="followers">{{ i18n.ts._ffVisibility.followers }}</option>
				<option value="private">{{ i18n.ts._ffVisibility.private }}</option>
			</MkSelect>
		</SearchMarker>

		<SearchMarker :keywords="['direct message', 'specified', 'note', 'receive']">
			<MkSelect v-model="receiveSpecifiedNotesFrom" @update:modelValue="save()">
				<template #label><SearchLabel>{{ i18n.ts.receiveSpecifiedNotesFrom }}</SearchLabel></template>
				<template #caption><SearchKeyword>{{ i18n.ts.receiveSpecifiedNotesFromDescription }}</SearchKeyword></template>
				<option value="all">{{ i18n.ts._receiveSpecifiedNotesFrom.all }}</option>
				<option value="following">{{ i18n.ts._receiveSpecifiedNotesFrom.following }}</option>
				<option value="nobody">{{ i18n.ts._receiveSpecifiedNotesFrom.nobody }}</option>
			</MkSelect>
		</SearchMarker>

		<SearchMarker :keywords="['online', 'status']">
			<MkSwitch v-model="hideOnlineStatus" @update:modelValue="save()">
				<template #label><SearchLabel>{{ i18n.ts.hideOnlineStatus }}</SearchLabel></template>
				<template #caption><SearchKeyword>{{ i18n.ts.hideOnlineStatusDescription }}</SearchKeyword></template>
			</MkSwitch>
		</SearchMarker>

		<SearchMarker :keywords="['crawle', 'index', 'search']">
			<MkSwitch v-model="noCrawle" @update:modelValue="save()">
				<template #label><SearchLabel>{{ i18n.ts.noCrawle }}</SearchLabel></template>
				<template #caption><SearchKeyword>{{ i18n.ts.noCrawleDescription }}</SearchKeyword></template>
			</MkSwitch>
		</SearchMarker>

		<SearchMarker :keywords="['crawle', 'ai']">
			<MkSwitch v-model="preventAiLearning" @update:modelValue="save()">
				<template #label><SearchLabel>{{ i18n.ts.preventAiLearning }}</SearchLabel></template>
				<template #caption><SearchKeyword>{{ i18n.ts.preventAiLearningDescription }}</SearchKeyword></template>
			</MkSwitch>
		</SearchMarker>

		<SearchMarker :keywords="['explore']">
			<MkSwitch v-model="isExplorable" @update:modelValue="save()">
				<template #label><SearchLabel>{{ i18n.ts.makeExplorable }}</SearchLabel></template>
				<template #caption><SearchKeyword>{{ i18n.ts.makeExplorableDescription }}</SearchKeyword></template>
			</MkSwitch>
		</SearchMarker>

		<SearchMarker :keywords="['chat']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.chat }}</SearchLabel></template>

				<div class="_gaps_m">
					<MkInfo v-if="$i.policies.chatAvailability === 'unavailable'">{{ i18n.ts._chat.chatNotAvailableForThisAccountOrServer }}</MkInfo>
					<SearchMarker :keywords="['chat']">
						<MkSelect v-model="chatScope" @update:modelValue="save()">
							<template #label><SearchLabel>{{ i18n.ts._chat.chatAllowedUsers }}</SearchLabel></template>
							<option value="everyone">{{ i18n.ts._chat._chatAllowedUsers.everyone }}</option>
							<option value="followers">{{ i18n.ts._chat._chatAllowedUsers.followers }}</option>
							<option value="following">{{ i18n.ts._chat._chatAllowedUsers.following }}</option>
							<option value="mutual">{{ i18n.ts._chat._chatAllowedUsers.mutual }}</option>
							<option value="none">{{ i18n.ts._chat._chatAllowedUsers.none }}</option>
							<template #caption>{{ i18n.ts._chat.chatAllowedUsers_note }}</template>
						</MkSelect>
					</SearchMarker>
				</div>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['lockdown']">
			<FormSection>
				<template #label><SearchLabel>{{ i18n.ts.lockdown }}</SearchLabel><span class="_beta">{{ i18n.ts.beta }}</span></template>

				<div class="_gaps_m">
					<SearchMarker :keywords="['login', 'signin']">
						<MkSwitch :modelValue="requireSigninToViewContents" @update:modelValue="update_requireSigninToViewContents">
							<template #label><SearchLabel>{{ i18n.ts._accountSettings.requireSigninToViewContents }}</SearchLabel></template>
							<template #caption>
								<div>{{ i18n.ts._accountSettings.requireSigninToViewContentsDescription1 }}</div>
								<div><i class="ti ti-alert-triangle" style="color: var(--MI_THEME-warn);"></i> {{ i18n.ts._accountSettings.requireSigninToViewContentsDescription2 }}</div>
							</template>
						</MkSwitch>
					</SearchMarker>

					<SearchMarker :keywords="['follower']">
						<FormSlot>
							<template #label><SearchLabel>{{ i18n.ts._accountSettings.makeNotesFollowersOnlyBefore }}</SearchLabel></template>

							<div class="_gaps_s">
								<MkSelect :modelValue="makeNotesFollowersOnlyBefore_type" @update:modelValue="makeNotesFollowersOnlyBefore = $event === 'relative' ? -604800 : $event === 'absolute' ? Math.floor(Date.now() / 1000) : null">
									<option :value="null">{{ i18n.ts.none }}</option>
									<option value="relative">{{ i18n.ts._accountSettings.notesHavePassedSpecifiedPeriod }}</option>
									<option value="absolute">{{ i18n.ts._accountSettings.notesOlderThanSpecifiedDateAndTime }}</option>
								</MkSelect>

								<MkSelect v-if="makeNotesFollowersOnlyBefore_type === 'relative'" v-model="makeNotesFollowersOnlyBefore">
									<option :value="-3600">{{ i18n.ts.oneHour }}</option>
									<option :value="-86400">{{ i18n.ts.oneDay }}</option>
									<option :value="-259200">{{ i18n.ts.threeDays }}</option>
									<option :value="-604800">{{ i18n.ts.oneWeek }}</option>
									<option :value="-2592000">{{ i18n.ts.oneMonth }}</option>
									<option :value="-7776000">{{ i18n.ts.threeMonths }}</option>
									<option :value="-31104000">{{ i18n.ts.oneYear }}</option>
								</MkSelect>

								<MkInput
									v-if="makeNotesFollowersOnlyBefore_type === 'absolute'"
									:modelValue="formatDateTimeString(new Date(makeNotesFollowersOnlyBefore * 1000), 'yyyy-MM-dd')"
									type="date"
									:manualSave="true"
									@update:modelValue="makeNotesFollowersOnlyBefore = Math.floor(new Date($event).getTime() / 1000)"
								>
								</MkInput>
							</div>

							<template #caption>
								<div><SearchKeyword>{{ i18n.ts._accountSettings.makeNotesFollowersOnlyBeforeDescription }}</SearchKeyword></div>
							</template>
						</FormSlot>
					</SearchMarker>

					<SearchMarker :keywords="['hidden']">
						<FormSlot>
							<template #label><SearchLabel>{{ i18n.ts._accountSettings.makeNotesHiddenBefore }}</SearchLabel></template>

							<div class="_gaps_s">
								<MkSelect :modelValue="makeNotesHiddenBefore_type" @update:modelValue="makeNotesHiddenBefore = $event === 'relative' ? -604800 : $event === 'absolute' ? Math.floor(Date.now() / 1000) : null">
									<option :value="null">{{ i18n.ts.none }}</option>
									<option value="relative">{{ i18n.ts._accountSettings.notesHavePassedSpecifiedPeriod }}</option>
									<option value="absolute">{{ i18n.ts._accountSettings.notesOlderThanSpecifiedDateAndTime }}</option>
								</MkSelect>

								<MkSelect v-if="makeNotesHiddenBefore_type === 'relative'" v-model="makeNotesHiddenBefore">
									<option :value="-3600">{{ i18n.ts.oneHour }}</option>
									<option :value="-86400">{{ i18n.ts.oneDay }}</option>
									<option :value="-259200">{{ i18n.ts.threeDays }}</option>
									<option :value="-604800">{{ i18n.ts.oneWeek }}</option>
									<option :value="-2592000">{{ i18n.ts.oneMonth }}</option>
									<option :value="-7776000">{{ i18n.ts.threeMonths }}</option>
									<option :value="-31104000">{{ i18n.ts.oneYear }}</option>
								</MkSelect>

								<MkInput
									v-if="makeNotesHiddenBefore_type === 'absolute'"
									:modelValue="formatDateTimeString(new Date(makeNotesHiddenBefore * 1000), 'yyyy-MM-dd')"
									type="date"
									:manualSave="true"
									@update:modelValue="makeNotesHiddenBefore = Math.floor(new Date($event).getTime() / 1000)"
								>
								</MkInput>
							</div>

							<template #caption>
								<div><SearchKeyword>{{ i18n.ts._accountSettings.makeNotesHiddenBeforeDescription }}</SearchKeyword></div>
							</template>
						</FormSlot>
					</SearchMarker>

					<MkInfo warn>{{ i18n.ts._accountSettings.mayNotEffectSomeSituations }}</MkInfo>
				</div>
			</FormSection>
		</SearchMarker>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkSelect from '@/components/MkSelect.vue';
import FormSection from '@/components/form/section.vue';
import MkFolder from '@/components/MkFolder.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import { ensureSignin } from '@/i.js';
import { definePage } from '@/page.js';
import FormSlot from '@/components/form/slot.vue';
import { formatDateTimeString } from '@/utility/format-time-string.js';
import MkInput from '@/components/MkInput.vue';
import * as os from '@/os.js';
import MkDisableSection from '@/components/MkDisableSection.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkFeatureBanner from '@/components/MkFeatureBanner.vue';

const $i = ensureSignin();

const isLocked = ref($i.isLocked);
const autoAcceptFollowed = ref($i.autoAcceptFollowed);
const autoRejectFollowRequest = ref($i.autoRejectFollowRequest);
const autoFollowBack = ref($i.autoFollowBack);
const autoFollowOnMove = ref($i.autoFollowOnMove);
const outboxFilter = ref({ public: true, public_non_ltl: true, home: true, ...$i.outboxFilter });
const carefulBot = ref($i.carefulBot);
const noCrawle = ref($i.noCrawle);
const preventAiLearning = ref($i.preventAiLearning);
const isExplorable = ref($i.isExplorable);
const requireSigninToViewContents = ref($i.requireSigninToViewContents ?? false);
const makeNotesFollowersOnlyBefore = ref($i.makeNotesFollowersOnlyBefore ?? null);
const makeNotesHiddenBefore = ref($i.makeNotesHiddenBefore ?? null);
const hideOnlineStatus = ref($i.hideOnlineStatus);
const publicReactions = ref($i.publicReactions);
const hideActivity = ref($i.hideActivity);
const hideNoteFromOverview = ref($i.hideNoteFromOverview);
const hidePublicNotes = ref($i.hidePublicNotes);
const hideHomeNotes = ref($i.hideHomeNotes);
const hideLocalOnlyNotes = ref($i.hideLocalOnlyNotes);
const followingVisibility = ref($i.followingVisibility);
const followersVisibility = ref($i.followersVisibility);
const chatScope = ref($i.chatScope);
const receiveSpecifiedNotesFrom = ref($i.receiveSpecifiedNotesFrom ?? 'all');

const makeNotesFollowersOnlyBefore_type = computed(() => {
	if (makeNotesFollowersOnlyBefore.value == null) {
		return null;
	} else if (makeNotesFollowersOnlyBefore.value >= 0) {
		return 'absolute';
	} else {
		return 'relative';
	}
});

const makeNotesHiddenBefore_type = computed(() => {
	if (makeNotesHiddenBefore.value == null) {
		return null;
	} else if (makeNotesHiddenBefore.value >= 0) {
		return 'absolute';
	} else {
		return 'relative';
	}
});

watch([makeNotesFollowersOnlyBefore, makeNotesHiddenBefore], () => {
	save();
});

async function update_requireSigninToViewContents(value: boolean) {
	if (value === true && instance.federation !== 'none') {
		const { canceled } = await os.confirm({
			type: 'warning',
			text: i18n.ts.acknowledgeNotesAndEnable,
		});
		if (canceled) return;
	}

	requireSigninToViewContents.value = value;
	save();
}

function save() {
	misskeyApi('i/update', {
		isLocked: !!isLocked.value,
		autoAcceptFollowed: !!autoAcceptFollowed.value,
		autoRejectFollowRequest: !!autoRejectFollowRequest.value,
		autoFollowBack: !!autoFollowBack.value,
		autoFollowOnMove: !!autoFollowOnMove.value,
		outboxFilter: {
			public: !!outboxFilter.value.public,
			public_non_ltl: !!outboxFilter.value.public_non_ltl,
			home: !!outboxFilter.value.home,
		},
		carefulBot: !!carefulBot.value,
		noCrawle: !!noCrawle.value,
		preventAiLearning: !!preventAiLearning.value,
		isExplorable: !!isExplorable.value,
		requireSigninToViewContents: !!requireSigninToViewContents.value,
		makeNotesFollowersOnlyBefore: makeNotesFollowersOnlyBefore.value,
		makeNotesHiddenBefore: makeNotesHiddenBefore.value,
		hideOnlineStatus: !!hideOnlineStatus.value,
		publicReactions: !!publicReactions.value,
		hideActivity: !!hideActivity.value,
		hideNoteFromOverview: !!hideNoteFromOverview.value,
		hidePublicNotes: !!hidePublicNotes.value,
		hideHomeNotes: !!hideHomeNotes.value,
		hideLocalOnlyNotes: !!hideLocalOnlyNotes.value,
		followingVisibility: followingVisibility.value,
		followersVisibility: followersVisibility.value,
		chatScope: chatScope.value,
		receiveSpecifiedNotesFrom: receiveSpecifiedNotesFrom.value,
	});
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.privacy,
	icon: 'ti ti-lock-open',
}));
</script>
