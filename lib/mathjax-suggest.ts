import {Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile} from "obsidian";

interface Suggestion {
	name: string;
	subs: number;
}
const simple: Suggestion[] = [
	{name: 'cdot', subs: 0},
	{name: 'frac', subs: 1},
]

class MathjaxSuggest extends EditorSuggest<string> {
    renderSuggestion(value: string, el: HTMLElement): void {
		console.log("Render", el);
		el.setText(value);
    }
    selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
		console.log("Select", value, evt);
        throw new Error("Method not implemented.");
    }
	getSuggestions(context: EditorSuggestContext): string[] | Promise<string[]> {
		return simple.filter(s => s.name.startsWith(context.query)).map(s => s.name);
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		const prefix = editor.getLine(cursor.line).substring(0, cursor.ch);
		console.log("Prefix", prefix);
		const start = prefix.lastIndexOf('\\');
		if (start == -1) {
			return null;
		}
		const ofInterest = prefix.substring(start + 1);
		if (ofInterest.search(/[^\w]/) >= 0) {
			console.log("Not triggering because", ofInterest.search(/[^\w]/));
			return null;
		}
		const result: EditorSuggestTriggerInfo = {
			start: {line: cursor.line, ch: start + 1},
			end: cursor,
			query: ofInterest
		}
		console.log('Returning result', result);
		return result;
	}
}

export {MathjaxSuggest}
