<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<component :is="prefer.s.enablePullToRefresh ? MkPullToRefresh : 'div'" :refresher="() => reload()">
	<div class="_spacer" :style="{ '--MI_SPACER-w': narrow ? '800px' : '1100px' }">
		<div ref="rootEl" class="ftskorzw" :class="{ wide: !narrow }" style="container-type: inline-size;">
			<div class="main _gaps">
				<!-- TODO -->
				<!-- <div class="punished" v-if="user.isSuspended"><i class="ti ti-alert-triangle" style="margin-right: 8px;"></i> {{ i18n.ts.userSuspended }}</div> -->
				<!-- <div class="punished" v-if="user.isSilenced"><i class="ti ti-alert-triangle" style="margin-right: 8px;"></i> {{ i18n.ts.userSilenced }}</div> -->

				<div class="profile _gaps">
					<MkAccountMoved v-if="user.movedTo" :movedTo="user.movedTo"/>
					<MkRemoteCaution v-if="user.host != null" :href="user.url ?? user.uri!"/>
					<MkInfo v-if="user.host == null && user.username.includes('.')">{{ i18n.ts.isSystemAccount }}</MkInfo>

					<div :key="user.id" class="main _panel">
						<div class="banner-container" :style="style">
							<div ref="bannerEl" class="banner" :style="style"></div>
							<div class="fade"></div>
							<div class="title">
								<div class="name">
									<MkUserName :user="user" :nowrap="true" @click="editNickname(props.user)"/>
								</div>
								<div class="bottom">
									<span class="username"><MkAcct :user="user" :detail="true"/></span>
									<span v-if="user.isLocked" :title="i18n.ts.isLocked"><i class="ti ti-lock"></i></span>
									<span v-if="user.isBot" :title="i18n.ts.isBot"><i class="ti ti-robot"></i></span>
									<button v-if="$i && !isEditingMemo && !memoDraft" class="_button add-note-button" @click="showMemoTextarea">
										<i class="ti ti-edit"/> {{ i18n.ts.addMemo }}
									</button>
								</div>
							</div>
							<span v-if="$i && $i.id != user.id && user.isFollowed" class="followed">{{ i18n.ts.followsYou }}</span>
							<template v-if="$i || !user.requireSigninToViewContents">
								<div class="actions">
									<button class="menu _button" @click="menu"><i class="ti ti-dots"></i></button>
									<MkFollowButton v-if="$i?.id != user.id" v-model:user="user" :inline="true" :transparent="false" :full="true" class="koudoku"/>
								</div>
							</template>
						</div>
						<MkAvatar class="avatar" :user="user" indicator/>
						<div class="title">
							<MkUserName :user="user" :nowrap="false" class="name" @click="editNickname(props.user)"/>
							<div class="bottom">
								<span class="username"><MkAcct :user="user" :detail="true"/></span>
								<span v-if="user.isLocked" :title="i18n.ts.isLocked"><i class="ti ti-lock"></i></span>
								<span v-if="user.isBot" :title="i18n.ts.isBot"><i class="ti ti-robot"></i></span>
							</div>
						</div>

						<template v-if="$i || !user.requireSigninToViewContents">
							<div v-if="user.followedMessage != null" class="followedMessage">
								<MkFukidashi class="fukidashi" :tail="narrow ? 'none' : 'left'" negativeMargin>
									<div class="messageHeader">{{ i18n.ts.messageToFollower }}</div>
									<div><MkSparkle><Mfm :plain="true" :text="user.followedMessage" :author="user" class="_selectable"/></MkSparkle></div>
								</MkFukidashi>
							</div>
							<MkFoldableSection v-if="user.roles.length > 0" class="role-folder" :expanded="user.roles.length < 5">
								<template #header>{{ i18n.ts.roles }}</template>
								<div class="roles">
									<span v-for="role in user.roles" :key="role.id" v-tooltip="role.description" class="role" :class="{ 'rainbow': role.isRainbow }" :style="role.isRainbow ? {} : { '--color': role.color }">
										<MkA v-adaptive-bg :to="`/roles/${role.id}`">
											<img v-if="role.iconUrl" style="height: 1.3em; vertical-align: -22%;" :src="role.iconUrl"/>
											{{ role.name }}
										</MkA>
									</span>
								</div>
							</MkFoldableSection>
							<MkFoldableSection v-if="user.communityRoles.length > 0" class="role-folder" :expanded="user.communityRoles.length < 5">
								<template #header>{{ i18n.ts.community + " " + i18n.ts.roles }}</template>
								<div class="roles">
									<span v-for="role in user.communityRoles" :key="role.id" v-tooltip="role.description" class="role" :class="{ 'rainbow': role.isRainbow }" :style="role.isRainbow ? {} : { '--color': role.color }">
										<MkA v-adaptive-bg :to="`/roles/${role.id}`">
											<img v-if="role.iconUrl" style="height: 1.3em; vertical-align: -22%;" :src="role.iconUrl"/>
											{{ role.name }}
										</MkA>
									</span>
								</div>
							</MkFoldableSection>
							<div v-if="iAmModerator" class="moderationNote">
								<MkTextarea v-if="editModerationNote || (moderationNote != null && moderationNote !== '')" v-model="moderationNote" manualSave>
									<template #label>{{ i18n.ts.moderationNote }}</template>
									<template #caption>{{ i18n.ts.moderationNoteDescription }}</template>
								</MkTextarea>
								<div v-else>
									<MkButton small @click="editModerationNote = true">{{ i18n.ts.addModerationNote }}</MkButton>
								</div>
							</div>
							<div v-if="isEditingMemo || memoDraft" class="memo" :class="{'no-memo': !memoDraft}">
								<div class="heading" v-text="i18n.ts.memo"/>
								<textarea
									ref="memoTextareaEl"
									v-model="memoDraft"
									v-autosize
									rows="1"
									@focus="isEditingMemo = true"
									@blur="updateMemo"
									@input="adjustMemoTextarea"
								/>
							</div>
							<div class="description">
								<MkOmit>
									<Mfm v-if="user.description" :text="user.description" :isNote="false" :author="user" class="_selectable"/>
									<p v-else class="empty">{{ i18n.ts.noAccountDescription }}</p>
									<div v-if="user.description && isForeignLanguage">
										<MkButton v-if="!(translating || translation)" class="translateButton" small @click="translate"><i class="ti ti-language-hiragana"></i> {{ i18n.ts.translateProfile }}</MkButton>
										<MkButton v-else class="translateButton" small @click="translation = null"><i class="ti ti-x"></i> {{ i18n.ts.close }}</MkButton>
									</div>
								</MkOmit>
							</div>
							<div class="fields system">
								<dl v-if="user.location" class="field">
									<dt class="name"><i class="ti ti-map-pin ti-fw"></i> {{ i18n.ts.location }}</dt>
									<dd class="value">{{ user.location }}</dd>
								</dl>
								<dl v-if="user.birthday" class="field">
									<dt class="name"><i class="ti ti-cake ti-fw"></i> {{ i18n.ts.birthday }}</dt>
									<dd class="value">{{ user.birthday.replace('-', '/').replace('-', '/') }} ({{ i18n.tsx.yearsOld({ age }) }})</dd>
								</dl>
								<dl class="field">
									<dt class="name"><i class="ti ti-calendar ti-fw"></i> {{ i18n.ts.registeredDate }}</dt>
									<dd class="value">{{ dateString(user.createdAt) }} (<MkTime :time="user.createdAt"/>)</dd>
								</dl>
							</div>
							<div v-if="user.fields.length > 0" class="fields">
								<dl v-for="(field, i) in user.fields" :key="i" class="field">
									<dt class="name">
										<Mfm :text="field.name" :author="user" :plain="true" :colored="false" class="_selectable"/>
									</dt>
									<dd class="value">
										<Mfm :text="field.value" :author="user" :colored="false" class="_selectable"/>
										<i v-if="user.verifiedLinks.includes(field.value)" v-tooltip:dialog="i18n.ts.verifiedLink" class="ti ti-circle-check" :class="$style.verifiedLink"></i>
									</dd>
								</dl>
							</div>
							<div class="status">
								<MkA :to="userPage(user)">
									<b>{{ number(user.notesCount) }}</b>
									<span>{{ i18n.ts.notes }}</span>
								</MkA>
								<MkA v-if="isFollowingVisibleForMe(user)" :to="userPage(user, 'following')">
									<b>{{ number(user.followingCount) }}</b>
									<span>{{ i18n.ts.following }}</span>
								</MkA>
								<MkA v-if="isFollowersVisibleForMe(user)" :to="userPage(user, 'followers')">
									<b>{{ number(user.followersCount) }}</b>
									<span>{{ i18n.ts.followers }}</span>
								</MkA>
							</div>
						</template>
						<div v-else>
							<MkResult type="empty" :text="i18n.ts.pleaseLoginToViewProfile">
								<MkButton primary rounded :class="$style.loginButton" @click="showLogin">
									<i class="ti ti-login-2"></i> {{ i18n.ts.login }}
								</MkButton>
							</MkResult>
						</div>
					</div>
				</div>

				<div class="contents _gaps">
					<div v-if="!user.requireSigninToViewContents || $i" class="contents _gaps">
						<div v-if="user.pinnedNotes.length > 0 && !user.isBlocked" class="_gaps">
							<MkNote v-for="note in user.pinnedNotes" :key="note.id" class="note _panel" :note="note" :pinned="true"/>
						</div>
						<MkInfo v-else-if="$i && $i.id === user.id">{{ i18n.ts.userPagePinTip }}</MkInfo>
						<div>
							<template v-if="narrow && !user.isBlocked">
								<MkLazy>
									<XFiles :key="user.id" :user="user" @showMore="emit('showMoreFiles')"/>
								</MkLazy>
							</template>
						</div>
						<div>
							<template v-if="narrow && !user.isBlocked">
								<MkLazy>
									<XActivity v-if="!user.hideActivity" :key="user.id" :user="user"/>
								</MkLazy>
							</template>
						</div>
						<template v-if="narrow && !user.isBlocked">
							<MkLazy v-if="user.ListenBrainz && listenbrainzdata">
								<XListenBrainz :key="user.id" :user="user" :collapsed="true"/>
							</MkLazy>
						</template>
						<div v-if="!disableNotes && !user.isBlocked && !user.hideNoteFromOverview">
							<MkLazy>
								<XTimeline :user="user"/>
							</MkLazy>
						</div>
						<div v-if="user.isBlocked" class="_fullinfo">
							<MkResult type="blocked" :text="i18n.ts.youBlocked"/>
							<div style="opacity: 0.7">{{ i18n.tsx.youBlockedDescription({ user: `@${ user.username }` }) }}</div>
						</div>
					</div>
				</div>
			</div>
			<template v-if="$i || !user.requireSigninToViewContents">
				<div v-if="!narrow && !user.isBlocked" class="sub _gaps" style="container-type: inline-size;">
					<XFiles :key="user.id" :user="user" @showMore="emit('showMoreFiles')"/>
					<XActivity v-if="!user.hideActivity" :key="user.id" :user="user"/>
					<XListenBrainz v-if="user.ListenBrainz && listenbrainzdata" :key="user.id" :user="user"/>
				</div>
			</template>
		</div>
	</div>
