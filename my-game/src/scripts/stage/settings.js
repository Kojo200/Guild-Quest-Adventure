import { ColorLayer, Text, save, state, audio, input } from "melonjs";
import responsiveStage from "./responsiveStage";
import menuButton from "../ui/menu";
import cycleButton from "../ui/cycleButton";
import keyBindButton from "../ui/keybind";

const BACKGROUND_COLOR = "#0d1420";

const GOLD = "#c9a86a";
const GOLD_HOVER_OFF = "rgba(201, 168, 106, 0.15)";
const GOLD_HOVER_ON = "rgba(201, 168, 106, 0.35)";

const TAB_ACTIVE_BORDER = "#e9cf9a";
const TAB_ACTIVE_FILL = "#ffffff";
const TAB_INACTIVE_BORDER = "#5a4d38";
const TAB_INACTIVE_FILL = "#8a8a8a";

const MARGIN = 20;
const BACK_WIDTH = 140;
const BACK_HEIGHT = 36;

const TAB_WIDTH = 150;
const TAB_HEIGHT = 34;
const TAB_Y = 140;
const TAB_GAP = 10;
const TABS = ["Gameplay", "Sound", "Controls", "Graphics"];

const ROW_WIDTH = 320;
const ROW_HEIGHT = 40;
const ROW_SPACING = 50;
const ROW_START_Y = 210;

const STEP_BUTTON_SIZE = 32;
const VOLUME_STEP = 0.1;

const BUTTON_STYLE = {
  font: "PressStart2P",
  size: 0.6,
  borderStrokeColor: GOLD,
  fillStyle: "#ffffff",
  hoverOffColor: GOLD_HOVER_OFF,
  hoverOnColor: GOLD_HOVER_ON,
};

class BackButton extends menuButton {
  constructor(x, y) {
    super(x, y, {
      font: "PressStart2P",
      text: "Back",
      size: 0.7,
      borderWidth: BACK_WIDTH,
      borderHeight: BACK_HEIGHT,
      borderStrokeColor: GOLD,
      fillStyle: "#ffffff",
      hoverOffColor: GOLD_HOVER_OFF,
      hoverOnColor: GOLD_HOVER_ON,
    });
  }

  onAction() {
    state.change(state.MENU);
  }
}

class TabButton extends menuButton {
  constructor(x, y, label, isActive, onSelect) {
    super(x, y, {
      font: "PressStart2P",
      text: label,
      size: 0.55,
      borderWidth: TAB_WIDTH,
      borderHeight: TAB_HEIGHT,
      borderStrokeColor: isActive ? TAB_ACTIVE_BORDER : TAB_INACTIVE_BORDER,
      fillStyle: isActive ? TAB_ACTIVE_FILL : TAB_INACTIVE_FILL,
      hoverOffColor: GOLD_HOVER_OFF,
      hoverOnColor: GOLD_HOVER_ON,
    });
    this.onSelect = onSelect;
  }

  onAction() {
    this.onSelect();
  }
}

class StepButton extends menuButton {
  constructor(x, y, label, onPress) {
    super(x, y, {
      font: "PressStart2P",
      text: label,
      size: 0.6,
      borderWidth: STEP_BUTTON_SIZE,
      borderHeight: ROW_HEIGHT,
      borderStrokeColor: GOLD,
      fillStyle: "#ffffff",
      hoverOffColor: GOLD_HOVER_OFF,
      hoverOnColor: GOLD_HOVER_ON,
    });
    this.onPress = onPress;
  }

  onAction() {
    this.onPress();
  }
}

const DEFAULT_KEY_BINDINGS = () => ({
  moveUp: input.KEY.W,
  moveDown: input.KEY.S,
  moveLeft: input.KEY.A,
  moveRight: input.KEY.D,
  interact: input.KEY.E,
});

class SettingsScreen extends responsiveStage {
  #activeTab = TABS[0];

  /**
   * @param {import("melonjs").Application} app
   */
  onResetEvent(app) {
    this.#activeTab = TABS[0];
    super.onResetEvent(app); // builds the layout below + resize handling
  }

