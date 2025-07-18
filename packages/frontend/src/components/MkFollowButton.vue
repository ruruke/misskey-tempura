<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<button
	v-if="($i != null && $i.id != user.id) && (!user.isBlocked && !user.isBlocking)"
	class="_button"
	:class="[$style.root, { [$style.wait]: wait, [$style.active]: userDetailed.isFollowing || userDetailed.hasPendingFollowRequestFromYou, [$style.full]: full, [$style.large]: large }]"
	:disabled="wait"
	@click="onClick"
>
	<template v-if="!wait">
		<template v-if="userDetailed.hasPendingFollowRequestFromYou && userDetailed.isLocked">
			<span v-if="full" :class="$style.text">{{ i18n.ts.followRequestPending }}</span><i class="ti ti-hourglass-empty"></i>
		</template>
		<template v-else-if="userDetailed.hasPendingFollowRequestFromYou && !userDetailed.isLocked">
			<!-- つまりリモートフォローの場合。 -->
			<span v-if="full" :class="$style.text">{{ i18n.ts.processing }}</span><MkLoading :em="true" :colored="false"/>
		</template>
		<template v-else-if="userDetailed.isFollowing">
			<span v-if="full" :class="$style.text">{{ i18n.ts.youFollowing }}</span><i class="ti ti-minus"></i>
		</template>
		<template v-else-if="!userDetailed.isFollowing && userDetailed.isLocked">
			<span v-if="full" :class="$style.text">{{ i18n.ts.followRequest }}</span><i class="ti ti-plus"></i>
		</template>
		<template v-else-if="!userDetailed.isFollowing && !userDetailed.isLocked">
			<span v-if="full" :class="$style.text">{{ i18n.ts.follow }}</span><i class="ti ti-plus"></i>
		</template>
	</template>
	<template v-else>
		<span v-if="full" :class="$style.text">{{ i18n.ts.processing }}</span><MkLoading :em="true" :colored="false"/>
	</template>
</button>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import * as Misskey from 'misskey-js';
import { host } from '@@/js/config.js';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { useStream } from '@/stream.js';
import { i18n } from '@/i18n.js';
import { claimAchievement } from '@/utility/achievements.js';
import { pleaseLogin } from '@/utility/please-login.js';
import { $i } from '@/i.js';
import { userName } from "@/filters/user.js";
import { prefer } from '@/preferences.js';

const props = withDefaults(defineProps<{
	user: { id: string } & Partial<Misskey.entities.UserDetailed>,
	full?: boolean,
	large?: boolean,
}>(), {
	full: false,
	large: false,
});

const emit = defineEmits<
	(_: 'update:user', value: Misskey.entities.UserDetailed) => void
>();

const userDetailed = ref<{ id: string } & Partial<Misskey.entities.UserDetailed>>(props.user);
const wait = ref(props.user.isLocked === undefined);
const connection = useStream().useChannel('main');

if (userDetailed.value.isLocked === undefined && $i) {
	misskeyApi('users/show', {
		userId: props.user.id,
	})
		.then(onFollowChange)
		.then(() => {
			wait.value = false;
		});
}

function onFollowChange(user: Misskey.entities.UserDetailed) {
	if (user.id === props.user.id) {
		userDetailed.value = user;
	}
}

async function onClick() {
	pleaseLogin({ openOnRemote: { type: 'web', path: `/@${props.user.username}@${props.user.host ?? host}` } });

	wait.value = true;

	try {
		if (userDetailed.value.isFollowing) {
			const { canceled } = await os.confirm({
				type: 'warning',
				text: i18n.tsx.unfollowConfirm({ name: (userDetailed.value.name || userDetailed.value.username) ?? i18n.ts.user }),
			});

			if (canceled) {
				wait.value = false;
				return;
			}

			await misskeyApi('following/delete', {
				userId: props.user.id,
			}).catch((err) => {
				if (err.id === '19f25f61-0141-4683-99dc-217a88d633cb') {
					os.alert({
						type: 'error',
						title: i18n.ts.permissionDeniedError,
						text: i18n.ts._extraSettings.unfollowThisUserProhibited,
					});
				}
			});
		} else {
			if (prefer.s.alwaysConfirmFollow) {
				const { canceled } = await os.confirm({
					type: 'question',
					text: i18n.tsx.followConfirm({ name: props.user.name || props.user.username }),
				});

				if (canceled) {
					wait.value = false;
					return;
				}
			}

			if (userDetailed.value.hasPendingFollowRequestFromYou) {
				await misskeyApi('following/requests/cancel', {
					userId: props.user.id,
				});
				userDetailed.value.hasPendingFollowRequestFromYou = false;
			} else {
				await misskeyApi('following/create', {
					userId: props.user.id,
					withReplies: prefer.s.defaultFollowWithReplies,
				});
				emit('update:user', {
					...userDetailed.value,
					withReplies: prefer.s.defaultFollowWithReplies,
				});
				userDetailed.value.hasPendingFollowRequestFromYou = true;

				if ($i == null) {
					wait.value = false;
					return;
				}

				if ($i) {
					claimAchievement('following1');

					if ($i.followingCount >= 10) {
						claimAchievement('following10');
					}
					if ($i.followingCount >= 50) {
						claimAchievement('following50');
					}
					if ($i.followingCount >= 100) {
						claimAchievement('following100');
					}
					if ($i.followingCount >= 300) {
						claimAchievement('following300');
					}
				}
			}
		}
	} catch (err) {
		console.error(err);
	} finally {
		wait.value = false;
	}
}

onMounted(() => {
	connection.on('follow', onFollowChange);
	connection.on('unfollow', onFollowChange);
});

onBeforeUnmount(() => {
	connection.dispose();
});
</script>

<style lang="scss" module>
.root {
	position: relative;
	display: inline-block;
	font-weight: bold;
	color: var(--MI_THEME-fgOnWhite);
	border: solid 1px var(--MI_THEME-accent);
	padding: 0;
	height: 31px;
	font-size: 16px;
	border-radius: 32px;
	background: #fff;

	&.full {
		padding: 0 8px 0 12px;
		font-size: 14px;
	}

	&.large {
		font-size: 16px;
		height: 38px;
		padding: 0 12px 0 16px;
	}

	&:not(.full) {
		width: 31px;
	}

	&:focus-visible {
		&:after {
			content: "";
			pointer-events: none;
			position: absolute;
			top: -5px;
			right: -5px;
			bottom: -5px;
			left: -5px;
			border: 2px solid var(--focus);
			border-radius: 32px;
		}
	}

	&.active {
		color: var(--MI_THEME-fgOnAccent);
		background: var(--MI_THEME-accent);

		&:hover {
			background: hsl(from var(--MI_THEME-accent) h s calc(l + 10));
			border-color: hsl(from var(--MI_THEME-accent) h s calc(l + 10));
		}

		&:active {
			background: hsl(from var(--MI_THEME-accent) h s calc(l - 10));
			border-color: hsl(from var(--MI_THEME-accent) h s calc(l - 10));
		}
	}

	&.wait {
		cursor: wait !important;
		opacity: 0.7;
	}
}

.text {
	margin-right: 6px;
}
</style>
