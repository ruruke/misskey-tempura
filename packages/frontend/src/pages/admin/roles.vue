<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px;">
		<div class="_gaps">
			<MkFolder>
				<template #label>{{ i18n.ts._role.baseRole }}</template>
				<template #footer>
					<MkButton primary rounded @click="updateBaseRole">{{ i18n.ts.save }}</MkButton>
				</template>
				<div class="_gaps_s">
					<MkInput v-model="baseRoleQ" type="search">
						<template #prefix><i class="ti ti-search"></i></template>
					</MkInput>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.rateLimitFactor, 'rateLimitFactor'])">
						<template #label>{{ i18n.ts._role._options.rateLimitFactor }}</template>
						<template #suffix>{{ Math.floor(policies.rateLimitFactor * 100) }}%</template>
						<MkRange :modelValue="policies.rateLimitFactor * 100" :min="30" :max="300" :step="10" :textConverter="(v) => `${v}%`" @update:modelValue="v => policies.rateLimitFactor = (v / 100)">
							<template #caption>{{ i18n.ts._role._options.descriptionOfRateLimitFactor }}</template>
						</MkRange>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.gtlAvailable, 'gtlAvailable'])">
						<template #label>{{ i18n.ts._role._options.gtlAvailable }}</template>
						<template #suffix>{{ policies.gtlAvailable ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.gtlAvailable">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.ltlAvailable, 'ltlAvailable'])">
						<template #label>{{ i18n.ts._role._options.ltlAvailable }}</template>
						<template #suffix>{{ policies.ltlAvailable ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.ltlAvailable">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canPublicNote, 'canPublicNote'])">
						<template #label>{{ i18n.ts._role._options.canPublicNote }}</template>
						<template #suffix>{{ policies.canPublicNote ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canPublicNote">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.chatAvailability, 'chatAvailability'])">
						<template #label>{{ i18n.ts._role._options.chatAvailability }}</template>
						<template #suffix>{{ policies.chatAvailability === 'available' ? i18n.ts.yes : policies.chatAvailability === 'readonly' ? i18n.ts.readonly : i18n.ts.no }}</template>
						<MkSelect v-model="policies.chatAvailability">
							<template #label>{{ i18n.ts.enable }}</template>
							<option value="available">{{ i18n.ts.enabled }}</option>
							<option value="readonly">{{ i18n.ts.readonly }}</option>
							<option value="unavailable">{{ i18n.ts.disabled }}</option>
						</MkSelect>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canHomeNote, 'canHomeNote'])">
						<template #label>{{ i18n.ts._role._options.canHomeNote }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canHomeNote ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canHomeNote">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canPublicNonLtlNote, 'canPublicNonLtlNote'])">
						<template #label>{{ i18n.ts._role._options.canPublicNonLtlNote }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canPublicNonLtlNote ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canPublicNonLtlNote">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.scheduleNoteMax, 'scheduleNoteMax'])">
						<template #label>{{ i18n.ts._role._options.scheduleNoteMax }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.scheduleNoteMax }}</template>
						<MkInput v-model="policies.scheduleNoteMax" type="number">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.mentionMax, 'mentionLimit'])">
						<template #label>{{ i18n.ts._role._options.mentionMax }}</template>
						<template #suffix>{{ policies.mentionLimit }}</template>
						<MkInput v-model="policies.mentionLimit" type="number">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canInvite, 'canInvite'])">
						<template #label>{{ i18n.ts._role._options.canInvite }}</template>
						<template #suffix>{{ policies.canInvite ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canInvite">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.inviteLimit, 'inviteLimit'])">
						<template #label>{{ i18n.ts._role._options.inviteLimit }}</template>
						<template #suffix>{{ policies.inviteLimit }}</template>
						<MkInput v-model="policies.inviteLimit" type="number">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.inviteLimitCycle, 'inviteLimitCycle'])">
						<template #label>{{ i18n.ts._role._options.inviteLimitCycle }}</template>
						<template #suffix>{{ policies.inviteLimitCycle + i18n.ts._time.minute }}</template>
						<MkInput v-model="policies.inviteLimitCycle" type="number">
							<template #suffix>{{ i18n.ts._time.minute }}</template>
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.inviteExpirationTime, 'inviteExpirationTime'])">
						<template #label>{{ i18n.ts._role._options.inviteExpirationTime }}</template>
						<template #suffix>{{ policies.inviteExpirationTime + i18n.ts._time.minute }}</template>
						<MkInput v-model="policies.inviteExpirationTime" type="number">
							<template #suffix>{{ i18n.ts._time.minute }}</template>
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canManageAvatarDecorations, 'canManageAvatarDecorations'])">
						<template #label>{{ i18n.ts._role._options.canManageAvatarDecorations }}</template>
						<template #suffix>{{ policies.canManageAvatarDecorations ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canManageAvatarDecorations">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canUseRemoteIconDecorations, 'canUseRemoteIconDecorations'])">
						<template #label>{{ i18n.ts._role._options.canUseRemoteIconDecorations }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canUseRemoteIconDecorations ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canUseRemoteIconDecorations">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canManageCustomEmojis, 'canManageCustomEmojis'])">
						<template #label>{{ i18n.ts._role._options.canManageCustomEmojis }}</template>
						<template #suffix>{{ policies.canManageCustomEmojis ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canManageCustomEmojis">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canEmojiDeletion, 'canEmojiDeletion'])">
						<template #label>{{ i18n.ts._role._options.canEmojiDeletion }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canEmojiDeletion ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canEmojiDeletion">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canSearchNotes, 'canSearchNotes'])">
						<template #label>{{ i18n.ts._role._options.canSearchNotes }}</template>
						<template #suffix>{{ policies.canSearchNotes ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canSearchNotes">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canSearchUsers, 'canSearchUsers'])">
						<template #label>{{ i18n.ts._role._options.canSearchUsers }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canSearchUsers ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canSearchUsers">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canUseTranslator, 'canUseTranslator'])">
						<template #label>{{ i18n.ts._role._options.canUseTranslator }}</template>
						<template #suffix>{{ policies.canUseTranslator ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canUseTranslator">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.driveCapacity, 'driveCapacityMb'])">
						<template #label>{{ i18n.ts._role._options.driveCapacity }}</template>
						<template #suffix>{{ policies.driveCapacityMb }}MB</template>
						<MkInput v-model="policies.driveCapacityMb" type="number">
							<template #suffix>MB</template>
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.maxFileSize, 'maxFileSizeMb'])">
						<template #label>{{ i18n.ts._role._options.maxFileSize }}</template>
						<template #suffix>{{ policies.maxFileSizeMb }}MB</template>
						<MkInput v-model="policies.maxFileSizeMb" type="number">
							<template #suffix>MB</template>
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.uploadableFileTypes, 'uploadableFileTypes'])">
						<template #label>{{ i18n.ts._role._options.uploadableFileTypes }}</template>
						<template #suffix>...</template>
						<MkTextarea :modelValue="policies.uploadableFileTypes.join('\n')" @update:modelValue="v => policies.uploadableFileTypes = v.split('\n')">
							<template #caption>
								<div>{{ i18n.ts._role._options.uploadableFileTypes_caption }}</div>
								<div><i class="ti ti-alert-triangle" style="color: var(--MI_THEME-warn);"></i> {{ i18n.tsx._role._options.uploadableFileTypes_caption2({ x: 'application/octet-stream' }) }}</div>
							</template>
						</MkTextarea>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.alwaysMarkNsfw, 'alwaysMarkNsfw'])">
						<template #label>{{ i18n.ts._role._options.alwaysMarkNsfw }}</template>
						<template #suffix>{{ policies.alwaysMarkNsfw ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.alwaysMarkNsfw">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canUpdateBioMedia, 'canUpdateBioMedia'])">
						<template #label>{{ i18n.ts._role._options.canUpdateBioMedia }}</template>
						<template #suffix>{{ policies.canUpdateBioMedia ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canUpdateBioMedia">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.pinMax, 'pinLimit'])">
						<template #label>{{ i18n.ts._role._options.pinMax }}</template>
						<template #suffix>{{ policies.pinLimit }}</template>
						<MkInput v-model="policies.pinLimit" type="number">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.antennaMax, 'antennaLimit'])">
						<template #label>{{ i18n.ts._role._options.antennaMax }}</template>
						<template #suffix>{{ policies.antennaLimit }}</template>
						<MkInput v-model="policies.antennaLimit" type="number">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.wordMuteMax, 'wordMuteLimit'])">
						<template #label>{{ i18n.ts._role._options.wordMuteMax }}</template>
						<template #suffix>{{ policies.wordMuteLimit }}</template>
						<MkInput v-model="policies.wordMuteLimit" type="number">
							<template #suffix>chars</template>
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.webhookMax, 'webhookLimit'])">
						<template #label>{{ i18n.ts._role._options.webhookMax }}</template>
						<template #suffix>{{ policies.webhookLimit }}</template>
						<MkInput v-model="policies.webhookLimit" type="number">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.clipMax, 'clipLimit'])">
						<template #label>{{ i18n.ts._role._options.clipMax }}</template>
						<template #suffix>{{ policies.clipLimit }}</template>
						<MkInput v-model="policies.clipLimit" type="number">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.noteEachClipsMax, 'noteEachClipsLimit'])">
						<template #label>{{ i18n.ts._role._options.noteEachClipsMax }}</template>
						<template #suffix>{{ policies.noteEachClipsLimit }}</template>
						<MkInput v-model="policies.noteEachClipsLimit" type="number">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.userListMax, 'userListLimit'])">
						<template #label>{{ i18n.ts._role._options.userListMax }}</template>
						<template #suffix>{{ policies.userListLimit }}</template>
						<MkInput v-model="policies.userListLimit" type="number">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.userEachUserListsMax, 'userEachUserListsLimit'])">
						<template #label>{{ i18n.ts._role._options.userEachUserListsMax }}</template>
						<template #suffix>{{ policies.userEachUserListsLimit }}</template>
						<MkInput v-model="policies.userEachUserListsLimit" type="number">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canHideAds, 'canHideAds'])">
						<template #label>{{ i18n.ts._role._options.canHideAds }}</template>
						<template #suffix>{{ policies.canHideAds ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canHideAds">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.avatarDecorationLimit, 'avatarDecorationLimit'])">
						<template #label>{{ i18n.ts._role._options.avatarDecorationLimit }}</template>
						<template #suffix>{{ policies.avatarDecorationLimit }}</template>
						<MkInput v-model="avatarDecorationLimit" type="number" :min="0" :max="16" @update:modelValue="updateAvatarDecorationLimit">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canImportAntennas, 'canImportAntennas'])">
						<template #label>{{ i18n.ts._role._options.canImportAntennas }}</template>
						<template #suffix>{{ policies.canImportAntennas ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canImportAntennas">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canImportBlocking, 'canImportBlocking'])">
						<template #label>{{ i18n.ts._role._options.canImportBlocking }}</template>
						<template #suffix>{{ policies.canImportBlocking ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canImportBlocking">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canImportFollowing, 'canImportFollowing'])">
						<template #label>{{ i18n.ts._role._options.canImportFollowing }}</template>
						<template #suffix>{{ policies.canImportFollowing ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canImportFollowing">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canImportMuting, 'canImportMuting'])">
						<template #label>{{ i18n.ts._role._options.canImportMuting }}</template>
						<template #suffix>{{ policies.canImportMuting ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canImportMuting">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canImportUserLists, 'canImportUserList'])">
						<template #label>{{ i18n.ts._role._options.canImportUserLists }}</template>
						<template #suffix>{{ policies.canImportUserLists ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canImportUserLists">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.noteDraftLimit, 'noteDraftLimit'])">
						<template #label>{{ i18n.ts._role._options.noteDraftLimit }}</template>
						<template #suffix>{{ policies.noteDraftLimit }}</template>
						<MkInput v-model="policies.noteDraftLimit" type="number" :min="0">
						</MkInput>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.watermarkAvailable, 'watermarkAvailable'])">
						<template #label>{{ i18n.ts._role._options.watermarkAvailable }}</template>
						<template #suffix>{{ policies.watermarkAvailable ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.watermarkAvailable">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canAddRoles, 'canAddRoles'])">
						<template #label>{{ i18n.ts._role._options.canAddRoles }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canAddRoles ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canAddRoles">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canCreateRole, 'canCreateRole'])">
						<template #label>{{ i18n.ts._role._options.canCreateRole }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canCreateRole ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canCreateRole">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canUseUnFollowNotification, 'canUseUnFollowNotification'])">
						<template #label>{{ i18n.ts._role._options.canUseUnFollowNotification }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canUseUnFollowNotification ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canUseUnFollowNotification">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canUseBlockedNotification, 'canUseBlockedNotification'])">
						<template #label>{{ i18n.ts._role._options.canUseBlockedNotification }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canUseBlockedNotification ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canUseBlockedNotification">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canUseUnBlockedNotification, 'canUseUnBlockedNotification'])">
						<template #label>{{ i18n.ts._role._options.canUseUnBlockedNotification }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canUseUnBlockedNotification ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canUseUnBlockedNotification">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canReadFollowHistory, 'canReadFollowHistory'])">
						<template #label>{{ i18n.ts._role._options.canReadFollowHistory }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canReadFollowHistory ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canReadFollowHistory">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canAutoFollowBack, 'canAutoFollowBack'])">
						<template #label>{{ i18n.ts._role._options.canAutoFollowBack }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canAutoFollowBack ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canAutoFollowBack">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canUseTruncate, 'canUseTruncate'])">
						<template #label>{{ i18n.ts._role._options.canUseTruncate }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canUseTruncate ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canUseTruncate">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canUseMakePrivate, 'canUseMakePrivate'])">
						<template #label>{{ i18n.ts._role._options.canUseMakePrivate }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canUseMakePrivate ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canUseMakePrivate">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canUpdateCounters, 'canUpdateCounters'])">
						<template #label>{{ i18n.ts._role._options.canUpdateCounters }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canUpdateCounters ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canUpdateCounters">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canUseGeminiLLMAPI, 'canUseGeminiLLMAPI'])">
						<template #label>{{ i18n.ts._role._options.canUseGeminiLLMAPI }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canUseGeminiLLMAPI ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canUseGeminiLLMAPI">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canSkipInviteEmailAuth, 'canSkipInviteEmailAuth'])">
						<template #label>{{ i18n.ts._role._options.canSkipInviteEmailAuth }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canSkipInviteEmailAuth ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canSkipInviteEmailAuth">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>

					<MkFolder v-if="matchQuery([i18n.ts._role._options.canSkipInviteApproval, 'canSkipInviteApproval'])">
						<template #label>{{ i18n.ts._role._options.canSkipInviteApproval }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
						<template #suffix>{{ policies.canSkipInviteApproval ? i18n.ts.yes : i18n.ts.no }}</template>
						<MkSwitch v-model="policies.canSkipInviteApproval">
							<template #label>{{ i18n.ts.enable }}</template>
						</MkSwitch>
					</MkFolder>
				</div>
			</MkFolder>
			<MkButton primary rounded @click="create"><i class="ti ti-plus"></i> {{ i18n.ts._role.new }}</MkButton>
			<div class="_gaps_s">
				<MkFoldableSection>
					<template #header>{{ i18n.ts._role.manualRoles }}</template>
					<div class="_gaps_s">
						<MkRolePreview v-for="role in roles.filter(x => x.target === 'manual' && x.permissionGroup !== 'Community')" :key="role.id" :role="role" :forModeration="true"/>
					</div>
				</MkFoldableSection>
				<MkFoldableSection>
					<template #header>{{ i18n.ts._role.conditionalRoles }}</template>
					<div class="_gaps_s">
						<MkRolePreview v-for="role in roles.filter(x => x.target === 'conditional' && x.permissionGroup !== 'Community')" :key="role.id" :role="role" :forModeration="true"/>
					</div>
				</MkFoldableSection>
				<MkFoldableSection>
					<template #header>{{ i18n.ts.communityRole }}</template>
					<div class="_gaps_s">
						<MkRolePreview v-for="role in roles.filter(x => x.permissionGroup === 'Community')" :key="role.id" :role="role" :forModeration="true"/>
					</div>
				</MkFoldableSection>
			</div>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { ROLE_POLICIES } from '@@/js/const.js';
