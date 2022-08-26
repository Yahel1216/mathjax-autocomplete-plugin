import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
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


class MathjaxSuggest extends EditorSuggest<string> {
	private _fullSuggestionList: Suggestion[];
	private _last_query?: string = undefined;
	private _lastSuggestionList: Suggestion[] = [];
	private _lastNameList: string[] = [];

	constructor(app: App, suggestionList: Suggestion[]) {
		super(app);
		this._fullSuggestionList = suggestionList.sort(compareSuggestions);
		this._lastSuggestionList = this._fullSuggestionList;
	}

    renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
    }
    selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
        const selected: Suggestion | undefined = this._lastSuggestionList.find(
			(s: Suggestion) => s.name == value)
		if (!selected) {
			// Todo: add suggestion to list
		} else if (this.context?.editor) {
			const to = this.context.editor.getCursor();
			const from: EditorPosition = {line: to.line, ch: to.ch - this.context.query.length};
			console.log('Inserting...', this.context.query);
			// const replacement = `${selected.name}${'{}' * }`
			this.context.editor.replaceRange(selected.name, from, to);
		}
    }

	getSuggestions(context: EditorSuggestContext): string[] | Promise<string[]> {
		if (!this._last_query || !context.query.startsWith(this._last_query)) {
			// The last query is not the prefix of the current query, so we re-filter all suggestions.
			this._lastSuggestionList = this._fullSuggestionList;
		}
		this._lastSuggestionList = this._lastSuggestionList.filter(querySuggestionFilter(context.query));
		this._lastNameList = this._lastSuggestionList.map(mapSuggestionToName);
		this._last_query = context.query;
		return this._lastNameList;
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		const prefix = editor.getLine(cursor.line).substring(0, cursor.ch);
		const start = prefix.lastIndexOf('\\');
		if (start == -1) {
			return null;
		}
		const ofInterest = prefix.substring(start + 1);
		if (ofInterest.search(/[^\w]/) >= 0) {
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
