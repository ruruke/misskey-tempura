<!--
SPDX-FileCopyrightText: lqvp
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkFolder>
	<template #icon><i class="ti ti-cloud"></i></template>
	<template #label><SearchLabel>{{ i18n.ts.drive }}</SearchLabel></template>
	<SearchMarker markerId="tempura-settings-drive" :inlining="['tempura-settings-root']" path="/settings/tempura-settings" :keywords="['drive']">
		<div class="_gaps_m">
		</div>
	</SearchMarker>
</MkFolder>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as Misskey from 'misskey-js';
import MkSelect from '@/components/MkSelect.vue';
import MkFolder from '@/components/MkFolder.vue';
import { prefer } from '@/preferences.js';
import { i18n } from '@/i18n.js';
import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';

</script>

<style lang="scss" module>
.label {
    font-size: 0.85em;
    padding: 0 0 8px 0;
    user-select: none;
}
</style>
