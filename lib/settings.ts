
interface MathJaxAutoSettings {
	acDefaultSuggestionsLocation: string;
	userAddedSuggestionsLocation: string;
	addUserCommands: boolean;
	userCommandsPriority?: number;
}

const DEFAULT_SETTINGS: MathJaxAutoSettings = {
	acDefaultSuggestionsLocation: './utils/default.json',
	userAddedSuggestionsLocation: './utils/user.json',
	addUserCommands: true,
	userCommandsPriority: 1
}

export {
	DEFAULT_SETTINGS
}
export type {
	MathJaxAutoSettings
}
