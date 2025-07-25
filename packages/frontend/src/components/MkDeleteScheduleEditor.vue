<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, { [$style.padding]: !afterOnly }]">
	<div v-if="!afterOnly" :class="[$style.label, { [$style.withAccent]: !showDetail }]" @click="showDetail = !showDetail"><i class="ti" :class="showDetail ? 'ti-chevron-up' : 'ti-chevron-down'"></i> {{ summaryText }}</div>
	<MkInfo v-if="!isValid" warn>{{ i18n.ts.cannotScheduleLaterThanOneYear }}</MkInfo>
	<section v-if="afterOnly || showDetail">
		<div>
			<MkSelect v-if="!afterOnly" v-model="expiration" small>
				<template #label>{{ i18n.ts._poll.expiration }}</template>
				<option value="at">{{ i18n.ts._poll.at }}</option>
				<option value="after">{{ i18n.ts._poll.after }}</option>
			</MkSelect>
			<section v-if="expiration === 'at'">
				<MkInput v-model="atDate" small type="date" class="input">
					<template #label>{{ i18n.ts._poll.deadlineDate }}</template>
				</MkInput>
				<MkInput v-model="atTime" small type="time" class="input">
					<template #label>{{ i18n.ts._poll.deadlineTime }}</template>
				</MkInput>
			</section>
			<section v-else-if="expiration === 'after'">
				<MkInput v-model="after" small type="number" class="input">
					<template #label>{{ i18n.ts._poll.duration }}</template>
				</MkInput>
				<MkSelect v-model="unit" small>
					<option value="second">{{ i18n.ts._time.second }}</option>
					<option value="minute">{{ i18n.ts._time.minute }}</option>
					<option value="hour">{{ i18n.ts._time.hour }}</option>
					<option value="day">{{ i18n.ts._time.day }}</option>
				</MkSelect>
			</section>
		</div>
	</section>
	<MkSwitch v-if="afterOnly || showDetail" v-model="isScheduledForPrivate">{{ i18n.ts._scheduledNote.makePrivateInsteadOfDelete }}</MkSwitch>
</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import MkInput from './MkInput.vue';
import MkSelect from './MkSelect.vue';
import MkInfo from './MkInfo.vue';
import MkSwitch from './MkSwitch.vue';
import { formatDateTimeString } from '@/utility/format-time-string.js';
import { addTime } from '@/utility/time.js';
import { prefer } from '@/preferences.js';
import { i18n } from '@/i18n.js';

export type DeleteScheduleEditorModelValue = {
	deleteAt: number | null;
	deleteAfter: number | null;
	isValid: boolean;
	isScheduledForPrivate: boolean;
};

const props = defineProps<{
	modelValue: DeleteScheduleEditorModelValue;
	afterOnly?: boolean;
}>();
const emit = defineEmits<{
	(ev: 'update:modelValue', v: DeleteScheduleEditorModelValue): void;
}>();

const expiration = ref<'at' | 'after'>('after');
const atDate = ref(formatDateTimeString(addTime(new Date(), 1, 'day'), 'yyyy-MM-dd'));
const atTime = ref('00:00');
const after = ref(0);
const unit = ref<'second' | 'minute' | 'hour' | 'day'>('second');
const isScheduledForPrivate = ref(props.modelValue.isScheduledForPrivate ?? false);
const isValid = ref(true);

const showDetail = ref(!prefer.s.defaultScheduledNoteDelete);
const summaryText = computed(() => {
	if (showDetail.value) {
		return i18n.ts.scheduledNoteDelete;
	}

	if (expiration.value === 'at') {
		return `${i18n.ts.scheduledNoteDeleteEnabled} (${formatDateTimeString(new Date(calcAt()), 'yyyy/MM/dd HH:mm')})`;
	} else {
		const time = unit.value === 'second' ? i18n.tsx._timeIn.seconds({ n: (after.value).toString() })
			: unit.value === 'minute' ? i18n.tsx._timeIn.minutes({ n: (after.value).toString() })
			: unit.value === 'hour' ? i18n.tsx._timeIn.hours({ n: (after.value).toString() })
			: i18n.tsx._timeIn.days({ n: (after.value).toString() });

		return `${i18n.ts.scheduledNoteDeleteEnabled} (${time})`;
	}
});