</component>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, computed, onMounted, onUnmounted, nextTick, watch, ref } from 'vue';
import * as Misskey from 'misskey-js';
import { getScrollPosition } from '@@/js/scroll.js';
import MkNote from '@/components/MkNote.vue';
import MkFollowButton from '@/components/MkFollowButton.vue';
import MkAccountMoved from '@/components/MkAccountMoved.vue';
import MkFukidashi from '@/components/MkFukidashi.vue';
import MkRemoteCaution from '@/components/MkRemoteCaution.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkOmit from '@/components/MkOmit.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkButton from '@/components/MkButton.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { getUserMenu } from '@/utility/get-user-menu.js';
import number from '@/filters/number.js';
import { userPage } from '@/filters/user.js';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { $i, iAmModerator } from '@/i.js';
import { dateString } from '@/filters/date.js';
import { confetti } from '@/utility/confetti.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { isFollowingVisibleForMe, isFollowersVisibleForMe } from '@/utility/isFfVisibleForMe.js';
import { useRouter } from '@/router.js';
import { getStaticImageUrl } from '@/utility/media-proxy.js';
import { editNickname } from '@/utility/edit-nickname';
import MkSparkle from '@/components/MkSparkle.vue';
import { prefer } from '@/preferences.js';
import MkPullToRefresh from '@/components/MkPullToRefresh.vue';
import { pleaseLogin } from '@/utility/please-login.js';

