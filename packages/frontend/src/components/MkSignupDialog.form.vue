<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<div :class="$style.banner">
		<i class="ti ti-user-edit"></i>
	</div>
	<div class="_spacer" style="--MI_SPACER-min: 20px; --MI_SPACER-max: 32px;">
		<form class="_gaps_m" autocomplete="new-password" @submit.prevent="onSubmit">
			<MkInput v-if="showInvitationCodeInput" v-model="invitationCode" type="text" :spellcheck="false" :required="instance.disableRegistration" data-cy-signup-invitation-code>
				<template #label>{{ i18n.ts.invitationCode }}{{ !instance.disableRegistration && ` (${i18n.ts.optional})` }}<div v-tooltip:dialog="i18n.ts._signup.inviteCodeInfo" class="_button _help"><i class="ti ti-help-circle"></i></div></template>
				<template #prefix><i class="ti ti-key"></i></template>
			</MkInput>
			<MkInput v-model="username" type="text" pattern="^[a-zA-Z0-9_]{1,20}$" :spellcheck="false" autocomplete="username" required data-cy-signup-username @update:modelValue="onChangeUsername">
				<template #label>{{ i18n.ts.username }} <div v-tooltip:dialog="i18n.ts.usernameInfo" class="_button _help"><i class="ti ti-help-circle"></i></div></template>
				<template #prefix>@</template>
				<template #suffix>@{{ host }}</template>
				<template #caption>
					<div><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts.cannotBeChangedLater }}</div>
					<span v-if="usernameState === 'wait'" style="color:#999"><MkLoading :em="true"/> {{ i18n.ts.checking }}</span>
					<span v-else-if="usernameState === 'ok'" style="color: var(--MI_THEME-success)"><i class="ti ti-check ti-fw"></i> {{ i18n.ts.available }}</span>
					<span v-else-if="usernameState === 'unavailable'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts.unavailable }}</span>
					<span v-else-if="usernameState === 'error'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts.error }}</span>
					<span v-else-if="usernameState === 'invalid-format'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts.usernameInvalidFormat }}</span>
					<span v-else-if="usernameState === 'min-range'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts.tooShort }}</span>
					<span v-else-if="usernameState === 'max-range'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts.tooLong }}</span>
				</template>
			</MkInput>
			<MkInput v-show="instance.emailRequiredForSignup && !props.skipEmailAuth" v-model="email" :debounce="true" type="email" :spellcheck="false" data-cy-signup-email @update:modelValue="onChangeEmail">
				<template #label>{{ i18n.ts.emailAddress }} <div v-tooltip:dialog="i18n.ts._signup.emailAddressInfo" class="_button _help"><i class="ti ti-help-circle"></i></div></template>
				<template #prefix><i class="ti ti-mail"></i></template>
				<template #caption>
					<span v-if="emailState === 'wait'" style="color:#999"><MkLoading :em="true"/> {{ i18n.ts.checking }}</span>
					<span v-else-if="emailState === 'ok'" style="color: var(--MI_THEME-success)"><i class="ti ti-check ti-fw"></i> {{ i18n.ts.available }}</span>
					<span v-else-if="emailState === 'unavailable:used'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts._emailUnavailable.used }}</span>
					<span v-else-if="emailState === 'unavailable:format'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts._emailUnavailable.format }}</span>
					<span v-else-if="emailState === 'unavailable:disposable'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts._emailUnavailable.disposable }}</span>
					<span v-else-if="emailState === 'unavailable:banned'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts._emailUnavailable.banned }}</span>
					<span v-else-if="emailState === 'unavailable:mx'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts._emailUnavailable.mx }}</span>
					<span v-else-if="emailState === 'unavailable:smtp'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts._emailUnavailable.smtp }}</span>
					<span v-else-if="emailState === 'unavailable'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts.unavailable }}</span>
					<span v-else-if="emailState === 'error'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts.error }}</span>
				</template>
			</MkInput>
			<MkInput v-model="password" type="password" autocomplete="new-password" required data-cy-signup-password @update:modelValue="onChangePassword">
				<template #label>{{ i18n.ts.password }}</template>
				<template #prefix><i class="ti ti-lock"></i></template>
				<template #caption>
					<span v-if="passwordStrength == 'low'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts.weakPassword }}</span>
					<span v-if="passwordStrength == 'medium'" style="color: var(--MI_THEME-warn)"><i class="ti ti-check ti-fw"></i> {{ i18n.ts.normalPassword }}</span>
					<span v-if="passwordStrength == 'high'" style="color: var(--MI_THEME-success)"><i class="ti ti-check ti-fw"></i> {{ i18n.ts.strongPassword }}</span>
				</template>
			</MkInput>
			<MkInput v-model="retypedPassword" type="password" autocomplete="new-password" required data-cy-signup-password-retype @update:modelValue="onChangePasswordRetype">
				<template #label>{{ i18n.ts.password }} ({{ i18n.ts.retype }})</template>
				<template #prefix><i class="ti ti-lock"></i></template>
				<template #caption>
					<span v-if="passwordRetypeState == 'match'" style="color: var(--MI_THEME-success)"><i class="ti ti-check ti-fw"></i> {{ i18n.ts.passwordMatched }}</span>
					<span v-if="passwordRetypeState == 'not-match'" style="color: var(--MI_THEME-error)"><i class="ti ti-alert-triangle ti-fw"></i> {{ i18n.ts.passwordNotMatched }}</span>
				</template>
			</MkInput>
			<MkTextarea v-if="instance.approvalRequiredForSignup && !props.skipApproval" v-model="reason" :required="instance.approvalRequiredForSignup && !props.skipApproval" :placeholder="i18n.ts._signup.reasonInfo" :spellcheck="false" data-cy-signup-reason>
				<template #label>{{ i18n.ts.registerReason }} <div v-tooltip:dialog="i18n.ts._signup.reasonInfo" class="_button _help"><i class="ti ti-help-circle"></i></div></template>
				<template #prefix><i class="ti ti-chalkboard"></i></template>
			</MkTextarea>
			<MkCaptcha v-if="instance.enableHcaptcha" ref="hcaptcha" v-model="hCaptchaResponse" :class="$style.captcha" provider="hcaptcha" :sitekey="instance.hcaptchaSiteKey"/>
			<MkCaptcha v-if="instance.enableMcaptcha" ref="mcaptcha" v-model="mCaptchaResponse" :class="$style.captcha" provider="mcaptcha" :sitekey="instance.mcaptchaSiteKey" :instanceUrl="instance.mcaptchaInstanceUrl"/>
			<MkCaptcha v-if="instance.enableRecaptcha" ref="recaptcha" v-model="reCaptchaResponse" :class="$style.captcha" provider="recaptcha" :sitekey="instance.recaptchaSiteKey"/>
			<MkCaptcha v-if="instance.enableTurnstile" ref="turnstile" v-model="turnstileResponse" :class="$style.captcha" provider="turnstile" :sitekey="instance.turnstileSiteKey"/>
			<MkCaptcha v-if="instance.enableTestcaptcha" ref="testcaptcha" v-model="testcaptchaResponse" :class="$style.captcha" provider="testcaptcha"/>
			<MkButton type="submit" :disabled="shouldDisableSubmitting" large gradate rounded data-cy-signup-submit style="margin: 0 auto;">
				<template v-if="submitting">
					<MkLoading :em="true" :colored="false"/>
				</template>
				<template v-else>{{ i18n.ts.start }}</template>
			</MkButton>
		</form>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { toUnicode } from 'punycode.js';
