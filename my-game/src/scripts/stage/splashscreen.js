import { ColorLayer, Text, Sprite, input, timer, event, state } from "melonjs";
import responsiveStage from "./responsiveStage";

const DEFAULT_DURATION = 2000;
const DEFAULT_BACKGROUND_COLOR = "#0a0a0a";
const DEFAULT_TEXT_COLOR = "#ffffff";
const SUBTITLE_COLOR = "#666666";

class SplashScreen extends responsiveStage {
  #config;
  #advanced = false;
  #timeoutId;

  constructor(settings) {
    super();
    this.#config = settings;
  }

  onResetEvent(app) {
    super.onResetEvent(app);

    this.#advanced = false;

    input.bindKey(input.KEY.ENTER, "skip", true);
    input.bindKey(input.KEY.SPACE, "skip", true);
    input.bindKey(input.KEY.ESC, "skip", true);
    event.on(event.GAME_UPDATE, this.#checkSkip);
    input.registerPointerEvent("pointerdown", app.viewport, this.#advance);

    this.#timeoutId = timer.setTimeout(
      this.#advance,
      this.#config.duration ?? DEFAULT_DURATION,
    );
  }

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
      const logo = new Sprite(app.viewport.width / 2, app.viewport.height / 2, {
        image,
      });

      const scale = Math.min(
        app.viewport.width / (imageWidth ?? logo.width),
        app.viewport.height / (imageHeight ?? logo.height),
      );
      logo.scale(scale);

      this.addLayoutChild(logo, 1);
    } else {
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
