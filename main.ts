import {App, Editor, EditorSuggest, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {MathJaxAutoSettings, DEFAULT_SETTINGS, Suggestion} from 'lib/settings'
import {MathjaxSuggest} from "./lib/mathjax-suggest";

export default class MathjaxObsidianPlugin extends Plugin {
	settings: MathJaxAutoSettings;
	statusBarElem: HTMLElement;
	isInMathMode: boolean = false;

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
		this.statusBarElem = this.addStatusBarItem();
    	this.statusBarElem.createEl("span", { text: "Math Mode: [off]" });
		const suggester = new MathjaxSuggest(this.app, this.settings.suggestionList, this.statusBarElem, (s: Suggestion) => {
			this.settings.suggestionList.push(s);
		});
		console.log('Loaded suggestion list', this.settings.suggestionList);
		this.registerEditorSuggest(suggester);

	}

	handleEscape (editor: Editor) {
		console.log('escape');
		this.isInMathMode = false;
		this.statusBarElem.toggleClass('math-mode-on', false);
		this.statusBarElem.setText("Math Mode: [off]");
		const moveTo = editor.getLine(editor.getCursor().line).lastIndexOf('$') + 1;
		editor.setCursor(editor.getCursor().line, moveTo);
	}

	mathModeCommand (editor: Editor, simple: boolean) {
		if (this.isInMathMode) {
			console.log('already in math mode...');
			this.handleEscape(editor);
			return;
		}
		const replacement = simple ? '$': '$$';
		const position = editor.getCursor();

		editor.replaceRange(replacement + replacement, position);

		// Move cursor to be in between dollar signs
		editor.setCursor(position.line, position.ch + replacement.length);
		this.isInMathMode = true;
		this.statusBarElem.setText("Math Mode: [on]");
		this.statusBarElem.toggleClass('math-mode-on', true);
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


