import { input } from "melonjs";
import menuButton from "./menu";

const KEY_NAMES = Object.fromEntries(
  Object.entries(input.KEY).map(([name, code]) => [code, name]),
);

function keyLabel(keyCode) {
  return KEY_NAMES[keyCode] ?? `#${keyCode}`;
}

class keyBindButton extends menuButton {
  #label;
  #action;
  #keyCode;
  #onRebind;
  #listening = false;

  #onKeyDown = (event) => {
    if (!this.#listening) {
      return;
    }
    this.#stopListening();

    const newKeyCode = event.keyCode;
    input.unbindKey(this.#keyCode);
    input.bindKey(newKeyCode, this.#action);
    this.#keyCode = newKeyCode;
    this.#onRebind(newKeyCode);
    this.bitmapText.setText(`${this.#label}: ${keyLabel(newKeyCode)}`);
  };

  constructor(x, y, settings) {
    const { label, action, keyCode, onRebind, ...buttonSettings } = settings;

    super(x, y, {
      ...buttonSettings,
      text: `${label}: ${keyLabel(keyCode)}`,
    });

    this.#label = label;
    this.#action = action;
    this.#keyCode = keyCode;
    this.#onRebind = onRebind;
  }

  onAction() {
    if (this.#listening) {
      return;
    }
    this.#listening = true;
    this.bitmapText.setText(`${this.#label}: press a key...`);
    window.addEventListener("keydown", this.#onKeyDown);
  }

  onDestroyEvent() {
    this.#stopListening();
  }

  #stopListening() {
    if (this.#listening) {
      this.#listening = false;
      window.removeEventListener("keydown", this.#onKeyDown);
    }
  }
}

export default keyBindButton;
