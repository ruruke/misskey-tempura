<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<MkPagination v-slot="{ items }" :paginator="paginator">
		<div :class="[$style.fileList, { [$style.grid]: viewMode === 'grid', [$style.list]: viewMode === 'list', '_gaps_s': viewMode === 'list' }]">
			<MkA
				v-for="file in items"
				:key="file.id"
				v-tooltip.mfm="`${file.type}\n${bytes(file.size)}\n${dateString(file.createdAt)}\nby ${file.user ? '@' + Misskey.acct.toString(file.user) : 'system'}`"
				:to="`/admin/file/${file.id}`"
				:class="[$style.file, '_button']"
			>
				<div v-if="file.isSensitive" :class="$style.sensitiveLabel">{{ i18n.ts.sensitive }}</div>
				<div v-if="customEmojiUrls.includes(file.url)" :class="$style.label">
					<img :class="$style.labelImg" src="/client-assets/label.svg"/>
					<p :class="$style.labelText">{{ i18n.ts.emoji }}</p>
				</div>
				<MkDriveFileThumbnail :class="$style.thumbnail" :file="file" fit="contain" :highlightWhenSensitive="true"/>
				<div v-if="viewMode === 'list'" :class="$style.body">
					<div>
						<small style="opacity: 0.7;">{{ file.name }}</small>
					</div>
					<div>
						<MkAcct v-if="file.user" :user="file.user"/>
						<div v-else>{{ i18n.ts.system }}</div>
					</div>
					<div>
						<span style="margin-right: 1em;">{{ file.type }}</span>
						<span>{{ bytes(file.size) }}</span>
					</div>
					<div>
						<span>{{ i18n.ts.registeredDate }}: <MkTime :time="file.createdAt" mode="detail"/></span>
					</div>
				</div>
			</MkA>
		</div>
	</MkPagination>
</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import * as Misskey from 'misskey-js';
import type { Paginator } from '@/utility/paginator.js';
import MkPagination from '@/components/MkPagination.vue';
import MkDriveFileThumbnail from '@/components/MkDriveFileThumbnail.vue';
import bytes from '@/filters/bytes.js';
import { i18n } from '@/i18n.js';
import { dateString } from '@/filters/date.js';
import { customEmojis } from '@/custom-emojis.js';

let customEmojiUrls = ref<string[]>([]);
watch(customEmojis, emojis => {
	customEmojiUrls.value = emojis.map(emoji => emoji.url);
}, { immediate: true });

defineProps<{
	paginator: Paginator<'admin/drive/files'>;
	viewMode: 'grid' | 'list';
}>();
</script>

<style lang="scss" module>
@keyframes sensitive-blink {
	0% { opacity: 1; }
	50% { opacity: 0; }
}

.list {
	> .file {
		display: flex;
		width: 100%;
		height: auto;
		box-sizing: border-box;
		text-align: left;
		align-items: center;
	}

	> .file:hover {
		color: var(--MI_THEME-accent);
	}

	> .file > .thumbnail {
		width: 128px;
		height: 128px;
	}

	> .file > .body {
		margin-left: 0.3em;
		padding: 8px;
		flex: 1;

		@media (max-width: 500px) {
			font-size: 14px;
		}
	}
}

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
	grid-gap: 12px;

	> .file {
		position: relative;
		aspect-ratio: 1;
	}

	.thumbnail {
		width: 100%;
		height: 100%;
	}
}

.sensitiveLabel {
	position: absolute;
	z-index: 10;
	top: 8px;
	left: 8px;
	padding: 2px 4px;
	background: #ff0000bf;
	color: #fff;
	border-radius: 4px;
	font-size: 85%;
	animation: sensitive-blink 1s infinite;
}

.label {
	position: absolute;
	top: 0;
	left: 0;
	pointer-events: none;
	&::before,
	&::after {
		content: "";
		display: block;
		position: absolute;
		z-index: 1;
		background: #0c7ac9;
	}
	&::before {
		top: 0;
		left: 57px;
		width: 28px;
		height: 8px;
	}
	&::after {
		top: 57px;
		left: 0;
		width: 8px;
		height: 28px;
	}
}

.labelImg {
	position: absolute;
	z-index: 2;
	top: 0;
	left: 0;
}

.labelText {
	position: absolute;
	z-index: 3;
	top: 19px;
	left: -28px;
	width: 120px;
	margin: 0;
	text-align: center;
	line-height: 28px;
	color: #fff;
	transform: rotate(-45deg);
}
</style>
