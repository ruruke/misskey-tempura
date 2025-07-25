<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="meta" :class="$style.root">
	<MkFeaturedPhotos :class="$style.bg"/>
	<XTimeline v-if="meta.entranceShowFeatured" :class="$style.tl"/>
	<div :class="$style.shape1"></div>
	<div :class="$style.shape2"></div>
	<div :class="$style.logoWrapper">
		<div :class="$style.poweredBy">Powered by</div>
		<img :src="tempurasvg" :class="$style.misskey"/>
	</div>
	<div v-if="meta.entranceShowDashboard" :style="cssVariables" :class="$style.contents">
		<MkVisitorDashboard/>
	</div>
	<div v-if="instances && instances.length > 0 && meta.entranceShowFederation" :class="$style.federation">
		<MkMarqueeText :duration="40">
			<MkA v-for="instance in instances" :key="instance.id" :class="$style.federationInstance" :to="`/instance-info/${instance.host}`" behavior="window">
				<img v-if="instance.iconUrl" :class="$style.federationInstanceIcon" :src="getInstanceIcon(instance)" alt=""/>
				<span class="_monospace">{{ instance.host }}</span>
			</MkA>
		</MkMarqueeText>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import * as Misskey from 'misskey-js';
import XTimeline from './welcome.timeline.vue';
import MkMarqueeText from '@/components/MkMarqueeText.vue';
import MkFeaturedPhotos from '@/components/MkFeaturedPhotos.vue';
import tempurasvg from '/client-assets/logo-tempura.svg';
import { misskeyApiGet } from '@/utility/misskey-api.js';
import MkVisitorDashboard from '@/components/MkVisitorDashboard.vue';
import { getProxiedImageUrl } from '@/utility/media-proxy.js';
import { instance as meta } from '@/instance.js';

const instances = ref<Misskey.entities.FederationInstance[]>();

const cssVariables = computed(() => {
	const parseValue = (value: string | number | null | undefined): number => {
		if (value === null || value === undefined) return 0;
		if (typeof value === 'number') return value;
		const num = parseInt(value, 10);
		return isNaN(num) ? 0 : num;
	};

	const left = parseValue(meta.entranceMarginLeft);
	const right = parseValue(meta.entranceMarginRight);
	const shouldCenter = left === 0 && right === 0;

	return {
		'--margin-left': shouldCenter ? 'auto' : toCssUnit(meta.entranceMarginLeft),
		'--margin-right': shouldCenter ? 'auto' : toCssUnit(meta.entranceMarginRight),
		'--margin-top': toCssUnit(meta.entranceMarginTop),
		'--margin-bottom': toCssUnit(meta.entranceMarginBottom),
	};
});

function toCssUnit(value: string | number | null | undefined): string {
	if (value === null || value === undefined) return '';
	if (typeof value === 'number') return `${value}px`;
	if (/^\d+$/.test(value)) return `${value}px`; // 数値のみの文字列もpx変換
	return value;
}

function getInstanceIcon(instance: Misskey.entities.FederationInstance): string {
	if (!instance.iconUrl) {
		return '';
	}

	return getProxiedImageUrl(instance.iconUrl, 'preview');
}

if (meta.entranceShowFederation) {
	misskeyApiGet('federation/instances', {
		sort: '+pubSub',
		limit: 20,
		blocked: false,
	}).then(_instances => {
		instances.value = _instances;
	});
}

</script>

<style lang="scss" module>
.root {
	height: 100cqh;
	overflow: auto;
	overscroll-behavior: contain;
}

.bg {
	position: fixed;
	top: 0;
	right: 0;
	width: 80vw; // 100%からshapeの幅を引いている
	height: 100vh;
}

.tl {
	position: fixed;
	top: 0;
	bottom: 0;
	right: 64px;
	margin: auto;
	padding: 128px 0;
	width: 500px;
	height: calc(100% - 256px);
	overflow: hidden;
	-webkit-mask-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 128px, rgba(0,0,0,1) calc(100% - 128px), rgba(0,0,0,0) 100%);
	mask-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 128px, rgba(0,0,0,1) calc(100% - 128px), rgba(0,0,0,0) 100%);

	@media (max-width: 1200px) {
		display: none;
	}
}

.shape1 {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: var(--MI_THEME-accent);
	clip-path: polygon(0% 0%, 45% 0%, 20% 100%, 0% 100%);
}
.shape2 {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: var(--MI_THEME-accent);
	clip-path: polygon(0% 0%, 25% 0%, 35% 100%, 0% 100%);
	opacity: 0.5;
}

.logoWrapper {
	position: fixed;
	top: 36px;
	left: 36px;
	flex: auto;
	color: #fff;
	user-select: none;
	pointer-events: none;
}

.poweredBy {
	margin-bottom: 2px;
}

.misskey {
	width: 120px;

	@media (max-width: 450px) {
		width: 100px;
	}
}

.contents {
	position: relative;
	width: min(430px, calc(100% - 32px));
	padding: 100px 0 100px 0;
	margin-left: var(--margin-left, 128px);
	margin-right: var(--margin-right, 0);
	margin-top: var(--margin-top, 0);
	margin-bottom: var(--margin-bottom, 0);

	@media (max-width: 1200px) {
		margin: auto;
	}
}

.federation {
	position: fixed;
	bottom: 16px;
	left: 0;
	right: 0;
	margin: auto;
	background: color(from var(--MI_THEME-panel) srgb r g b / 0.5);
	-webkit-backdrop-filter: var(--MI-blur, blur(15px));
	backdrop-filter: var(--MI-blur, blur(15px));
	border-radius: 999px;
	overflow: clip;
	width: 800px;
	padding: 8px 0;

	@media (max-width: 900px) {
		display: none;
	}
}

.federationInstance {
	display: inline-flex;
	align-items: center;
	vertical-align: bottom;
	padding: 6px 12px 6px 6px;
	margin: 0 10px 0 0;
	background: var(--MI_THEME-panel);
	border-radius: 999px;
}

.federationInstanceIcon {
	display: inline-block;
	width: 20px;
	height: 20px;
	margin-right: 5px;
	border-radius: 999px;
}
</style>
