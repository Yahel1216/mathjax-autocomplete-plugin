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

const suggestLimit = 5;

const compareSuggestions = (a: Suggestion, b: Suggestion): number => {
	return (a.rank || 0) - (b.rank || 0);
}

const sortSuggestions = (a,b): number => {
	if (a.rank && b.rank){
		const rankDiff = -(a.rank - b.rank);
		if (rankDiff) {
			return rankDiff;
		}
	}
	else if (a.rank && !b.rank)
		return -1;
	else if (b.rank && !a.rank)
		return -1
	return a.name.localeCompare(b.name);
}

const querySuggestionFilter = (query: string) => {
	return (s: Suggestion) => {
		return s.name.startsWith(query);
	}
}
const mapSuggestionToName = (s: Suggestion): string => s.name;

function setValue(context: EditorSuggestContext, s: Suggestion) {
	const squarePar = s.latex.indexOf('[');
	const squigglePar = s.latex.indexOf('{');

	const to = context.editor.getCursor();
	const from: EditorPosition = {line: to.line, ch: to.ch - context.query.length};
	console.log('Inserting...', context.query);
	context.editor.replaceRange(s.latex.concat(' '), from, to);
	if (!context.query) {
		context.editor.setCursor(to.line, to.ch + s.latex.length + 1);
	}
	else if (squarePar != -1 || squigglePar != -1){
		squarePar != -1 && squigglePar != -1 ? context.editor.setCursor(to.line, to.ch + Math.min(squarePar, squigglePar)) :
		context.editor.setCursor(to.line, to.ch + Math.max(squarePar, squigglePar));
	}
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
		contentEl.createEl("h2", {text: "Configure Latex Command/Macro:"})
		// contentEl.setText("Configure Latex Command/Macro:");

		const commandName = new Setting(contentEl)
			.setName("Command Name (Macro name):")
			.addText((text) => text.onChange((value) => {this._name = value}));
		// commandName.settingEl.setText("place");

		const commandLatex = new Setting(contentEl)
			.setName("Latex command:")
			.addText((text) => text.onChange((value) => {this._latex = value}));
		// commandName.settingEl.setText("place");

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
	private _statusBar: HTMLElement;
	onAddSuggestion: (s: Suggestion) => void;
	limit = suggestLimit;

	constructor(app: App, suggestionList: Suggestion[], statusBar: HTMLElement, onAddSuggestion: (s: Suggestion) => void) {
		super(app);
		this._statusBar = statusBar
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
				this.onAddSuggestion(s);
				this.selectSuggestion(s, evt);
			});
			modal.open();
		}
		// else if (value.showMore)
		// {
		// 	this.limit = this._filteredSuggestionList.length;
		// 	return;
		// }
		else if (this.context?.editor) {
			setValue(this.context, value);
			value.rank ? value.rank++ : value.rank = 1;
			console.log("rank of " + value.name + " is: " + value.rank);
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

		// if (this._filteredSuggestionList.length > this.limit)
		// {
		// 	const merge  = (a: Suggestion[], b: Suggestion, i=0) => [...a.slice(0, i), b, ...a.slice(i)];
		// 	const showMore = merge(this._filteredSuggestionList, {name: "...", latex: "...", showMore: true}, this.limit - 1);
		// 	console.log(showMore);
		// 	return showMore;
		// }
		
		return this._filteredSuggestionList.length > 0 ? this._filteredSuggestionList.slice(0, this.limit).sort(sortSuggestions) :
			[{name: `add ${context.query}`, latex: "", isNew: true}];
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		if (this._statusBar.textContent == 'Math Mode: [off]') // ToDo: is there a more elegant way?
		{
			return null;
		}
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
