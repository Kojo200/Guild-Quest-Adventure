import menuButton from "./menu";

/**
 * @typedef {object} cycleButtonSettings
 * @property {string} label
 * @property {Array<*>} values - the underlying values to cycle through
 * @property {string[]} displayValues - matching display strings, same order as values
 * @property {() => *} get - reads the current value
 * @property {(value: *) => void} set - persists/applies a newly chosen value
 */

/**
 * a menuButton that cycles through a fixed list of values on click,
 * displaying "Label: <value>". Used for ON/OFF toggles and small
 * multi-choice settings (e.g. difficulty).
 */
class cycleButton extends menuButton {
  #label;
  #values;
  #displayValues;
  #get;
  #set;

  /**
   * @param {number} x
   * @param {number} y
   * @param {cycleButtonSettings & Record<string, unknown>} settings - plus any UITextButton settings (font, borderWidth, etc.)
   */
  constructor(x, y, settings) {
    const { label, values, displayValues, get, set, ...buttonSettings } =
      settings;
    const index = Math.max(values.indexOf(get()), 0);

    super(x, y, {
      ...buttonSettings,
      text: `${label}: ${displayValues[index]}`,
    });

    this.#label = label;
    this.#values = values;
    this.#displayValues = displayValues;
    this.#get = get;
    this.#set = set;
  }

  onAction() {
    const index = Math.max(this.#values.indexOf(this.#get()), 0);
    const nextIndex = (index + 1) % this.#values.length;
    this.#set(this.#values[nextIndex]);
    this.bitmapText.setText(
      `${this.#label}: ${this.#displayValues[nextIndex]}`,
    );
  }
}

export default cycleButton;
