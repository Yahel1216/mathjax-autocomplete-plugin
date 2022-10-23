
interface Suggestion {
	name: string;
	latex: string,
	rank?: number;
	isNew?: boolean;
	// showMore?: boolean
}

interface RankSetting {
	prompt: string;
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
	RankSetting,
	MathJaxAutoSettings,
	Suggestion
}
