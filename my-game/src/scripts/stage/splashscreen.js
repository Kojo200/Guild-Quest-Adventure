import { ColorLayer, Text, Sprite, input, timer, event, state } from "melonjs";
import ResponsiveStage from "./responsivestage";

/**
 * @typedef {object} SplashScreenSettings
 * @property {string} [text] - placeholder text logo, used when no image is given
 * @property {string} [image] - name of a preloaded image asset to use as the real logo
 * @property {number} [imageWidth] - native pixel width of that image (for contain-fit scaling)
 * @property {number} [imageHeight] - native pixel height of that image (for contain-fit scaling)
 * @property {string} [subtitle] - small hint shown near the bottom of the screen
 * @property {string} [backgroundColor]
 * @property {string} [textColor]
 * @property {number} [duration] - how long to display before auto-advancing, in ms
 * @property {number} nextState - state to switch to once this splash screen is done
 */

const DEFAULT_DURATION = 2000;
const DEFAULT_BACKGROUND_COLOR = "#0a0a0a";
const DEFAULT_TEXT_COLOR = "#ffffff";
const SUBTITLE_COLOR = "#666666";

/**
 * a generic boot-sequence splash screen (studio logo, game logo, etc).
 * displays placeholder text for a fixed duration, and can be skipped
 * early with a click/tap or by pressing enter/space/esc. Layout rebuilds
 * automatically on viewport resize (see ResponsiveStage).
 */
class SplashScreen extends ResponsiveStage {
    #config;
    #advanced = false;
    #timeoutId;

    /**
     * @param {SplashScreenSettings} settings
     */
    constructor(settings) {
        super();
        this.#config = settings;
    }

    /**
     * @param {import("melonjs").Application} app
     */
    onResetEvent(app) {
        super.onResetEvent(app); // builds the layout below + resize handling

        this.#advanced = false;

        // one-time setup: skip controls. Not resize-dependent, so this
        // stays out of layout() and isn't rebuilt on every resize.
        input.bindKey(input.KEY.ENTER, "skip", true);
        input.bindKey(input.KEY.SPACE, "skip", true);
        input.bindKey(input.KEY.ESC, "skip", true);
        event.on(event.GAME_UPDATE, this.#checkSkip);
        input.registerPointerEvent("pointerdown", app.viewport, this.#advance);

        this.#timeoutId = timer.setTimeout(this.#advance, this.#config.duration ?? DEFAULT_DURATION);
    }

    /**
     * @param {import("melonjs").Application} app
     */
    onDestroyEvent(app) {
        super.onDestroyEvent(app);

        if (this.#timeoutId !== undefined) {
            timer.clearTimeout(this.#timeoutId);
        }
        input.unbindKey(input.KEY.ENTER);
        input.unbindKey(input.KEY.SPACE);
        input.unbindKey(input.KEY.ESC);
        event.off(event.GAME_UPDATE, this.#checkSkip);
        input.releasePointerEvent("pointerdown", app.viewport, this.#advance);
    }

    /**
     * @param {import("melonjs").Application} app
     */
    layout(app) {
        const {
            text,
            image,
            imageWidth,
            imageHeight,
            subtitle,
            backgroundColor = DEFAULT_BACKGROUND_COLOR,
            textColor = DEFAULT_TEXT_COLOR,
        } = this.#config;

        this.addLayoutChild(new ColorLayer("background", backgroundColor), 0);

        if (image) {
            const logo = new Sprite(app.viewport.width / 2, app.viewport.height / 2, { image });

            // scale to fit inside the viewport without cropping or stretching
            const scale = Math.min(
                app.viewport.width / (imageWidth ?? logo.width),
                app.viewport.height / (imageHeight ?? logo.height),
            );
            logo.scale(scale);

            this.addLayoutChild(logo, 1);
        } else {
            // placeholder text logo -- swap for a Sprite once real artwork exists
            this.addLayoutChild(
                new Text(app.viewport.width / 2, app.viewport.height / 2, {
                    font: "sans-serif",
                    size: 28,
                    fillStyle: textColor,
                    textAlign: "center",
                    textBaseline: "middle",
                    text,
                }),
                1,
            );
        }

        if (subtitle) {
            this.addLayoutChild(
                new Text(app.viewport.width / 2, app.viewport.height - 24, {
                    font: "sans-serif",
                    size: 12,
                    fillStyle: SUBTITLE_COLOR,
                    textAlign: "center",
                    textBaseline: "middle",
                    text: subtitle,
                }),
                1,
            );
        }
    }

    #checkSkip = () => {
        if (input.isKeyPressed("skip")) {
            this.#advance();
        }
    };

    #advance = () => {
        if (this.#advanced) {
            return;
        }
        this.#advanced = true;
        state.change(this.#config.nextState);
    };
}

export default SplashScreen;
