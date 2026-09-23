import { ColorLayer, Text } from "melonjs";
import actionButton from "./actionButton";

const GOLD = "#c9a86a";
const PAUSE_BUTTON_WIDTH = 220;
const PAUSE_BUTTON_HEIGHT = 46;
const PAUSE_BUTTON_SPACING = 60;
const PAUSE_OVERLAY_ALPHA = 0.7;

export function buildPauseOverlay(addChild, width, height, onReturn, onSettings, onQuit) {

    const dim = new ColorLayer("pause-dim", "#0d0705");
    dim.setOpacity(PAUSE_OVERLAY_ALPHA);
    addChild(dim, 10);

    addChild(
        new Text(width / 2, height / 2 - PAUSE_BUTTON_SPACING * 1.5, {
            font: "sans-serif",
            size: 40,
            fillStyle: GOLD,
            textAlign: "center",
            textBaseline: "middle",
            text: "Paused",
        }),
        11,
    );

    const buttonX = (width - PAUSE_BUTTON_WIDTH) / 2;
    let y = height / 2 - PAUSE_BUTTON_HEIGHT / 2;

    addChild(new actionButton(buttonX, y, PAUSE_BUTTON_WIDTH, PAUSE_BUTTON_HEIGHT, "Return", onReturn), 11);
    y += PAUSE_BUTTON_SPACING;

    addChild(new actionButton(buttonX, y, PAUSE_BUTTON_WIDTH, PAUSE_BUTTON_HEIGHT, "Settings", onSettings), 11);
    y += PAUSE_BUTTON_SPACING;

    addChild(new actionButton(buttonX, y, PAUSE_BUTTON_WIDTH, PAUSE_BUTTON_HEIGHT, "Quit", onQuit), 11);
}
