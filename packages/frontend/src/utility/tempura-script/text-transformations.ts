/*
 * SPDX-FileCopyrightText: lqvp
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineAsyncComponent } from 'vue';
import { store } from '@/store.js';
import { prefer } from '@/preferences.js';
import * as os from '@/os.js';
import { generateGeminiSummary, extractCandidateText } from '@/utility/tempura-script/llm.js';
import { displayLlmError } from '@/utils/errorHandler.js';
import { i18n } from '@/i18n.js';

/**
 * 指定されたテキストに対して、Gemini API による変換を実行します。
 * ユーザーは変換スタイル（geminiNoteLongText, geminiNoteShortText, etc.）を選択し、
 * 変換結果に対して「決定」「再生成」「キャンセル」を選べ、決定時は onApplied コールバックが呼ばれます。
 *
 * @param noteText 変換対象のテキスト
 * @param onApplied 変換結果を適用する際のコールバック（例：PostFormのテキスト置換）
 */
export async function transformTextWithGemini(noteText: string, onApplied: (newText: string) => void): Promise<void> {
	// 利用可能な変換スタイルの一覧
	const styles = [
		{ key: 'geminiNoteLongText', label: '長文' },
		{ key: 'geminiNoteShortText', label: '短文' },
		{ key: 'geminiNoteSimpleText', label: 'シンプル' },
		{ key: 'geminiNoteCasualText', label: 'カジュアル' },
		{ key: 'geminiNoteProfessionalText', label: 'プロフェッショナル' },
		{ key: 'geminiNoteCatText', label: '猫っぽく' },
		{ key: 'geminiNoteCustomText', label: 'カスタム' },
	];

	// 変換スタイルの選択（os.select を使用）
	const styleSelection = await os.select({
		title: '変換スタイルを選択してください',
		items: styles.map(style => ({ text: style.label, value: style.key })),
	});
	if (styleSelection.canceled) return;
	const selectedStyleKey = styleSelection.result!;

	// 繰り返し処理で「再生成」が選択された場合も対応
	while (true) {
		// store内の該当プロンプト（geminiNote*）を利用してプロンプト生成
		const state = (prefer.s as unknown) as Record<string, string> | null;
		const stylePrompt = state?.[selectedStyleKey] ?? '';

		let result: any;
		try {
			const data = await generateGeminiSummary({
				userContent: noteText,
				systemInstruction: stylePrompt,
			});
			result = data;
		} catch (error: any) {
			// 変更: エラー表示にlocaleの値を参照
			displayLlmError(error, i18n.ts._llm._error.transformExecute);
		}

		let transformedText: string;
		try {
			transformedText = extractCandidateText(result);
		} catch (error: any) {
			displayLlmError(error, i18n.ts._llm._error.transformResult);
		}

		// 結果の確認ダイアログを表示（MkDialog.vue を利用）
		const dialogResult: string = await new Promise((resolve) => {
			os.popup(defineAsyncComponent(() => import('@/components/MkDialog.vue')), {
				title: '変換結果',
				text: transformedText,
				actions: [
					{ text: '決定', primary: true, callback: () => resolve('confirm') },
					{ text: '再生成', callback: () => resolve('regenerate') },
					{ text: 'キャンセル', danger: true, callback: () => resolve('cancel') },
				],
			});
		});

		if (dialogResult === 'confirm') {
			// 決定時：変換結果をコールバック経由で適用
			onApplied(transformedText);
			break;
		} else if (dialogResult === 'cancel') {
			// キャンセル時：何もせず終了
			break;
		}
		// 'regenerate'の場合はループで再生成
	}
}
