<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkFolder>
	<template #label>{{ invite.code }}</template>
	<template #suffix>
		<span v-if="invite.used">{{ i18n.ts.used }}</span>
		<span v-else-if="isExpired" style="color: var(--MI_THEME-error)">{{ i18n.ts.expired }}</span>
		<span v-else style="color: var(--MI_THEME-success)">{{ i18n.ts.unused }}</span>
	</template>
	<template v-if="!invite.used || moderator" #footer>
		<div class="_buttons">
			<template v-if="!isExpired && !invite.used">
				<MkButton primary rounded @click="copyInviteUrl(invite.code)"><i class="ti ti-link"></i> {{ i18n.ts.copyInviteUrl }}</MkButton>
				<MkButton primary rounded @click="copyInviteCode(invite.code)"><i class="ti ti-copy"></i> {{ i18n.ts.copyInviteCode }}</MkButton>
			</template>
			<MkButton danger rounded @click="deleteCode()"><i class="ti ti-trash"></i> {{ i18n.ts.delete }}</MkButton>
		</div>
	</template>

	<div :class="$style.root">
		<div :class="$style.items">
			<div>
				<div :class="$style.label">{{ i18n.ts.invitationCode }}</div>
				<div class="_selectableAtomic">{{ invite.code }}</div>
			</div>
			<div v-if="moderator">
				<div :class="$style.label">{{ i18n.ts.inviteCodeCreator }}</div>
				<div v-if="invite.createdBy" :class="$style.user">
					<MkAvatar :user="invite.createdBy" :class="$style.avatar" link preview/>
					<MkUserName :user="invite.createdBy" :nowrap="false"/>
					<div v-if="moderator">({{ invite.createdBy.id }})</div>
				</div>
				<div v-else>system</div>
			</div>
			<div v-if="invite.used">
				<div :class="$style.label">{{ i18n.ts.registeredUserUsingInviteCode }}</div>
				<div v-if="invite.usedBy" :class="$style.user">
					<MkAvatar :user="invite.usedBy" :class="$style.avatar" link preview/>
					<MkUserName :user="invite.usedBy" :nowrap="false"/>
					<div v-if="moderator">({{ invite.usedBy.id }})</div>
				</div>
				<div v-else>{{ i18n.ts.unknown }} ({{ i18n.ts.waitingForMailAuth }})</div>
			</div>
			<div v-if="invite.expiresAt && !invite.used">
				<div :class="$style.label">{{ i18n.ts.expirationDate }}</div>
				<div><MkTime :time="invite.expiresAt" mode="absolute"/></div>
			</div>
			<div v-if="invite.usedAt">
				<div :class="$style.label">{{ i18n.ts.inviteCodeUsedAt }}</div>
				<div><MkTime :time="invite.usedAt" mode="absolute"/></div>
			</div>
			<div v-if="moderator">
				<div :class="$style.label">{{ i18n.ts.createdAt }}</div>
				<div><MkTime :time="invite.createdAt" mode="absolute"/></div>
			</div>
			<div v-if="moderator || ($i && $i.policies.canSkipInviteEmailAuth)">
				<div :class="$style.label">{{ i18n.ts.skipEmailAuth }}</div>
				<div>
					<template v-if="invite.skipEmailAuth">
						✅️
					</template>
					<template v-else>
						❌
					</template>
				</div>
			</div>
			<div v-if="moderator || ($i && $i.policies.canSkipInviteApproval)">
				<div :class="$style.label">{{ i18n.ts.skipApproval }}</div>
				<div>
					<template v-if="invite.skipApproval">
						✅️
					</template>
					<template v-else>
						❌
					</template>
				</div>
			</div>
			<div v-if="invite.description">
				<div :class="$style.label">{{ i18n.ts.description }}</div>
				<div>{{ invite.description }}</div>
			</div>
		</div>
	</div>
</MkFolder>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as Misskey from 'misskey-js';
import MkFolder from '@/components/MkFolder.vue';
import MkButton from '@/components/MkButton.vue';
import { copyInviteCode, copyInviteUrl } from '@/utility/invite.js';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import { $i } from '@/i.js';

const props = defineProps<{
	invite: Misskey.entities.InviteCode;
	moderator?: boolean;
}>();

const emits = defineEmits<{
	(event: 'deleted', value: string): void;
}>();

const isExpired = computed(() => {
	return props.invite.expiresAt && new Date(props.invite.expiresAt) < new Date();
});

function deleteCode() {
	os.apiWithDialog('invite/delete', {
		inviteId: props.invite.id,
	});
	emits('deleted', props.invite.id);
}
</script>

<style lang="scss" module>
.root {
	text-align: left;
}

.items {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	grid-gap: 12px;
}

.label {
	font-size: 0.85em;
	padding: 0 0 8px 0;
	user-select: none;
	opacity: 0.7;
}

.user {
	display: flex;
	align-items: center;
	gap: 8px;
}

.avatar {
	--height: 24px;
	width: var(--height);
	height: var(--height);
}
</style>
