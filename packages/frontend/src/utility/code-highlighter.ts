/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import darkPlus from 'shiki/themes/dark-plus.mjs';
import { bundledThemesInfo } from 'shiki/themes';
import { bundledLanguagesInfo } from 'shiki/langs';
import lightTheme from '@@/themes/_light.json5';
import darkTheme from '@@/themes/_dark.json5';
import defaultLightTheme from '@@/themes/pink-candy.json5';
import defaultDarkTheme from '@@/themes/night-pink.json5';
import { unique } from './array.js';
import { deepClone } from './clone.js';
import { deepMerge } from './merge.js';
import type { HighlighterCore, LanguageRegistration, ThemeRegistration, ThemeRegistrationRaw } from 'shiki/core';
import { prefer } from '@/preferences.js';

let _highlighter: HighlighterCore | null = null;

export async function getTheme(mode: 'light' | 'dark', getName: true): Promise<string>;
export async function getTheme(mode: 'light' | 'dark', getName?: false): Promise<ThemeRegistration | ThemeRegistrationRaw>;
export async function getTheme(mode: 'light' | 'dark', getName = false): Promise<ThemeRegistration | ThemeRegistrationRaw | string | null> {
	const theme = deepClone(mode === 'light' ? prefer.s.lightTheme ?? defaultLightTheme : prefer.s.darkTheme ?? defaultDarkTheme);

	if (theme.base) {
		const base = [lightTheme, darkTheme].find(x => x.id === theme.base);
		if (base && base.codeHighlighter) theme.codeHighlighter = Object.assign({}, base.codeHighlighter, theme.codeHighlighter);
	}

	if (theme.codeHighlighter) {
		let _res: ThemeRegistration = {};
		if (theme.codeHighlighter.base === '_none_') {
			_res = deepClone(theme.codeHighlighter.overrides);
		} else {
			const base = await bundledThemesInfo.find(t => t.id === theme.codeHighlighter!.base)?.import() ?? darkPlus;
			_res = deepMerge(theme.codeHighlighter.overrides ?? {}, 'default' in base ? base.default : base);
		}
		if (_res.name == null) {
			_res.name = theme.id;
		}
		_res.type = mode;

		if (getName) {
			return _res.name;
		}
		return _res;
	}

	if (getName) {
		return 'dark-plus';
	}
	return darkPlus;
}

export async function getHighlighter(): Promise<HighlighterCore> {
	if (!_highlighter) {
		return await initHighlighter();
	}
	return _highlighter;
}

async function initHighlighter() {
	// テーマの重複を消す
	const themes = unique([
		darkPlus,
		...(await Promise.all([getTheme('light'), getTheme('dark')])),
	]);

	const jsLangInfo = bundledLanguagesInfo.find(t => t.id === 'javascript');
	const highlighter = await createHighlighterCore({
		engine: createJavaScriptRegexEngine({ forgiving: true }),
		themes,
		langs: [
			...(jsLangInfo ? [async () => await jsLangInfo.import()] : []),
			async () => (await import('aiscript-vscode/aiscript/syntaxes/aiscript.tmLanguage.json')).default as unknown as LanguageRegistration,
		],
	});

	// TODO
	//watch('lightTheme', async () => {
	//	const newTheme = await getTheme('light');
	//	if (newTheme.name && !highlighter.getLoadedThemes().includes(newTheme.name)) {
	//		highlighter.loadTheme(newTheme);
	//	}
	//});
	//watch('darkTheme', async () => {
	//	const newTheme = await getTheme('dark');
	//	if (newTheme.name && !highlighter.getLoadedThemes().includes(newTheme.name)) {
	//		highlighter.loadTheme(newTheme);
	//	}
	//});

	_highlighter = highlighter;

	return highlighter;
}
