
interface StateFrame {

}

interface MathJaxAutoStateInterface {
	statusElement: HTMLElement;

	get getIsOn (): boolean;
	enterMathMode (): boolean;
	openSubScope (n?: number): boolean;
}

class MathJaxAutoState implements MathJaxAutoStateInterface {
	private isOn: boolean;
	private contextStack: StateFrame[];
	public statusElement: HTMLElement;

	constructor (statusElement: HTMLElement) {
		this.isOn = false;
		this.contextStack = [];
		this.statusElement = statusElement;
	}

	updateStatus () {
		this.statusElement.setText(`Math mode: ${this.isOn}`);
	}

	get getIsOn () {
		return this.isOn;
	}
	enterMathMode () {
		if (this.isOn) {
			return false;
		}
		this.isOn = true;
		return true;
	}
	openSubScope (n?: number) {
		return true;
	}
}

export {
	MathJaxAutoState
}
export type {
	MathJaxAutoStateInterface
}