  #selectTab(label) {
    this.#activeTab = label;
    this.refresh();
  }

  /**
   * (re)builds the title, tab bar, back button and the active tab's
   * rows. Called on first load, on viewport resize, and every time the
   * player switches tabs (via this.refresh()).
   * @param {import("melonjs").Application} app
   */
  layout(app) {
    const { width, height } = app.viewport;

    this.addLayoutChild(new ColorLayer("background", BACKGROUND_COLOR), 0);

    this.addLayoutChild(
      new Text(width / 2, 70, {
        font: "sans-serif",
        size: 30,
        fillStyle: GOLD,
        textAlign: "center",
        textBaseline: "middle",
        text: "Settings",
      }),
      1,
    );

    this.addLayoutChild(
      new BackButton(MARGIN, height - BACK_HEIGHT - MARGIN),
      1,
    );

    const totalTabWidth = TABS.length * TAB_WIDTH + (TABS.length - 1) * TAB_GAP;
    let tabX = (width - totalTabWidth) / 2;
    for (const label of TABS) {
      this.addLayoutChild(
        new TabButton(tabX, TAB_Y, label, label === this.#activeTab, () =>
          this.#selectTab(label),
        ),
        1,
      );
      tabX += TAB_WIDTH + TAB_GAP;
    }

    const rowX = (width - ROW_WIDTH) / 2;
    let y = ROW_START_Y;

    if (this.#activeTab === "Gameplay") {
      this.addLayoutChild(
        this.#toggleRow(rowX, y, "Screen Shake", "screenShake"),
        1,
      );
      y += ROW_SPACING;
      this.addLayoutChild(
        this.#toggleRow(rowX, y, "Damage Numbers", "damageNumbers"),
        1,
      );
      y += ROW_SPACING;
      this.addLayoutChild(
        new cycleButton(rowX, y, {
          ...BUTTON_STYLE,
          borderWidth: ROW_WIDTH,
          borderHeight: ROW_HEIGHT,
          label: "Difficulty",
          values: ["normal", "hard"],
          displayValues: ["Normal", "Hard"],
          get: () => save.difficulty,
          set: (v) => {
            save.difficulty = v;
          },
        }),
        1,
      );
    } else if (this.#activeTab === "Sound") {
      this.addLayoutChild(
        this.#toggleRow(rowX, y, "Mute All", "masterMuted", (muted) => {
          if (muted) {
            audio.muteAll();
          } else {
            audio.unmuteAll();
          }
        }),
        1,
      );
      y += ROW_SPACING;
      this.#volumeRow(rowX, y, "Music", "musicVolume");
      y += ROW_SPACING;
      this.#volumeRow(rowX, y, "SFX", "sfxVolume");
    } else if (this.#activeTab === "Controls") {
      const bindings = save.keyBindings ?? DEFAULT_KEY_BINDINGS();
      const controls = [
        ["Move Up", "moveUp"],
        ["Move Down", "moveDown"],
        ["Move Left", "moveLeft"],
        ["Move Right", "moveRight"],
        ["Interact", "interact"],
      ];
      for (const [label, action] of controls) {
        this.addLayoutChild(
          new keyBindButton(rowX, y, {
            ...BUTTON_STYLE,
            borderWidth: ROW_WIDTH,
            borderHeight: ROW_HEIGHT,
            label,
            action,
            keyCode: bindings[action],
            onRebind: (newKeyCode) => {
              save.keyBindings = { ...save.keyBindings, [action]: newKeyCode };
            },
          }),
          1,
        );
        y += ROW_SPACING;
      }
    } else if (this.#activeTab === "Graphics") {
      this.addLayoutChild(
        new cycleButton(rowX, y, {
          ...BUTTON_STYLE,
          borderWidth: ROW_WIDTH,
          borderHeight: ROW_HEIGHT,
          label: "Fullscreen",
          values: [false, true],
          displayValues: ["Off", "On"],
          get: () => app.isFullscreen(),
          set: (v) => (v ? app.requestFullscreen() : app.exitFullscreen()),
        }),
        1,
      );
      y += ROW_SPACING;
      this.addLayoutChild(
        new cycleButton(rowX, y, {
          ...BUTTON_STYLE,
          borderWidth: ROW_WIDTH,
          borderHeight: ROW_HEIGHT,
          label: "Anti-Aliasing",
          values: [false, true],
          displayValues: ["Off", "On"],
          get: () => save.antiAliasing === true,
          set: (v) => {
            save.antiAliasing = v;
            app.renderer.setAntiAlias(v);
          },
        }),
        1,
      );
      y += ROW_SPACING;
      this.addLayoutChild(
        new cycleButton(rowX, y, {
          ...BUTTON_STYLE,
          borderWidth: ROW_WIDTH,
          borderHeight: ROW_HEIGHT,
          label: "Filtering",
          values: [false, true],
          displayValues: ["Smooth", "Pixelated"],
          get: () => save.pixelPerfect === true,
          set: (v) => {
            save.pixelPerfect = v;
            // explicit "linear"/"nearest" rather than "auto", so this
            // stays independent of the Anti-Aliasing setting above
            app.renderer.setTextureFilter(v ? "nearest" : "linear");
          },
        }),
        1,
      );
      y += ROW_SPACING;
      this.addLayoutChild(
        new Text(rowX + ROW_WIDTH / 2, y + ROW_HEIGHT / 2, {
          font: "sans-serif",
          size: 13,
          fillStyle: "#777777",
          textAlign: "center",
          textBaseline: "middle",
          text: `Renderer: ${app.renderer.type}`,
        }),
        1,
      );
    }
  }

  #toggleRow(x, y, label, saveKey, onChange) {
    return new cycleButton(x, y, {
      ...BUTTON_STYLE,
      borderWidth: ROW_WIDTH,
      borderHeight: ROW_HEIGHT,
      label,
      values: [true, false],
      displayValues: ["On", "Off"],
      get: () => save[saveKey] === true,
      set: (v) => {
        save[saveKey] = v;
        onChange?.(v);
      },
    });
  }

  #volumeRow(x, y, label, saveKey) {
    const format = () => `${label}: ${Math.round(save[saveKey] * 100)}%`;
    const clamp = (v) => Math.min(1, Math.max(0, Math.round(v * 10) / 10));

    const valueText = new Text(x + ROW_WIDTH / 2, y + ROW_HEIGHT / 2, {
      font: "sans-serif",
      size: 14,
      fillStyle: "#ffffff",
      textAlign: "center",
      textBaseline: "middle",
      text: format(),
    });

    const applyDelta = (delta) => {
      save[saveKey] = clamp(save[saveKey] + delta);
      valueText.setText(format());
    };

    this.addLayoutChild(
      new StepButton(x, y, "-", () => applyDelta(-VOLUME_STEP)),
      1,
    );
    this.addLayoutChild(valueText, 1);
    this.addLayoutChild(
      new StepButton(x + ROW_WIDTH - STEP_BUTTON_SIZE, y, "+", () =>
        applyDelta(VOLUME_STEP),
      ),
      1,
    );
  }
}

export default SettingsScreen;
