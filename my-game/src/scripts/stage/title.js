import { ColorLayer, Text, save, state } from "melonjs";
import responsiveStage from "./responsiveStage";
import menuButton from "../ui/menu";

const BACKGROUND_COLOR = "#0d1420";

const CREDIT_MARGIN = 20;
const CREDIT_COLOR = "#666666";

const BUTTON_WIDTH = 220;
const BUTTON_HEIGHT = 40;
const BUTTON_SPACING = 56;
const BUTTON_FONT_SIZE = 0.7;

const EXIT_WIDTH = 170;
const EXIT_HEIGHT = 36;
const EXIT_MARGIN = 20;

const GOLD = "#c9a86a";
const GOLD_HOVER_OFF = "rgba(201, 168, 106, 0.15)";
const GOLD_HOVER_ON = "rgba(201, 168, 106, 0.35)";

const DISABLED_BORDER = "#444444";
const DISABLED_FILL = "#777777";
const DISABLED_HOVER = "rgba(68, 68, 68, 0.15)";

const RED = "#b33a3a";
const RED_HOVER_OFF = "rgba(179, 58, 58, 0.15)";
const RED_HOVER_ON = "rgba(179, 58, 58, 0.4)";

class NewGameButton extends menuButton {
  constructor(x, y) {
    super(x, y, {
      font: "PressStart2P",
      text: "New Game",
      size: BUTTON_FONT_SIZE,
      borderWidth: BUTTON_WIDTH,
      borderHeight: BUTTON_HEIGHT,
      borderStrokeColor: GOLD,
      fillStyle: "#ffffff",
      hoverOffColor: GOLD_HOVER_OFF,
      hoverOnColor: GOLD_HOVER_ON,
    });
  }

  onAction() {
    // TODO: reset player/quest state here once that system exists
    save.hasSave = true;
    state.change(state.PLAY);
  }
}

class ContinueButton extends menuButton {
  constructor(x, y) {
    const hasSave = save.hasSave === true;

    super(x, y, {
      font: "PressStart2P",
      text: "Continue",
      size: BUTTON_FONT_SIZE,
      borderWidth: BUTTON_WIDTH,
      borderHeight: BUTTON_HEIGHT,
      borderStrokeColor: hasSave ? GOLD : DISABLED_BORDER,
      fillStyle: hasSave ? "#ffffff" : DISABLED_FILL,
      hoverOffColor: hasSave ? GOLD_HOVER_OFF : DISABLED_HOVER,
      hoverOnColor: hasSave ? GOLD_HOVER_ON : DISABLED_HOVER,
    });

    // greyed out and unclickable until there's an actual save to load
    this.isClickable = hasSave;
  }

  onAction() {
    // TODO: once the save system exists, this should open a save-slot
    // picker (all existing save files) instead of jumping straight
    // into PLAY -- for now it just resumes, same as New Game
    state.change(state.PLAY);
  }
}

class SettingsButton extends menuButton {
  constructor(x, y) {
    super(x, y, {
      font: "PressStart2P",
      text: "Settings",
      size: BUTTON_FONT_SIZE,
      borderWidth: BUTTON_WIDTH,
      borderHeight: BUTTON_HEIGHT,
      borderStrokeColor: GOLD,
      fillStyle: "#ffffff",
      hoverOffColor: GOLD_HOVER_OFF,
      hoverOnColor: GOLD_HOVER_ON,
    });
  }

  onAction() {
    state.change(state.SETTINGS);
  }
}

class ExitButton extends menuButton {
  constructor(x, y) {
    super(x, y, {
      font: "PressStart2P",
      text: "Exit Game",
      size: BUTTON_FONT_SIZE,
      borderWidth: EXIT_WIDTH,
      borderHeight: EXIT_HEIGHT,
      borderStrokeColor: RED,
      fillStyle: "#ffffff",
      hoverOffColor: RED_HOVER_OFF,
      hoverOnColor: RED_HOVER_ON,
    });
  }

  onAction() {
    // running inside Electron: ask the main process to quit for real
    // running in a plain browser tab: the best JS can do is try to
    // close the tab, which only works for script-opened windows
    if (window.electron?.quit) {
      window.electron.quit();
    } else {
      window.close();
    }
  }
}

class TitleScreen extends responsiveStage {
  /**
   *  (re)builds every child on load and on every viewport resize
   *  @param {import("melonjs").Application} app
   */
  layout(app) {
    const { width, height } = app.viewport;

    this.addLayoutChild(new ColorLayer("background", BACKGROUND_COLOR), 0);

    this.addLayoutChild(
      new Text(width / 2, 90, {
        font: "sans-serif",
        size: 34,
        fillStyle: GOLD,
        textAlign: "center",
        textBaseline: "middle",
        text: "Guild Quest Adventure",
      }),
      1,
    );

    const buttonX = (width - BUTTON_WIDTH) / 2;
    let y = height / 2 - BUTTON_SPACING;

    this.addLayoutChild(new NewGameButton(buttonX, y), 1);
    y += BUTTON_SPACING;
    this.addLayoutChild(new ContinueButton(buttonX, y), 1);
    y += BUTTON_SPACING;
    this.addLayoutChild(new SettingsButton(buttonX, y), 1);

    // exit button always sits in the bottom-right corner
    this.addLayoutChild(
      new ExitButton(
        width - EXIT_WIDTH - EXIT_MARGIN,
        height - EXIT_HEIGHT - EXIT_MARGIN,
      ),
      1,
    );

    // studio credit, bottom-left corner
    this.addLayoutChild(
      new Text(CREDIT_MARGIN, height - CREDIT_MARGIN, {
        font: "sans-serif",
        size: 13,
        fillStyle: CREDIT_COLOR,
        textAlign: "left",
        textBaseline: "bottom",
        text: "Made by Silent Edge Studio",
      }),
      1,
    );
  }
}

export default TitleScreen;
