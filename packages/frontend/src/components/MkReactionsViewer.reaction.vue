<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<button
	ref="buttonEl"
	v-ripple="canToggle"
	class="_button"
	:class="[$style.root, { [$style.reacted]: myReaction == reaction, [$style.canToggle]: (isLocal && canToggle), [$style.canToggleFallback]: props.reaction.includes('@'), [$style.small]: prefer.s.reactionsDisplaySize === 'small', [$style.large]: prefer.s.reactionsDisplaySize === 'large' }]"
	@click="toggleReaction()"
	@contextmenu.prevent.stop="menu"
>
	<MkReactionIcon style="pointer-events: none;" :class="prefer.s.limitWidthOfReaction ? $style.limitWidth : ''" :reaction="reaction" :emojiUrl="reactionEmojis[reaction.substring(1, reaction.length - 1)]"/>
	<span v-if="!hideReactionCount" :class="$style.count">{{ count }}</span>
</button>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, useTemplateRef, watch } from 'vue';
import * as Misskey from 'misskey-js';
import { getUnicodeEmoji } from '@@/js/emojilist.js';
import MkCustomEmojiDetailedDialog from './MkCustomEmojiDetailedDialog.vue';
import type { MenuItem } from '@/types/menu';
import XDetails from '@/components/MkReactionsViewer.details.vue';
import MkReactionIcon from '@/components/MkReactionIcon.vue';
import * as os from '@/os.js';
import { misskeyApi, misskeyApiGet } from '@/utility/misskey-api.js';
import { useTooltip } from '@/composables/use-tooltip.js';
import { $i } from '@/i.js';
import MkReactionEffect from '@/components/MkReactionEffect.vue';
import { i18n } from '@/i18n.js';
import * as sound from '@/utility/sound.js';
import { checkReactionPermissions } from '@/utility/check-reaction-permissions.js';
import { customEmojisMap } from '@/custom-emojis.js';
import { prefer } from '@/preferences.js';
import { DI } from '@/di.js';
import { noteEvents } from '@/composables/use-note-capture.js';
import { mute as muteEmoji, unmute as unmuteEmoji, checkMuted as isEmojiMuted } from '@/utility/emoji-mute.js';

const reactionChecksMuting = prefer.s.reactionChecksMuting;

const props = defineProps<{
	noteId: Misskey.entities.Note['id'];
	reaction: string;
	reactionEmojis: Misskey.entities.Note['reactionEmojis'];
	myReaction: Misskey.entities.Note['myReaction'];
	count: number;
	isInitial: boolean;
}>();

const mock = inject(DI.mock, false);

const emit = defineEmits<{
	(ev: 'reactionToggled', emoji: string, newCount: number): void;
}>();

const buttonEl = useTemplateRef('buttonEl');

const emojiName = computed(() => props.reaction.replace(/:/g, '').replace(/@\./, ''));
const emoji = computed(() => customEmojisMap.get(emojiName.value) ?? getUnicodeEmoji(props.reaction));

function getReactionName(reaction: string, formated = false) {
	const r = reaction.replaceAll(':', '').replace(/@.*/, '');
	return formated ? `:${r}:` : r;
}

const isLocal = computed(() => !props.reaction.match(/@\w/));
const isAvailable = computed(() => isLocal.value ? true : customEmojisMap.has(getReactionName(props.reaction)));

const canToggle = computed(() => {
	// TODO
	//return isAvailable.value && $i && emoji.value && checkReactionPermissions($i, props.note, emoji.value);
	return $i && emoji.value;
});
const canGetInfo = computed(() => props.reaction.includes(':'));
const isLocalCustomEmoji = props.reaction[0] === ':' && props.reaction.includes('@.');

const plainReaction = computed(() => customEmojisMap.has(emojiName.value) ? getReactionName(props.reaction, true) : props.reaction);

const hideReactionCount = computed(() => {
	switch (prefer.s.hideReactionCount) {
		case 'none': return false;
		case 'all': return true;
		case 'self': return props.note.userId === $i?.id;
		case 'others': return props.note.userId !== $i?.id;
		default: return false;
	}
});

async function toggleReaction() {
	if (!canToggle.value) return;

	const reaction = getReactionName(props.reaction, true);
	const oldReaction = props.myReaction ? getReactionName(props.myReaction, true) : null;

	if (prefer.s.enableReactionConfirm && !oldReaction) {
		const confirm = await os.confirm({
			type: 'info',
			text: i18n.ts.addReactionConfirm,
		});
		if (confirm.canceled) return;
	}

	if (oldReaction) {
		const confirm = await os.confirm({
			type: 'warning',
			text: oldReaction !== reaction ? i18n.ts.changeReactionConfirm : i18n.ts.cancelReactionConfirm,
		});
		if (confirm.canceled) return;

		if (oldReaction !== reaction) {
			sound.playMisskeySfx('reaction');
		}

		if (mock) {
			emit('reactionToggled', reaction, (props.count - 1));
			return;
		}

		misskeyApi('notes/reactions/delete', {
			noteId: props.noteId,
		}).then(() => {
			noteEvents.emit(`unreacted:${props.noteId}`, {
				userId: $i!.id,
				reaction: oldReaction,
			});
			if (oldReaction !== reaction) {
				misskeyApi('notes/reactions/create', {
					noteId: props.noteId,
					reaction: reaction,
				}).then(() => {
					noteEvents.emit(`reacted:${props.noteId}`, {
						userId: $i!.id,
						reaction: props.reaction,
						emoji: emoji.value,
					});
				});
			}
		});
	} else {
		// enableReactionConfirmが有効な場合は上部で既に確認済みなので、confirmOnReactのみチェック
		if (!prefer.s.enableReactionConfirm && prefer.s.confirmOnReact) {
			const confirm = await os.confirm({
				type: 'question',
				text: i18n.tsx.reactAreYouSure({ emoji: props.reaction.replace('@.', '') }),
			});

			if (confirm.canceled) return;
		}

		sound.playMisskeySfx('reaction');

		if (mock) {
			emit('reactionToggled', reaction, (props.count + 1));
			return;
		}

		misskeyApi('notes/reactions/create', {
			noteId: props.noteId,
			reaction: props.reaction,
		}).then(() => {
			noteEvents.emit(`reacted:${props.noteId}`, {
				userId: $i!.id,
				reaction: props.reaction,
				emoji: emoji.value,
			});
		});
		// TODO: 上位コンポーネントでやる
		//if (props.note.text && props.note.text.length > 100 && (Date.now() - new Date(props.note.createdAt).getTime() < 1000 * 3)) {
		//	claimAchievement('reactWithoutRead');
		//}
	}
}

