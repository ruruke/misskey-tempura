/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { SoundStore } from '@/preferences/def.js';
import { prefer } from '@/preferences.js';
import { PREF_DEF } from '@/preferences/def.js';
import { getInitialPrefValue } from '@/preferences/manager.js';

let ctx: AudioContext;
const cache = new Map<string, AudioBuffer>();
let canPlay = true;

export const soundsTypes = [
	// 音声なし
	null,

	// ドライブの音声
	'_driveFile_',

	// プリインストール
	'syuilo/n-aec',
	'syuilo/n-aec-4va',
	'syuilo/n-aec-4vb',
	'syuilo/n-aec-8va',
	'syuilo/n-aec-8vb',
	'syuilo/n-cea',
	'syuilo/n-cea-4va',
	'syuilo/n-cea-4vb',
	'syuilo/n-cea-8va',
	'syuilo/n-cea-8vb',
	'syuilo/n-eca',
	'syuilo/n-eca-4va',
	'syuilo/n-eca-4vb',
	'syuilo/n-eca-8va',
	'syuilo/n-eca-8vb',
	'syuilo/n-ea',
	'syuilo/n-ea-4va',
	'syuilo/n-ea-4vb',
	'syuilo/n-ea-8va',
	'syuilo/n-ea-8vb',
	'syuilo/n-ea-harmony',
	'syuilo/up',
	'syuilo/down',
	'syuilo/pope1',
	'syuilo/pope2',
	'syuilo/waon',
	'syuilo/popo',
	'syuilo/triple',
	'syuilo/bubble1',
	'syuilo/bubble2',
	'syuilo/poi1',
	'syuilo/poi2',
	'syuilo/pirori',
	'syuilo/pirori-wet',
	'syuilo/pirori-square-wet',
	'syuilo/square-pico',
	'syuilo/reverved',
	'syuilo/ryukyu',
	'syuilo/kick',
	'syuilo/snare',
	'syuilo/queue-jammed',
	'aisha/1',
	'aisha/2',
	'aisha/3',
	'noizenecio/kick_gaba1',
	'noizenecio/kick_gaba2',
	'noizenecio/kick_gaba3',
	'noizenecio/kick_gaba4',
	'noizenecio/kick_gaba5',
	'noizenecio/kick_gaba6',
	'noizenecio/kick_gaba7',
] as const;

export const operationTypes = [
	'noteMy',
	'note',
	'notification',
	'reaction',
	'chatMessage',
] as const;

/** サウンドの種類 */
export type SoundType = typeof soundsTypes[number];

/** スプライトの種類 */
export type OperationType = typeof operationTypes[number];

/**
 * 音声を読み込む
 * @param url url
 * @param options `useCache`: デフォルトは`true` 一度再生した音声はキャッシュする
 */
export async function loadAudio(url: string, options?: { useCache?: boolean; }) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (ctx == null) {
		ctx = new AudioContext();

		window.addEventListener('beforeunload', () => {
			ctx.close();
		});
	}
	if (options?.useCache ?? true) {
		if (cache.has(url)) {
			return cache.get(url) as AudioBuffer;
		}
	}

	let response: Response;

	try {
		response = await window.fetch(url);
	} catch (err) {
		return;
	}

	const arrayBuffer = await response.arrayBuffer();
	const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

	if (options?.useCache ?? true) {
		cache.set(url, audioBuffer);
	}

	return audioBuffer;
}

/**
 * 既定のスプライトを再生する
 * @param type スプライトの種類を指定
 */
export function playMisskeySfx(operationType: OperationType) {
	const sound = prefer.s[`sound.on.${operationType}`];
	playMisskeySfxFile(sound).then((succeed) => {
		if (!succeed && sound.type === '_driveFile_') {
			// ドライブファイルが存在しない場合はデフォルトのサウンドを再生する
			const default_ = getInitialPrefValue(`sound.on.${operationType}`);
			const soundName = default_.type as Exclude<SoundType, '_driveFile_'>;
			if (_DEV_) console.log(`Failed to play sound: ${sound.fileUrl}, so play default sound: ${soundName}`);
			playMisskeySfxFileInternal({
				type: soundName,
				volume: sound.volume,
			});
		}
	});
}

/**
 * サウンド設定形式で指定された音声を再生する
 * @param soundStore サウンド設定
 */
export async function playMisskeySfxFile(soundStore: SoundStore): Promise<boolean> {
	// 連続して再生しない
	if (!canPlay) return false;
	// ユーザーアクティベーションが必要な場合はそれがない場合は再生しない
	if ('userActivation' in navigator && !navigator.userActivation.hasBeenActive) return false;
	// サウンドがない場合は再生しない
	if (soundStore.type === null || soundStore.type === '_driveFile_' && !soundStore.fileUrl) return false;

	canPlay = false;
	return await playMisskeySfxFileInternal(soundStore).finally(() => {
		// ごく短時間に音が重複しないように
		window.setTimeout(() => {
			canPlay = true;
		}, 25);
	});
}

async function playMisskeySfxFileInternal(soundStore: SoundStore): Promise<boolean> {
	if (soundStore.type === null || (soundStore.type === '_driveFile_' && !soundStore.fileUrl)) {
		return false;
	}
	const masterVolume = prefer.s['sound.masterVolume'];
	if (isMute() || masterVolume === 0 || soundStore.volume === 0) {
		return true; // ミュート時は成功として扱う
	}
	const url = soundStore.type === '_driveFile_' ? soundStore.fileUrl : `/client-assets/sounds/${soundStore.type}.mp3`;
	const buffer = await loadAudio(url).catch(() => {
		return undefined;
	});
	if (!buffer) return false;
	const volume = soundStore.volume * masterVolume;
	createSourceNode(buffer, { volume }).soundSource.start();
	return true;
}

