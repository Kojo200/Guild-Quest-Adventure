import { UIBaseElement, Text, audio, save } from "melonjs";

const TEXT_COLOR = "#4a2e18";
const DISABLED_TEXT_COLOR = "#888888";

class optionRow extends UIBaseElement {
    #disabled;
    #onActionCallback;
    #label;

    constructor(x, y, settings) {
        const { width, height, text, onAction, disabled = false, textColor } = settings;
        super(x, y, width, height);

        this.#disabled = disabled;
        this.#onActionCallback = onAction;
        this.isClickable = !disabled;

        this.#label = new Text(width / 2, height / 2, {
            font: "sans-serif",
            size: Math.round(height * 0.42),
            fillStyle: disabled ? DISABLED_TEXT_COLOR : (textColor ?? TEXT_COLOR),
            textAlign: "center",
            textBaseline: "middle",
            text,
        });
        this.#label.floating = false;
        this.addChild(this.#label, 0);
    }

    setText(text) {
        this.#label.setText(text);
    }

    onClick(event) {
        audio.play("button_select", false, null, save.sfxVolume);
        this.onAction();
        return false;
    }

    onAction() {
        this.#onActionCallback?.();
    }
}

export default optionRow;