async function menu(ev) {
	let menuItems: MenuItem[] = [];

	if (canGetInfo.value) {
		menuItems.push({
			text: i18n.ts.info,
			icon: 'ti ti-info-circle',
			action: async () => {
				const { dispose } = os.popup(MkCustomEmojiDetailedDialog, {
					emoji: await misskeyApiGet('emoji', {
						name: props.reaction.replace(/:/g, '').replace(/@\./, ''),
					}),
				}, {
					closed: () => dispose(),
				});
			},
		});
	}

	if (isEmojiMuted(props.reaction).value) {
		menuItems.push({
			text: i18n.ts.emojiUnmute,
			icon: 'ti ti-mood-smile',
			action: () => {
				os.confirm({
					type: 'question',
					title: i18n.tsx.unmuteX({ x: isLocalCustomEmoji ? `:${emojiName.value}:` : props.reaction }),
				}).then(({ canceled }) => {
					if (canceled) return;
					unmuteEmoji(props.reaction);
				});
			},
		});
	} else {
		menuItems.push({
			text: i18n.ts.emojiMute,
			icon: 'ti ti-mood-off',
			action: () => {
				os.confirm({
					type: 'question',
					title: i18n.tsx.muteX({ x: isLocalCustomEmoji ? `:${emojiName.value}:` : props.reaction }),
				}).then(({ canceled }) => {
					if (canceled) return;
					muteEmoji(props.reaction);
				});
			},
		});
	}

	os.popupMenu(menuItems, ev.currentTarget ?? ev.target);
}

function anime() {
	if (window.document.hidden || !prefer.s.animation || buttonEl.value == null) return;

	const rect = buttonEl.value.getBoundingClientRect();
	const x = rect.left + 16;
	const y = rect.top + (buttonEl.value.offsetHeight / 2);
	const { dispose } = os.popup(MkReactionEffect, { reaction: props.reaction, x, y }, {
		end: () => dispose(),
	});
}

watch(() => props.count, (newCount, oldCount) => {
	if (oldCount < newCount) anime();
});

onMounted(() => {
	if (!props.isInitial) anime();
});

if (!mock) {
	useTooltip(buttonEl, async (showing) => {
		const useGet = !reactionChecksMuting.value;
		const apiCall = useGet ? misskeyApiGet : misskeyApi;
		const reactions = !prefer.s.hideReactionUsers ? await apiCall('notes/reactions', {
			noteId: props.noteId,
			type: props.reaction,
			limit: 10,
			_cacheKey_: props.count,
		}) : [];

		const users = reactions.map(x => x.user);
		const count = users.length;

		const { dispose } = os.popup(XDetails, {
			showing,
			reaction: props.reaction,
			users,
			count,
			targetElement: buttonEl.value,
		}, {
			closed: () => dispose(),
		});
	}, 100);
}
</script>

<style lang="scss" module>
.root {
	display: inline-flex;
	height: 42px;
	padding: 0 6px;
	font-size: 1.5em;
	border-radius: 6px;
	align-items: center;
	justify-content: center;

	&.canToggle {
		background: var(--MI_THEME-buttonBg);

		&:hover {
			background: rgba(0, 0, 0, 0.1);
		}
	}

	&.canToggleFallback:not(.canToggle):not(.reacted) {
		box-sizing: border-box;
		border: 2px dashed var(--MI_THEME-switchBg);

		&.small {
			border-width: 1px;
			border-color: var(--MI_THEME-buttonBgSub);
		}

		&:hover {
			background: rgba(0, 0, 0, 0.1);
		}
	}

	&:not(.canToggle):not(.canToggleFallback) {
		cursor: default;
	}

	&.small {
		height: 32px;
		font-size: 1em;
		border-radius: 4px;

		> .count {
			font-size: 0.9em;
			line-height: 32px;
		}
	}

	&.large {
		height: 52px;
		font-size: 2em;
		border-radius: 8px;

		> .count {
			font-size: 0.6em;
			line-height: 52px;
		}
	}

	&.reacted, &.reacted:hover {
		background: var(--MI_THEME-accentedBg);
		color: var(--MI_THEME-accent);
		box-shadow: 0 0 0 1px var(--MI_THEME-accent) inset;

		> .count {
			color: var(--MI_THEME-accent);
		}

		> .icon {
			filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
		}
	}
}

.limitWidth {
	max-width: 70px;
	object-fit: contain;
}

.count {
	font-size: 0.7em;
	line-height: 42px;
	margin: 0 0 0 4px;
}
</style>
