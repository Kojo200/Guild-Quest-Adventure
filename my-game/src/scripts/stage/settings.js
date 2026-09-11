import { Stage, ColorLayer, Text, state } from "melonjs";
import MenuButton from "../ui/menubutton";

const BACKGROUND_COLOR = "#0d1420";
const BACK_WIDTH = 140;
const BACK_HEIGHT = 36;
const MARGIN = 20;
const GOLD = "#c9a86a";

class BackButton extends MenuButton {
    constructor(x, y) {
        super(x, y, {
            font: "PressStart2P",
            text: "Back",
            size: 0.7,
            borderWidth: BACK_WIDTH,
            borderHeight: BACK_HEIGHT,
            borderStrokeColor: GOLD,
            fillStyle: "#ffffff",
            hoverOffColor: "rgba(201, 168, 106, 0.15)",
            hoverOnColor: "rgba(201, 168, 106, 0.35)",
        });
    }

    onAction() {
        state.change(state.MENU);
    }
}

class SettingsScreen extends Stage {
    /**
     *  action to perform on state change
     *  @param {import("melonjs").Application} app
     */
    onResetEvent(app) {
        const { width, height } = app.viewport;

        app.world.addChild(new ColorLayer("background", BACKGROUND_COLOR), 0);

        // TODO: real settings controls (volume, key bindings, etc.) go here
        app.world.addChild(
            new Text(width / 2, height / 2, {
                font: "sans-serif",
                size: 24,
                fillStyle: "#ffffff",
                textAlign: "center",
                textBaseline: "middle",
                text: "Settings (coming soon)",
            }),
            1,
        );

        app.world.addChild(new BackButton(MARGIN, height - BACK_HEIGHT - MARGIN), 1);
    }
}

export default SettingsScreen;
