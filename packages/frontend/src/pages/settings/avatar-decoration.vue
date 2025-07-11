<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/avatar-decoration" :label="i18n.ts.avatarDecorations" :keywords="['avatar', 'icon', 'decoration']" icon="ti ti-sparkles">
	<div>
		<div v-if="!loading" class="_gaps">
			<MkInfo>{{ i18n.tsx._profile.avatarDecorationMax({ max: $i.policies.avatarDecorationLimit }) }} ({{ i18n.tsx.remainingN({ n: $i.policies.avatarDecorationLimit - $i.avatarDecorations.length }) }})</MkInfo>

			<MkAvatar :class="$style.avatar" :user="$i" forceShowDecoration/>

			<div v-if="$i.avatarDecorations.length > 0" v-panel :class="$style.current" class="_gaps_s">
				<div>{{ i18n.ts.inUse }}</div>
				<div :class="$style.decorations">
					<XDecoration
						v-for="(avatarDecoration, i) in $i.avatarDecorations"
						:key="avatarDecoration.id"
						:decoration="avatarDecorations.find(d => d.id === avatarDecoration.id)"
						:angle="avatarDecoration.angle"
						:flipH="avatarDecoration.flipH"
						:offsetX="avatarDecoration.offsetX"
						:offsetY="avatarDecoration.offsetY"
						:active="true"
						@click="openDecoration(avatarDecoration, i)"
					/>
				</div>

				<MkButton danger @click="detachAllDecorations">{{ i18n.ts.detachAll }}</MkButton>
			</div>

			<MkAvatarDecorationSelect
				v-model="selectedDecoration"
				:showLocalDecorations="true"
				:showRemoteDecorations="true"
				@select="openDecoration"
			/>
		</div>
		<div v-else>
			<MkLoading/>
		</div>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent, computed } from 'vue';
import * as Misskey from 'misskey-js';
import XDecoration from './avatar-decoration.decoration.vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';
import { ensureSignin } from '@/i.js';
import MkInfo from '@/components/MkInfo.vue';
import { definePage } from '@/page.js';
import MkAvatarDecorationSelect from '@/components/MkAvatarDecorationSelect.vue';

const $i = ensureSignin();

const selectedDecoration = ref<string | null>(null);
const loading = ref(true);
const avatarDecorations = ref<Misskey.entities.GetAvatarDecorationsResponse>([]);

// Initial data loading
misskeyApi('get-avatar-decorations').then(_avatarDecorations => {
	avatarDecorations.value = _avatarDecorations;
	loading.value = false;
});

async function openDecoration(selectedDecoration, index?: number) {
	const { dispose } = await os.popupAsyncWithDialog(import('./avatar-decoration.dialog.vue').then(x => x.default), {
		decoration: avatarDecorations.value.find(d => d.id === selectedDecoration.id),
		usingIndex: index ?? null,
	}, {
		'attach': async (payload) => {
			const newDecoration = {
				id: selectedDecoration.id,
				angle: payload.angle,
				flipH: payload.flipH,
				offsetX: payload.offsetX,
				offsetY: payload.offsetY,
			};
			const update = [...$i.avatarDecorations, newDecoration];
			await os.apiWithDialog('i/update', {
				avatarDecorations: update,
			});
			$i.avatarDecorations = update;
		},
		'update': async (payload) => {
			if (index === undefined) return;
			const newDecoration = {
				id: selectedDecoration.id,
				angle: payload.angle,
				flipH: payload.flipH,
				offsetX: payload.offsetX,
				offsetY: payload.offsetY,
			};
			const update = [...$i.avatarDecorations];
			update[index] = newDecoration;
			await os.apiWithDialog('i/update', {
				avatarDecorations: update,
			});
			$i.avatarDecorations = update;
		},
		'detach': async () => {
			if (index === undefined) return;
			const update = [...$i.avatarDecorations];
			update.splice(index, 1);
			await os.apiWithDialog('i/update', {
				avatarDecorations: update,
			});
			$i.avatarDecorations = update;
		},
		closed: () => dispose(),
	});
}

function detachAllDecorations() {
	os.confirm({
		type: 'warning',
		text: i18n.ts.areYouSure,
	}).then(async ({ canceled }) => {
		if (canceled) return;
		await os.apiWithDialog('i/update', {
			avatarDecorations: [],
		});
		$i.avatarDecorations = [];
	});
}

const headerActions = computed(() => []);
const headerTabs = computed(() => []);

definePage(() => ({
	title: i18n.ts.avatarDecorations,
	icon: 'ti ti-sparkles',
}));
</script>

<style lang="scss" module>
.avatar {
	display: inline-block;
	width: 72px;
	height: 72px;
	margin: 16px auto;
}

.current {
	padding: 16px;
	border-radius: var(--MI-radius);
}

.decorations {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
	grid-gap: 12px;
}
</style>