import * as Misskey from 'misskey-js';
import * as config from '@@/js/config.js';
import MkButton from './MkButton.vue';
import MkInput from './MkInput.vue';
import MkTextarea from './MkTextarea.vue';
import type { Captcha } from '@/components/MkCaptcha.vue';
import MkCaptcha from '@/components/MkCaptcha.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { instance } from '@/instance.js';
import { i18n } from '@/i18n.js';
import { login } from '@/accounts.js';

const props = withDefaults(defineProps<{
	autoSet?: boolean;
	skipEmailAuth?: boolean;
	skipApproval?: boolean;
	invitationCode?: string | null;
}>(), {
	autoSet: false,
	skipEmailAuth: false,
	skipApproval: false,
	invitationCode: null,
});

const emit = defineEmits<{
	(ev: 'signup', user: Misskey.entities.SignupResponse): void;
	(ev: 'signupEmailPending'): void;
	(ev: 'approvalPending'): void;
	(ev: 'approvalAndEmailPending'): void;
}>();

const host = toUnicode(config.host);

const hcaptcha = ref<Captcha | undefined>();
const mcaptcha = ref<Captcha | undefined>();
const recaptcha = ref<Captcha | undefined>();
const turnstile = ref<Captcha | undefined>();
const testcaptcha = ref<Captcha | undefined>();

const username = ref<string>('');
const password = ref<string>('');
const retypedPassword = ref<string>('');
const invitationCode = ref<string>(props.invitationCode ?? '');
const reason = ref<string>('');
const email = ref('');

