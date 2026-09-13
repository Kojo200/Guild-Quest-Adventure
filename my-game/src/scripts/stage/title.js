import { ColorLayer, Text, save, state } from "melonjs";
import responsiveStage from "./responsiveStage";
import imageButton from "../ui/imageButton";
import { addCornerOrnaments, getCornerFootprint } from "../ui/cornerFrame";

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
// base position solved so the shadow's bottom-right corner lands ~30px
// in from each screen edge; nudged further left from there
const EXIT_MARGIN_X = 60;
const EXIT_MARGIN_Y = 45;

class TitleScreen extends responsiveStage {
    /**
     *  (re)builds every child on load and on every viewport resize
     *  @param {import("melonjs").Application} app
     */
    layout(app) {
        const { width, height } = app.viewport;

        this.addLayoutChild(new ColorLayer("background", BACKGROUND_COLOR), 0);

        // decorative corner ornaments framing the whole screen
        addCornerOrnaments((child, z) => this.addLayoutChild(child, z), width, height);

        const buttonX = (width - BUTTON_WIDTH) / 2;
        const hasSave = save.hasSave === true;
        let y = height / 2 - BUTTON_SPACING;

        // title sits a fixed gap above the New Game button, so it stays
        // correctly placed even if button layout ever shifts
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
                    // TODO: reset player/quest state here once that system exists
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
                // greyed out and unclickable until there's an actual save to load
                disabled: !hasSave,
                onAction: () => {
                    // TODO: once the save system exists, this should open a
                    // save-slot picker (all existing save files) instead of
                    // jumping straight into PLAY -- for now it just resumes,
                    // same as New Game
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

        // exit button sits close against the corner ornament, letting it
        // peek out from behind rather than clearing it entirely
        this.addLayoutChild(
            new imageButton(width - EXIT_WIDTH - EXIT_MARGIN_X, height - EXIT_HEIGHT - EXIT_MARGIN_Y, {
                width: EXIT_WIDTH,
                height: EXIT_HEIGHT,
                text: "Exit Game",
                onAction: () => {
                    // running inside Electron: ask the main process to quit for real
                    // running in a plain browser tab: the best JS can do is try to
                    // close the tab, which only works for script-opened windows
                    if (window.electron?.quit) {
                        window.electron.quit();
                    } else {
                        window.close();
                    }
                },
            }),
            1,
        );

        // studio credit, bottom-left corner -- text needs real clearance
        // from the ornament (unlike the buttons, there's no solid
        // background behind it to cover the overlap cleanly)
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
