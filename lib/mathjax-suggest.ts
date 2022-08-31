import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo, Modal, Setting,
	TFile
} from "obsidian";
import {Suggestion} from "./settings";

const compareSuggestions = (a: Suggestion, b: Suggestion): number => {
	return (a.rank || 0) - (b.rank || 0);
}
const querySuggestionFilter = (query: string) => {
	return (s: Suggestion) => {
		return s.name.startsWith(query);
	}
}
const mapSuggestionToName = (s: Suggestion): string => s.name;

function setValue(context: EditorSuggestContext, s: Suggestion) {
	const to = context.editor.getCursor();
	const from: EditorPosition = {line: to.line, ch: to.ch - context.query.length};
	console.log('Inserting...', context.query);
	context.editor.replaceRange(s.latex, from, to);
}

class NewSuggestionModal extends Modal {
	private _name: string;
	private _latex: string;
	onSubmit: (name: string, latex: string) => void;

	constructor(app: App, command: string, callback: (name: string, latex: string) => void) {
		super(app);
		this._name = command;
		this._latex = "";
		this.onSubmit = callback;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText("Configure Latex Command/Macro:");

		const commandName = new Setting(contentEl)
			.setName("Command Name (Macro name):")
			.addText((text) => text.onChange((value) => {this._name = value}));
		commandName.settingEl.setText("place");

		const commandLatex = new Setting(contentEl)
			.setName("Latex command:")
			.addText((text) => text.onChange((value) => {this._latex = value}));
		commandName.settingEl.setText("place");

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Submit")
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(this._name, this._latex);
					}));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class MathjaxSuggest extends EditorSuggest<Suggestion> {
	private _unchangedSuggestionList: Suggestion[];
	private _last_query?: string = undefined;
	private _filteredSuggestionList: Suggestion[] = [];
	onAddSuggestion: (s: Suggestion) => void;
	limit = 5;

	constructor(app: App, suggestionList: Suggestion[], onAddSuggestion: (s: Suggestion) => void) {
		super(app);
		this._unchangedSuggestionList = suggestionList.sort(compareSuggestions);
		this._filteredSuggestionList = this._unchangedSuggestionList;
		this.onAddSuggestion = onAddSuggestion;
	}

    renderSuggestion(value: Suggestion, el: HTMLElement): void {
		el.setText(value.name);
    }

    selectSuggestion(value: Suggestion, evt: MouseEvent | KeyboardEvent): void {
		if (value.isNew)
		{
			const modal = new NewSuggestionModal(app ,this._last_query, (name: string, latex: string) => {
				const s: Suggestion = {name: name, latex: latex};
				this._unchangedSuggestionList.push(s);
				this.onAddSuggestion(s);
				this.selectSuggestion(s, evt);
			});
			modal.open();
		}
		else if (this.context?.editor) {
			setValue(this.context, value);
		}
    }

	getSuggestions(context: EditorSuggestContext): Suggestion[] | Promise<Suggestion[]> {
		if (!this._last_query || !context.query.startsWith(this._last_query)) {
			// The last query is not the prefix of the current query, so we re-filter all suggestions.
			this._filteredSuggestionList = this._unchangedSuggestionList;
		}
		this._filteredSuggestionList = this._filteredSuggestionList.filter((suggestion :Suggestion) =>{
			console.log(suggestion.name.startsWith(context.query));return suggestion.name.startsWith(context.query)});
		this._last_query = context.query;
		return this._filteredSuggestionList.length > 0 ? this._filteredSuggestionList :
			[{name: `add ${context.query}`, latex: "", isNew: true}];
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		const prefix = editor.getLine(cursor.line).substring(0, cursor.ch);
		const start = prefix.lastIndexOf('\\');
		if (start == -1) {
			return null;
		}
		const ofInterest = prefix.substring(start + 1);
		if (ofInterest.search(/[^a-zA-Z]/) >= 0) {
			return null;
		}
		const result: EditorSuggestTriggerInfo = {
			start: {line: cursor.line, ch: start + 1},
			end: cursor,
			query: ofInterest
		}
		return result;
	}
}

export {MathjaxSuggest}