export async function playUrl(url: string, opts: {
	volume?: number;
	pan?: number;
	playbackRate?: number;
}): Promise<boolean> {
	if (opts.volume === 0) {
		return true;
	}
	const buffer = await loadAudio(url);
	if (!buffer) return false;
	createSourceNode(buffer, opts).soundSource.start();
	return true;
}

export function createSourceNode(buffer: AudioBuffer, opts: {
	volume?: number;
	pan?: number;
	playbackRate?: number;
}): {
		soundSource: AudioBufferSourceNode;
		panNode: StereoPannerNode;
		gainNode: GainNode;
	} {
	const panNode = ctx.createStereoPanner();
	panNode.pan.value = opts.pan ?? 0;

	const gainNode = ctx.createGain();

	gainNode.gain.value = opts.volume ?? 1;

	const soundSource = ctx.createBufferSource();
	soundSource.buffer = buffer;
	soundSource.playbackRate.value = opts.playbackRate ?? 1;
	soundSource
		.connect(panNode)
		.connect(gainNode)
		.connect(ctx.destination);

	return { soundSource, panNode, gainNode };
}

/**
 * 音声の長さをミリ秒で取得する
 * @param file ファイルのURL（ドライブIDではない）
 */
export async function getSoundDuration(file: string): Promise<number> {
	const audioEl = window.document.createElement('audio');
	audioEl.src = file;
	return new Promise((resolve) => {
		const si = window.setInterval(() => {
			if (audioEl.readyState > 0) {
				resolve(audioEl.duration * 1000);
				window.clearInterval(si);
				audioEl.remove();
			}
		}, 100);
	});
}

/**
 * ミュートすべきかどうかを判断する
 */
export function isMute(): boolean {
	if (prefer.s['sound.notUseSound']) {
		// サウンドを出力しない
		return true;
	}

	// noinspection RedundantIfStatementJS
	if (prefer.s['sound.useSoundOnlyWhenActive'] && window.document.visibilityState === 'hidden') {
		// ブラウザがアクティブな時のみサウンドを出力する
		return true;
	}

	return false;
}

// 地震関連の音声ファイル
export const earthquakeSoundTypes = {
	// 緊急地震速報
	EEW1: '/client-assets/sounds/earthQuake/EEW1.wav', // 予報（震度4未満）
	EEW2: '/client-assets/sounds/earthQuake/EEW2.wav', // 警報（震度5弱以上）
	EEW_CANCELED: '/client-assets/sounds/earthQuake/EEW_canceled.wav', // 取り消し

	// 揺れ検知
	PGA1: '/client-assets/sounds/earthQuake/PGA1.wav', // 加速度レベル1
	PGA2: '/client-assets/sounds/earthQuake/PGA2.wav', // 加速度レベル2

	// 震度情報
	SHINDO0: '/client-assets/sounds/earthQuake/Shindo0.wav', // 震度レベル0（弱い反応）
	SHINDO1: '/client-assets/sounds/earthQuake/Shindo1.wav', // 震度1以上
	SHINDO2: '/client-assets/sounds/earthQuake/Shindo2.wav', // 震度4以上

	// 地震情報音声（震度別）
	INFO_1: '/client-assets/sounds/earthQuake/info/1.wav',
	INFO_2: '/client-assets/sounds/earthQuake/info/2.wav',
	INFO_3: '/client-assets/sounds/earthQuake/info/3.wav',
	INFO_4: '/client-assets/sounds/earthQuake/info/4.wav',
	INFO_5_MINUS: '/client-assets/sounds/earthQuake/info/5-.wav',
	INFO_5_PLUS: '/client-assets/sounds/earthQuake/info/5+.wav',
	INFO_6_MINUS: '/client-assets/sounds/earthQuake/info/6-.wav',
	INFO_6_PLUS: '/client-assets/sounds/earthQuake/info/6+.wav',
	INFO_7: '/client-assets/sounds/earthQuake/info/7.wav',
};

/**
 * 地震関連の音声を再生する
 * @param type 音声の種類
 * @param volume 音量（0-1）
 */
export async function playEarthquakeSound(type: keyof typeof earthquakeSoundTypes, volume = 1.0): Promise<boolean> {
	try {
		const masterVolume = prefer.s['sound.masterVolume'];
		if (isMute() || masterVolume === 0 || volume === 0) {
			return true; // ミュート時は成功として扱う
		}

		const url = earthquakeSoundTypes[type];
		const buffer = await loadAudio(url, { useCache: true }).catch((error) => {
			console.error(`Failed to load earthquake sound: ${type}`, error);
			return undefined;
		});

		if (!buffer) {
			console.warn(`Earthquake sound not available: ${type}, falling back to default`);
			// フォールバック用の音声がある場合はそれを再生
			if (type.startsWith('EEW') || type.startsWith('PGA') || type.startsWith('SHINDO')) {
				playUrl('/client-assets/sounds/earthquake-alert.mp3', { volume: volume * masterVolume });
				return true;
			}
			return false;
		}

		const finalVolume = volume * masterVolume;
		createSourceNode(buffer, { volume: finalVolume }).soundSource.start();
		return true;
	} catch (error) {
		console.error('Error playing earthquake sound:', error);
		return false;
	}
}
