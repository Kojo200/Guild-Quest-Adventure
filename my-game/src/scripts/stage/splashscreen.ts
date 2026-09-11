import { type Application, Stage, ColorLayer, Text, input, timer, event, state } from "melonjs";

interface SplashScreenSettings {
    /** main placeholder text (swap for a logo Sprite once real artwork exists) */
    text: string;
    /** small hint shown near the bottom of the screen */
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    /** how long to display before auto-advancing, in ms */
    duration?: number;
    /** state to switch to once this splash screen is done */
    nextState: number;
}

const DEFAULT_DURATION = 2000;
const DEFAULT_BACKGROUND_COLOR = "#0a0a0a";
const DEFAULT_TEXT_COLOR = "#ffffff";
const SUBTITLE_COLOR = "#666666";

/**
 * a generic boot-sequence splash screen (studio logo, game logo, etc).
 * displays placeholder text for a fixed duration, and can be skipped
 * early with a click/tap or by pressing enter/space/esc.
 */
class SplashScreen extends Stage {
    private config: SplashScreenSettings;
    private advanced = false;
    private timeoutId?: number;

    constructor(settings: SplashScreenSettings) {
        super();
        this.config = settings;
    }

    onResetEvent(app: Application) {
        this.advanced = false;

        const {
            text,
            subtitle,
            backgroundColor = DEFAULT_BACKGROUND_COLOR,
            textColor = DEFAULT_TEXT_COLOR,
            duration = DEFAULT_DURATION,
        } = this.config;

        app.world.addChild(new ColorLayer("background", backgroundColor), 0);

        app.world.addChild(
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

        if (subtitle) {
            app.world.addChild(
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

        // allow the player to skip ahead instead of waiting out the timer
        input.bindKey(input.KEY.ENTER, "skip", true);
        input.bindKey(input.KEY.SPACE, "skip", true);
        input.bindKey(input.KEY.ESC, "skip", true);
        event.on(event.GAME_UPDATE, this.checkSkip);
        input.registerPointerEvent("pointerdown", app.viewport, this.advance);

        this.timeoutId = timer.setTimeout(this.advance, duration);
    }

    onDestroyEvent(app: Application) {
        if (this.timeoutId !== undefined) {
            timer.clearTimeout(this.timeoutId);
        }
        input.unbindKey(input.KEY.ENTER);
        input.unbindKey(input.KEY.SPACE);
        input.unbindKey(input.KEY.ESC);
        event.off(event.GAME_UPDATE, this.checkSkip);
        input.releasePointerEvent("pointerdown", app.viewport, this.advance);
    }

    private checkSkip = () => {
        if (input.isKeyPressed("skip")) {
            this.advance();
        }
    };

    private advance = () => {
        if (this.advanced) {
            return;
        }
        this.advanced = true;
        state.change(this.config.nextState);
    };
}

export default SplashScreen;
