import {App, Editor, EditorSuggest, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {MathJaxAutoSettings, DEFAULT_SETTINGS, Suggestion} from 'lib/settings'
import {MathjaxSuggest} from "./lib/mathjax-suggest";

export default class MathjaxObsidianPlugin extends Plugin {
	settings: MathJaxAutoSettings;

	async onload() {
		await this.loadSettings();
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'simple-math-mode-command',
			name: 'Simple Math Mode',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.mathModeCommand(editor, true);
			}
		});
		this.addCommand({
			id: 'eq-math-mode-command',
			name: 'Equation Math Mode',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.mathModeCommand(editor, false);
			}
		});
		const suggester = new MathjaxSuggest(this.app, this.settings.suggestionList, (s: Suggestion) => {
			this.settings.suggestionList.push(s);
		});
		console.log('Loaded suggestion list', this.settings.suggestionList);
		this.registerEditorSuggest(suggester);
	}

	mathModeCommand (editor: Editor, simple: boolean) {
		const replacement = simple ? '$': '$$';
		const position = editor.getCursor();

		editor.replaceRange(replacement + replacement, position);

		// Move cursor to be in between dollar signs
		editor.setCursor(position.line, position.ch + replacement.length);
	}

	async onunload() {
		await this.saveSettings();
	}
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}
}