function calcAge(birthdate: string): number {
	const date = new Date(birthdate);
	const now = new Date();

	let yearDiff = now.getFullYear() - date.getFullYear();
	const monthDiff = now.getMonth() - date.getMonth();
	const pastDate = now.getDate() < date.getDate();

	if (monthDiff < 0 || (monthDiff === 0 && pastDate)) {
		yearDiff--;
	}

	return yearDiff;
}

const XFiles = defineAsyncComponent(() => import('./index.files.vue'));
const XActivity = defineAsyncComponent(() => import('./index.activity.vue'));
const XTimeline = defineAsyncComponent(() => import('./index.timeline.vue'));
const XListenBrainz = defineAsyncComponent(() => import('./index.listenbrainz.vue')); ;

const props = withDefaults(defineProps<{
	user: Misskey.entities.UserDetailed;
	/** Test only; MkNotesTimeline currently causes problems in vitest */
	disableNotes: boolean;
}>(), {
	disableNotes: false,
});

const emit = defineEmits<{
	(ev: 'showMoreFiles'): void;
}>();

const router = useRouter();

const user = ref(props.user);
const parallaxAnimationId = ref<null | number>(null);
const narrow = ref<null | boolean>(null);
const rootEl = ref<null | HTMLElement>(null);
const bannerEl = ref<null | HTMLElement>(null);
const memoTextareaEl = ref<null | HTMLElement>(null);
const memoDraft = ref(props.user.memo);
const isEditingMemo = ref(false);
const moderationNote = ref(props.user.moderationNote);
const editModerationNote = ref(false);