const beautifyAfter = (base: number) => {
	let time = base;

	if (time % 60 === 0) {
		unit.value = 'minute';
		time /= 60;
	}

	if (time % 60 === 0) {
		unit.value = 'hour';
		time /= 60;
	}

	if (time % 24 === 0) {
		unit.value = 'day';
		time /= 24;
	}

	after.value = time;
};

beautifyAfter(prefer.s.defaultScheduledNoteDeleteTime / 1000);

if (props.modelValue.deleteAt) {
	expiration.value = 'at';
	const deleteAt = new Date(props.modelValue.deleteAt);
	atDate.value = formatDateTimeString(deleteAt, 'yyyy-MM-dd');
	atTime.value = formatDateTimeString(deleteAt, 'HH:mm');
} else if (typeof props.modelValue.deleteAfter === 'number') {
	expiration.value = 'after';
	beautifyAfter(props.modelValue.deleteAfter / 1000);
}

const calcAt = () => {
	return new Date(`${atDate.value} ${atTime.value}`).getTime();
};

const calcAfter = () => {
	let base = parseInt(after.value.toString());
	switch (unit.value) {
		// @ts-expect-error fallthrough
		case 'day': base *= 24;
			// @ts-expect-error fallthrough
		case 'hour': base *= 60;
			// @ts-expect-error fallthrough
		case 'minute': base *= 60;
			// eslint-disable-next-line no-fallthrough
		case 'second': return base *= 1000;
		default: return null;
	}
};

const isValidTime = () => {
	if (expiration.value === 'at') {
		return calcAt() < Date.now() + (1000 * 60 * 60 * 24 * 365);
	} else {
		const afterMs = calcAfter();
		if (afterMs === null) return false;
		return afterMs < 1000 * 60 * 60 * 24 * 365;
	}
};

isValid.value = isValidTime();

watch([expiration, atDate, atTime, after, unit, isValid, isScheduledForPrivate], () => {
	const isValidTimeValue = isValidTime();
	isValid.value = isValidTimeValue;

	emit('update:modelValue', {
		deleteAt: expiration.value === 'at' ? calcAt() : null,
		deleteAfter: expiration.value === 'after' ? calcAfter() : null,
		isValid: isValidTimeValue,
		isScheduledForPrivate: isScheduledForPrivate.value,
	});
}, {
	deep: true,
});
</script>

	<style lang="scss" module>
	.root {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px 0px;

		>span {
			opacity: 0.7;
		}

		>ul {
			display: block;
			margin: 0;
			padding: 0;
			list-style: none;

			>li {
				display: flex;
				margin: 8px 0;
				padding: 0;
				width: 100%;

				>.input {
					flex: 1;
				}

				>button {
					width: 32px;
					padding: 4px 0;
				}
			}
		}

		>section {
			>div {
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				gap: 12px;

				&:last-child {
					flex: 1 0 auto;

					>div {
						flex-grow: 1;
					}

					>section {
						// MAGIC: Prevent div above from growing unless wrapped to its own line
						flex-grow: 9999;
						align-items: end;
						display: flex;
						gap: 4px;

						>.input {
							flex: 1 1 auto;
						}
					}
				}
			}
		}
	}

	.padding {
		padding: 8px 24px;
	}

	.label {
		font-size: 0.85em;
		padding: 0 0 8px 0;
		user-select: none;
	}

	.withAccent {
		color: var(--MI_THEME-accent);
	}

	.chevronOpening {
		transform: rotateX(180deg);
	}
	</style>
