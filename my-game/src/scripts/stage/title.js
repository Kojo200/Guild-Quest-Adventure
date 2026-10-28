import { ColorLayer, Text, save, state } from "melonjs";
import responsiveStage from "./responsiveStage";
import imageButton from "../ui/imageButton";
import { addCornerOrnaments, getCornerFootprint } from "../ui/cornerFrame";
import { quests } from "../quests/questSystem";

const BACKGROUND_COLOR = "#0d1420";

const CREDIT_MARGIN_Y = 20;
const CREDIT_GAP = 10;
const CREDIT_COLOR = "#666666";

const GOLD = "#c9a86a";

const TITLE_SIZE = 54;
const TITLE_GAP = 85;

const BUTTON_WIDTH = 260;
const BUTTON_HEIGHT = 54;
const BUTTON_SPACING = 90;

const EXIT_WIDTH = 190;
const EXIT_HEIGHT = 46;

const EXIT_MARGIN_X = 60;
const EXIT_MARGIN_Y = 45;

class TitleScreen extends responsiveStage {
   
    layout(app) {
        const { width, height } = app.viewport;

        this.addLayoutChild(new ColorLayer("background", BACKGROUND_COLOR), 0);

        addCornerOrnaments((child, z) => this.addLayoutChild(child, z), width, height);

        const buttonX = (width - BUTTON_WIDTH) / 2;
        const hasSave = save.hasSave === true;
        let y = height / 2 - BUTTON_SPACING;

        this.addLayoutChild(
            new Text(width / 2, y - TITLE_GAP, {
                font: "sans-serif",
                size: TITLE_SIZE,
                fillStyle: GOLD,
                textAlign: "center",
                textBaseline: "middle",
                text: "Guild Quest Adventure",
            }),
            1,
        );

        this.addLayoutChild(
            new imageButton(buttonX, y, {
                width: BUTTON_WIDTH,
                height: BUTTON_HEIGHT,
                text: "New Game",
                onAction: () => {
                    quests.reset();
                    save.hasSave = true;
                    state.change(state.PLAY);
                },
            }),
            1,
        );
        y += BUTTON_SPACING;

        this.addLayoutChild(
            new imageButton(buttonX, y, {
                width: BUTTON_WIDTH,
                height: BUTTON_HEIGHT,
                text: "Continue",
                disabled: !hasSave,
                onAction: () => {
                    state.change(state.PLAY);
                },
            }),
            1,
        );
        y += BUTTON_SPACING;

        this.addLayoutChild(
            new imageButton(buttonX, y, {
                width: BUTTON_WIDTH,
                height: BUTTON_HEIGHT,
                text: "Settings",
                onAction: () => state.change(state.SETTINGS),
            }),
            1,
        );

        this.addLayoutChild(
            new imageButton(width - EXIT_WIDTH - EXIT_MARGIN_X, height - EXIT_HEIGHT - EXIT_MARGIN_Y, {
                width: EXIT_WIDTH,
                height: EXIT_HEIGHT,
                text: "Exit Game",
                onAction: () => {
     
                    if (window.electron?.quit) {
                        window.electron.quit();
                    } else {
                        window.close();
                    }
                },
            }),
            1,
        );

        this.addLayoutChild(
            new Text(getCornerFootprint() + CREDIT_GAP, height - CREDIT_MARGIN_Y, {
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