const showInvitationCodeInput = computed(() =>
	instance.disableRegistration ||
	instance.enableSignupRateLimit ||
	instance.approvalRequiredForSignup ||
	instance.emailRequiredForSignup,
);
const usernameState = ref<null | 'wait' | 'ok' | 'unavailable' | 'error' | 'invalid-format' | 'min-range' | 'max-range'>(null);
const emailState = ref<null | 'wait' | 'ok' | 'unavailable:used' | 'unavailable:format' | 'unavailable:disposable' | 'unavailable:banned' | 'unavailable:mx' | 'unavailable:smtp' | 'unavailable' | 'error'>(null);
const passwordStrength = ref<'' | 'low' | 'medium' | 'high'>('');
const passwordRetypeState = ref<null | 'match' | 'not-match'>(null);
const submitting = ref<boolean>(false);
const hCaptchaResponse = ref<string | null>(null);
const mCaptchaResponse = ref<string | null>(null);
const reCaptchaResponse = ref<string | null>(null);
const turnstileResponse = ref<string | null>(null);
const testcaptchaResponse = ref<string | null>(null);
const usernameAbortController = ref<null | AbortController>(null);
const emailAbortController = ref<null | AbortController>(null);

const canSubmitForm = computed(() => {
	if (usernameState.value !== 'ok') return false;
	if (instance.emailRequiredForSignup && !props.skipEmailAuth && emailState.value !== 'ok') return false;
	if (passwordStrength.value === 'low' || passwordStrength.value === '') return false;
	if (passwordRetypeState.value !== 'match') return false;
	if (instance.enableHcaptcha && hCaptchaResponse.value === '') return false;
	if (instance.enableMcaptcha && mCaptchaResponse.value === '') return false;
	if (instance.enableRecaptcha && reCaptchaResponse.value === '') return false;
	if (instance.enableTurnstile && turnstileResponse.value === '') return false;
	if (instance.enableTestcaptcha && testcaptchaResponse.value === '') return false;
	return true;
});

const shouldDisableSubmitting = computed((): boolean => {
	const actualApprovalReasonRequired = instance.approvalRequiredForSignup && !props.skipApproval;
	const reasonIsInvalid = actualApprovalReasonRequired && (reason.value.length < 1 || reason.value.length > 1000);

	return submitting.value ||
		!canSubmitForm.value ||
		reasonIsInvalid;
});

