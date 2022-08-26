
interface Suggestion {
	name: string;
	subs: number;
	rank?: number;
}

interface MathJaxAutoSettings {
	suggestionList: Suggestion[];
	addUserCommands: boolean;
	userCommandsPriority?: number;
}

import { suggestions } from './default';
const DEFAULT_SETTINGS: MathJaxAutoSettings = {
	suggestionList: suggestions,
	addUserCommands: true,
	userCommandsPriority: 1
}

export {
	DEFAULT_SETTINGS
}
export type {
	MathJaxAutoSettings,
	Suggestion
}