import MkInput from '@/components/MkInput.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkButton from '@/components/MkButton.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkRange from '@/components/MkRange.vue';
import MkRolePreview from '@/components/MkRolePreview.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { instance, fetchInstance } from '@/instance.js';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { useRouter } from '@/router.js';
import MkTextarea from '@/components/MkTextarea.vue';

const router = useRouter();
const baseRoleQ = ref('');

const roles = await misskeyApi('admin/roles/list');

const policies = reactive<Record<typeof ROLE_POLICIES[number], any>>({});
for (const ROLE_POLICY of ROLE_POLICIES) {
	policies[ROLE_POLICY] = instance.policies[ROLE_POLICY];
}

const avatarDecorationLimit = computed({
	get: () => Math.min(16, Math.max(0, policies.avatarDecorationLimit)),
	set: (value) => {
		policies.avatarDecorationLimit = Math.min(Number(value), 16);
	},
});

function updateAvatarDecorationLimit(value: string | number) {
	avatarDecorationLimit.value = Number(value);
}

function matchQuery(keywords: string[]): boolean {
	if (baseRoleQ.value.trim().length === 0) return true;
	return keywords.some(keyword => keyword.toLowerCase().includes(baseRoleQ.value.toLowerCase()));
}

async function updateBaseRole() {
	await os.apiWithDialog('admin/roles/update-default-policies', {
		policies,
	});
	fetchInstance(true);
}

function create() {
	router.push('/admin/roles/new');
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.roles,
	icon: 'ti ti-badges',
}));
</script>

<style lang="scss" module>

</style>