const listenbrainzdata = ref(false);
if (props.user.ListenBrainz) {
	(async function() {
		try {
			const response = await window.fetch(`https://api.listenbrainz.org/1/user/${props.user.ListenBrainz!}/playing-now`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			if (data.payload.listens && data.payload.listens.length !== 0) {
				listenbrainzdata.value = true;
			}
		} catch (err) {
			listenbrainzdata.value = false;
		}
	})();
}

watch(moderationNote, async () => {
	await misskeyApi('admin/update-user-note', { userId: props.user.id, text: moderationNote.value });
});

const style = computed(() => {
	if (props.user.bannerUrl == null) return {};
	if (prefer.s.disableShowingAnimatedImages) {
		return {
			backgroundImage: `url(${ getStaticImageUrl(props.user.bannerUrl) })`,
		};
	} else {
		return {
			backgroundImage: `url(${ props.user.bannerUrl })`,
		};
	};
});

const age = computed(() => {
	return calcAge(props.user.birthday);
});

function menu(ev: MouseEvent) {
	const { menu, cleanup } = getUserMenu(user.value, router);
	os.popupMenu(menu, ev.currentTarget ?? ev.target).finally(cleanup);
}

function parallaxLoop() {
	parallaxAnimationId.value = window.requestAnimationFrame(parallaxLoop);
	parallax();
}

function parallax() {
	const banner = bannerEl.value;
	if (banner == null) return;

	const top = getScrollPosition(rootEl.value);

	if (top < 0) return;

	const z = 1.75; // 奥行き(小さいほど奥)
	const pos = -(top / z);
	banner.style.backgroundPosition = `center calc(50% - ${pos}px)`;
}

function showMemoTextarea() {
	isEditingMemo.value = true;
	nextTick(() => {
		memoTextareaEl.value?.focus();
	});
}

function adjustMemoTextarea() {
	if (!memoTextareaEl.value) return;
	memoTextareaEl.value.style.height = '0px';
	memoTextareaEl.value.style.height = `${memoTextareaEl.value.scrollHeight}px`;
}

async function updateMemo() {
	await misskeyApi('users/update-memo', {
		memo: memoDraft.value,
		userId: props.user.id,
	});
	isEditingMemo.value = false;
}

watch([props.user], () => {
	memoDraft.value = props.user.memo;
});

async function reload() {
	// TODO
}

function showLogin() {
	pleaseLogin();
}

onMounted(() => {
	window.requestAnimationFrame(parallaxLoop);
	narrow.value = rootEl.value!.clientWidth < 1000;

	if (props.user.birthday) {
		const m = new Date().getMonth() + 1;
		const d = new Date().getDate();
		const bm = parseInt(props.user.birthday.split('-')[1]);
		const bd = parseInt(props.user.birthday.split('-')[2]);
		if (m === bm && d === bd) {
			confetti({
				duration: 1000 * 4,
			});
		}
	}
	nextTick(() => {
		adjustMemoTextarea();
	});
});

onUnmounted(() => {
	if (parallaxAnimationId.value) {
		window.cancelAnimationFrame(parallaxAnimationId.value);
	}
});
</script>

<style lang="scss" scoped>
.ftskorzw {

	> .main {

		> .punished {
			font-size: 0.8em;
			padding: 16px;
		}

		> .profile {

			> .main {
				position: relative;
				overflow: clip;

				> .banner-container {
					position: relative;
					height: 250px;
					overflow: clip;
					background-size: cover;
					background-position: center;

					> .banner {
						height: 100%;
						background-color: #4c5e6d;
						background-size: cover;
						background-position: center;
						box-shadow: 0 0 128px rgba(0, 0, 0, 0.5) inset;
						will-change: background-position;
					}

					> .fade {
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						height: 78px;
						background: linear-gradient(transparent, rgba(#000, 0.7));
					}

					> .followed {
						position: absolute;
						top: 12px;
						left: 12px;
						padding: 4px 8px;
						color: #fff;
						background: rgba(0, 0, 0, 0.7);
						font-size: 0.7em;
						border-radius: 6px;
					}

					> .actions {
						position: absolute;
						top: 12px;
						right: 12px;
						-webkit-backdrop-filter: var(--MI-blur, blur(8px));
						backdrop-filter: var(--MI-blur, blur(8px));
						background: rgba(0, 0, 0, 0.2);
						padding: 8px;
						border-radius: 24px;

						> .menu {
							vertical-align: bottom;
							height: 31px;
							width: 31px;
							color: #fff;
							text-shadow: 0 0 8px #000;
							font-size: 16px;
						}

						> .koudoku {
							margin-left: 4px;
							vertical-align: bottom;
						}
					}

					> .title {
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						padding: 0 0 8px 154px;
						box-sizing: border-box;
						color: #fff;

						> .name {
							display: flex;
							gap: 8px;
							margin: -10px;
							padding: 10px;
							line-height: 32px;
							font-weight: bold;
							font-size: 1.8em;
							filter: drop-shadow(0 0 4px #000);

							> .nickname-button {
								-webkit-backdrop-filter: var(--blur, blur(8px));
								backdrop-filter: var(--blur, blur(8px));
								background: rgba(0, 0, 0, 0.2);
								color: #ccc;
								font-size: 0.7em;
								line-height: 1;
								width: 1.8em;
								height: 1.8em;
								border-radius: 100%;
							}
						}

						> .bottom {
							> * {
								display: inline-block;
								margin-right: 16px;
								line-height: 20px;
								opacity: 0.8;

								&.username {
									font-weight: bold;
								}
							}

							> .add-note-button {
								background: rgba(0, 0, 0, 0.2);
								color: #fff;
								-webkit-backdrop-filter: var(--MI-blur, blur(8px));
								backdrop-filter: var(--MI-blur, blur(8px));
								border-radius: 24px;
								padding: 4px 8px;
								font-size: 80%;
							}
						}
					}
				}

				> .title {
					display: none;
					text-align: center;
					padding: 50px 8px 16px 8px;
					font-weight: bold;
					border-bottom: solid 0.5px var(--MI_THEME-divider);

					> .bottom {
						> * {
							display: inline-block;
							margin-right: 8px;
							opacity: 0.8;
						}
					}

					> .nickname-button {
						margin-left: 8px;
					}
				}

				> .avatar {
					display: block;
					position: absolute;
					top: 170px;
					left: 16px;
					z-index: 2;
					width: 120px;
					height: 120px;
					box-shadow: 1px 1px 3px rgba(#000, 0.2);
				}

				> .followedMessage {
					padding: 24px 24px 0 154px;

					> .fukidashi {
						display: block;
						--fukidashi-bg: color-mix(in srgb, var(--MI_THEME-accent), var(--MI_THEME-panel) 85%);
						--fukidashi-radius: 16px;
						font-size: 0.9em;

						.messageHeader {
							opacity: 0.7;
							font-size: 0.85em;
						}
					}
				}

				> .role-folder {
					padding: 12px 12px 0 154px;
					.roles {
						padding: 10px 0px 0 8px;
						font-size: 0.95em;
						display: flex;
						flex-wrap: wrap;
						gap: 8px;
						> .role {
							border: solid 1px var(--color, var(--divider));
							border-radius: 999px;
							margin-right: 4px;
							padding: 3px 8px;

							&.rainbow {
								position: relative;
								border: none;

								&::before {
									content: '';
									position: absolute;
									top: 0;
									left: 0;
									right: 0;
									bottom: 0;
									border-radius: 999px;
									background: linear-gradient(
										to right,
										#ff0000, /* Red */
										#ff7f00, /* Orange */
										#ffff00, /* Yellow */
										#00ff00, /* Green */
										#00ffff, /* Cyan */
										#0000ff, /* Blue */
										#8b00ff  /* Violet */
									);
									padding: 1px;
									-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
									-webkit-mask-composite: xor;
									mask-composite: exclude;
									animation: rainbowSpin 5s linear infinite;
									opacity: 0.7;
								}

								a {
									background-image: linear-gradient(
										to right,
										#ff0000, /* Red */
										#ff7f00, /* Orange */
										#ffff00, /* Yellow */
										#00ff00, /* Green */
										#00ffff, /* Cyan */
										#0000ff, /* Blue */
										#8b00ff  /* Violet */
									);
									background-size: 200% auto;
									color: transparent !important;
									-webkit-background-clip: text;
									background-clip: text;
									animation: rainbowTextSpin 5s linear infinite;
									opacity: 0.7;
								}
							}
						}
					}
				}

				@keyframes rainbowSpin {
					0% {
						background-position: 0% 50%;
					}
					100% {
						background-position: 100% 50%;
					}
				}

				@keyframes rainbowTextSpin {
					0% {
						background-position: 0% 50%;
					}
					100% {
						background-position: 200% 50%;
					}
				}

				> .moderationNote {
					margin: 12px 24px 0 154px;
				}

				> .memo {
					margin: 12px 24px 0 154px;
					background: transparent;
					color: var(--MI_THEME-fg);
					border: 1px solid var(--MI_THEME-divider);
					border-radius: 8px;
					padding: 8px;
					line-height: 0;

					> .heading {
						text-align: left;
						color: color(from var(--MI_THEME-fg) srgb r g b / 0.5);
						line-height: 1.5;
						font-size: 85%;
					}

					textarea {
						margin: 0;
						padding: 0;
						resize: none;
						border: none;
						outline: none;
						width: 100%;
						height: auto;
						min-height: 0;
						line-height: 1.5;
						color: var(--MI_THEME-fg);
						overflow: hidden;
						background: transparent;
						font-family: inherit;
					}
				}

				> .description {
					padding: 24px 24px 24px 154px;
					font-size: 0.95em;

					> .empty {
						margin: 0;
						opacity: 0.5;
					}
				}

				> .fields {
					padding: 24px;
					font-size: 0.9em;
					border-top: solid 0.5px var(--MI_THEME-divider);

					> .field {
						display: flex;
						padding: 0;
						margin: 0;
						align-items: center;

						&:not(:last-child) {
							margin-bottom: 8px;
						}

						> .name {
							width: 30%;
							overflow: hidden;
							white-space: nowrap;
							text-overflow: ellipsis;
							font-weight: bold;
							text-align: center;
						}

						> .value {
							width: 70%;
							overflow: hidden;
							white-space: nowrap;
							text-overflow: ellipsis;
							margin: 0;
						}
					}

					&.system > .field > .name {
					}
				}

				> .status {
					display: flex;
					padding: 24px;
					border-top: solid 0.5px var(--MI_THEME-divider);

					> a {
						flex: 1;
						text-align: center;

						&.active {
							color: var(--MI_THEME-accent);
						}

						&:hover {
							text-decoration: none;
						}

						> b {
							display: block;
							line-height: 16px;
						}

						> span {
							font-size: 70%;
						}
					}
				}
			}
		}

		> .contents {
			> .content {
				margin-bottom: var(--MI-margin);
			}
		}
	}

	&.wide {
		display: flex;
		width: 100%;

		> .main {
			width: 100%;
			min-width: 0;
		}

		> .sub {
			max-width: 350px;
			min-width: 350px;
			margin-left: var(--MI-margin);
		}
	}
}

@container (max-width: 500px) {
	.ftskorzw {
		> .main {
			> .profile > .main {
				> .banner-container {
					height: 140px;

					> .fade {
						display: none;
					}

					> .title {
						display: none;
					}
				}

				> .title {
					display: block;
				}

				> .avatar {
					top: 90px;
					left: 0;
					right: 0;
					width: 92px;
					height: 92px;
					margin: auto;
				}

				> .followedMessage {
					padding: 16px 16px 0 16px;
				}

				> .role-folder {
					padding: 8px 16px 0 16px;
					.roles {
						padding: 8px 8px 0 8px;
						justify-content: center;
					}
				}

				> .moderationNote {
					margin: 16px 16px 0 16px;
				}

				> .memo {
					margin: 16px 16px 0 16px;
				}

				> .description {
					padding: 16px;
					text-align: center;
				}

				> .fields {
					padding: 16px;
				}

				> .status {
					padding: 16px;
				}
			}

			> .contents {
				> .nav {
					font-size: 80%;
				}
			}
		}
	}
}
</style>

<style lang="scss" module>
.tl {
	background: var(--MI_THEME-bg);
	border-radius: var(--MI-radius);
	overflow: clip;
}

.verifiedLink {
	margin-left: 4px;
	color: var(--MI_THEME-success);
}

.loginButton {
	margin-left: auto;
	margin-right: auto;
	justify-content: center;
	align-items: center;
	display: flex;
}
</style>
