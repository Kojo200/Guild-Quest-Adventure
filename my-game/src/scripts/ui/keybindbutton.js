import { input } from "melonjs";
import MenuButton from "./menubutton";

// build a keyCode -> friendly name lookup once, from melonJS's own KEY map
// (input.KEY.W === 87, etc.) so labels never drift out of sync with it
const KEY_NAMES = Object.fromEntries(
  Object.entries(input.KEY).map(([name, code]) => [code, name]),
);

function keyLabel(keyCode) {
  return KEY_NAMES[keyCode] ?? `#${keyCode}`;
}

/**
 * a MenuButton that rebinds a melonJS input action to a new key. Click it,
 * then press any key -- the action is rebound live (unbind old, bind new)
 * and onRebind(newKeyCode) is called so the caller can persist it.
 */
class KeyBindButton extends MenuButton {
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

  /**
   * @param {number} x
   * @param {number} y
   * @param {{label: string, action: string, keyCode: number, onRebind: (keyCode: number) => void} & Record<string, unknown>} settings
   */
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

export default KeyBindButton;