function getPasswordStrength(source: string): number {
	let strength = 0;
	let power = 0.018;

	// 英数字
	if (/[a-zA-Z]/.test(source) && /[0-9]/.test(source)) {
		power += 0.020;
	}

	// 大文字と小文字が混ざってたら
	if (/[a-z]/.test(source) && /[A-Z]/.test(source)) {
		power += 0.015;
	}

	// 記号が混ざってたら
	if (/[!\x22\#$%&@'()*+,-./_]/.test(source)) {
		power += 0.02;
	}

	strength = power * source.length;

	return Math.max(0, Math.min(1, strength));
}

function onChangeUsername(): void {
	if (username.value === '') {
		usernameState.value = null;
		return;
	}

	{
		const err =
			!username.value.match(/^[a-zA-Z0-9_]+$/) ? 'invalid-format' :
			username.value.length < 1 ? 'min-range' :
			username.value.length > 20 ? 'max-range' :
			null;

		if (err) {
			usernameState.value = err;
			return;
		}
	}

	if (usernameAbortController.value != null) {
		usernameAbortController.value.abort();
	}
	usernameState.value = 'wait';
	usernameAbortController.value = new AbortController();

	misskeyApi('username/available', {
		username: username.value,
	}, undefined, usernameAbortController.value.signal).then(result => {
		usernameState.value = result.available ? 'ok' : 'unavailable';
	}).catch((err) => {
		if (err.name !== 'AbortError') {
			usernameState.value = 'error';
		}
	});
}

function onChangeEmail(): void {
	if (email.value === '') {
		emailState.value = null;
		return;
	}

	if (emailAbortController.value != null) {
		emailAbortController.value.abort();
	}
	emailState.value = 'wait';
	emailAbortController.value = new AbortController();

	misskeyApi('email-address/available', {
		emailAddress: email.value,
	}, undefined, emailAbortController.value.signal).then(result => {
		emailState.value = result.available ? 'ok' :
			result.reason === 'used' ? 'unavailable:used' :
			result.reason === 'format' ? 'unavailable:format' :
			result.reason === 'disposable' ? 'unavailable:disposable' :
			result.reason === 'banned' ? 'unavailable:banned' :
			result.reason === 'mx' ? 'unavailable:mx' :
			result.reason === 'smtp' ? 'unavailable:smtp' :
			'unavailable';
	}).catch((err) => {
		if (err.name !== 'AbortError') {
			emailState.value = 'error';
		}
	});
}

function onChangePassword(): void {
	if (password.value === '') {
		passwordStrength.value = '';
		return;
	}

	const strength = getPasswordStrength(password.value);
	passwordStrength.value = strength > 0.7 ? 'high' : strength > 0.3 ? 'medium' : 'low';
}

function onChangePasswordRetype(): void {
	if (retypedPassword.value === '') {
		passwordRetypeState.value = null;
		return;
	}

	passwordRetypeState.value = password.value === retypedPassword.value ? 'match' : 'not-match';
}

async function onSubmit(): Promise<void> {
	function removeInviteCodeFromUrl() {
		const url = new URL(window.location.href);
		if (url.searchParams.has('invite-code')) {
			url.searchParams.delete('invite-code');
			window.history.replaceState({}, '', url.toString());
		}
	}

	if (submitting.value) return;
	submitting.value = true;

	const signupPayload: Misskey.entities.SignupRequest = {
		username: username.value,
		password: password.value,
		emailAddress: (instance.emailRequiredForSignup && !props.skipEmailAuth) ? email.value : undefined,
		invitationCode: invitationCode.value,
		reason: reason.value,
		'hcaptcha-response': hCaptchaResponse.value,
		'm-captcha-response': mCaptchaResponse.value,
		'g-recaptcha-response': reCaptchaResponse.value,
		'turnstile-response': turnstileResponse.value,
		'testcaptcha-response': testcaptchaResponse.value,
	};

	const res = await window.fetch(`${config.apiUrl}/signup`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(signupPayload),
	}).catch(() => {
		onSignupApiError(null, null);
		return null;
	});

	if (res && res.ok) {
		removeInviteCodeFromUrl();

		if (instance.emailRequiredForSignup && !props.skipEmailAuth && instance.approvalRequiredForSignup && !props.skipApproval) {
			os.alert({
				type: 'success',
				title: i18n.ts._signup.almostThere,
				text: i18n.tsx._signup.approvalAndEmailPending({ email: email.value }),
			});
			emit('approvalAndEmailPending');
		} else if (instance.emailRequiredForSignup && !props.skipEmailAuth && ( (instance.approvalRequiredForSignup && props.skipApproval) || !instance.approvalRequiredForSignup ) && res.status === 204) {
			await os.alert({
				type: 'success',
				title: i18n.ts._signup.almostThere,
				text: i18n.tsx._signup.emailSent({ email: email.value }),
			});
			emit('signupEmailPending');
		} else if (instance.approvalRequiredForSignup && !props.skipApproval && ( (instance.emailRequiredForSignup && props.skipEmailAuth) || !instance.emailRequiredForSignup )) {
			os.alert({
				type: 'success',
				title: i18n.ts._signup.almostThere,
				text: i18n.ts._signup.approvalPending,
			});
			emit('approvalPending');
		} else {
			const resJson = (await res.json()) as Misskey.entities.SignupResponse;
			if (_DEV_) console.log(resJson);

			emit('signup', resJson);

			if (props.autoSet) {
				await login(resJson.token);
			}
		}
	} else if (res) {
		const errorBody = await res.json().catch(() => ({}));
		onSignupApiError(res, errorBody);
	} else {
		onSignupApiError(null, null);
	}

	submitting.value = false;
}

function onSignupApiError(res: Response | null, errorBody: any) {
	submitting.value = false;
	hcaptcha.value?.reset?.();
	mcaptcha.value?.reset?.();
	recaptcha.value?.reset?.();
	turnstile.value?.reset?.();
	testcaptcha.value?.reset?.();

	if (res?.status === 429 || errorBody?.error?.message === 'Too Many Requests') {
		os.alert({
			type: 'error',
			title: i18n.ts.signupRateLimited,
			text: i18n.ts.signupRateLimitedDescription,
		});
	} else {
		os.alert({
			type: 'error',
			text: i18n.ts.somethingHappened,
		});
	}
}
</script>

<style lang="scss" module>
.banner {
	padding: 16px;
	text-align: center;
	font-size: 26px;
	background-color: var(--MI_THEME-accentedBg);
	color: var(--MI_THEME-accent);
}

.captcha {
	margin: 16px 0;
}
</style>
