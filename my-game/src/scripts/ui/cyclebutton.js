import menuButton from "./menu";

class cycleButton extends menuButton {
  #label;
  #values;
  #displayValues;
  #get;
  #set;

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
