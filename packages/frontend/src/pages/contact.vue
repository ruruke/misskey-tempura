<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div class="_spacer" style="--MI_SPACER-w: 600px; --MI_SPACER-min: 20px;">
		<div class="_gaps_m">
			<!-- コンタクトフォームボタン -->
			<div v-if="instance.enableContactForm" style="text-align: center;">
				<MkButton primary rounded @click="router.push('/contact-form')">
					<i class="ti ti-mail"></i> {{ i18n.ts._contactForm._userForm.contactForm }}
				</MkButton>
			</div>

			<MkKeyValue :copy="instance.maintainerName">
				<template #key>{{ i18n.ts.administrator }}</template>
				<template #value>
					<template v-if="instance.maintainerName">{{ instance.maintainerName }}</template>
					<span v-else style="opacity: 0.7;">({{ i18n.ts.none }})</span>
				</template>
			</MkKeyValue>
			<MkKeyValue :copy="instance.maintainerEmail">
				<template #key>{{ i18n.ts.contact }}</template>
				<template #value>
					<template v-if="instance.maintainerEmail">{{ instance.maintainerEmail }}</template>
					<span v-else style="opacity: 0.7;">({{ i18n.ts.none }})</span>
				</template>
			</MkKeyValue>
			<MkKeyValue :copy="instance.inquiryUrl">
				<template #key>{{ i18n.ts.inquiry }}</template>
				<template #value>
					<MkLink v-if="instance.inquiryUrl" :url="instance.inquiryUrl" target="_blank">{{ instance.inquiryUrl }}</MkLink>
					<span v-else style="opacity: 0.7;">({{ i18n.ts.none }})</span>
				</template>
			</MkKeyValue>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import { definePage } from '@/page.js';
import { useRouter } from '@/router.js';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkLink from '@/components/MkLink.vue';
import MkButton from '@/components/MkButton.vue';

const router = useRouter();

definePage(() => ({
	title: i18n.ts.inquiry,
	icon: 'ti ti-help-circle',
}));
</script>
