import {App, Editor, EditorSuggest, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import { MathJaxAutoSettings, DEFAULT_SETTINGS } from 'lib/settings'
import {MathJaxAutoState, MathJaxAutoStateInterface} from 'lib/state'
import {MathjaxSuggest} from "./lib/mathjax-suggest";

export default class MyPlugin extends Plugin {
	settings: MathJaxAutoSettings;
	state: MathJaxAutoStateInterface;

	async onload() {
		await this.loadSettings();
		await this.loadState();

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
		const suggestions = new MathjaxSuggest(this.app);
		this.registerEditorSuggest(suggestions);
	}

	mathModeCommand (editor: Editor, simple: boolean) {
		// if (!this.state.enterMathMode()) {
		// 	// Already in math mode
		// 	return;
		// }
		const replacement = simple ? '$': '$$';
		const position = editor.getCursor();

		editor.replaceRange(replacement + replacement, position);

		// Move cursor to be in between dollar signs
		editor.setCursor(position.line, position.ch + replacement.length);
	}

	onunload() {

	}

	async loadState() {
		const statusBarItemEl = this.addStatusBarItem();
		this.state = new MathJaxAutoState (statusBarItemEl);
	}
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	//
	// async saveSettings() {
	// 	await this.saveData(this.settings);
	// }
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
