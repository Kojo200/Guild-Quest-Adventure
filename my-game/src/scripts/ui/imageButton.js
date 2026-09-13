import { UIBaseElement, NineSliceSprite, Text, Tween, audio, save } from "melonjs";
import { getButtonAtlas } from "./buttonAtlas";

const INSET_X = 12;
const INSET_Y = 6;

const SHADOW_PADDING = 10;
const SHADOW_OFFSET_Y = 5;

const HOVER_SCALE = 1.08;
const TWEEN_DURATION = 140;

const TEXT_COLOR = "#4a2e18";
const DISABLED_TEXT_COLOR = "#888888";
const DISABLED_TINT = "#888888";

const SHADOW_Z = 0;
const BACKGROUND_Z = 1;
const TEXT_Z = 2;

class imageButton extends UIBaseElement {
    #disabled;
    #onAction;
    #width;
    #height;
    #baseX;
    #baseY;
    #background;
    #shadow;
    #scaleState = { value: 1 };
    #tween;

    constructor(x, y, settings) {
        const { width, height, text, onAction, disabled = false } = settings;
        super(x, y, width, height);

        this.#disabled = disabled;
        this.#onAction = onAction;
        this.#width = width;
        this.#height = height;
        this.#baseX = x;
        this.#baseY = y;
        this.isClickable = !disabled;

        const atlas = getButtonAtlas();
        const shadowWidth = width + SHADOW_PADDING * 2;
        const shadowHeight = height + SHADOW_PADDING * 2;

        this.#shadow = new NineSliceSprite(width / 2, height / 2 + SHADOW_OFFSET_Y, {
            image: atlas,
            region: "button_shadow",
            width: shadowWidth,
            height: shadowHeight,
            insetx: INSET_X,
            insety: INSET_Y,
        });
        this.#shadow.floating = false;
        this.addChild(this.#shadow, SHADOW_Z);

        this.#background = new NineSliceSprite(width / 2, height / 2, {
            image: atlas,
            region: "button_default",
            width,
            height,
            insetx: INSET_X,
            insety: INSET_Y,
            tint: disabled ? DISABLED_TINT : undefined,
        });
        this.#background.floating = false;
        this.addChild(this.#background, BACKGROUND_Z);

        const label = new Text(width / 2, height / 2, {
            font: "sans-serif",
            size: Math.round(height * 0.42),
            fillStyle: disabled ? DISABLED_TEXT_COLOR : TEXT_COLOR,
            textAlign: "center",
            textBaseline: "middle",
            text,
        });
        label.floating = false;
        this.addChild(label, TEXT_Z);
    }

    onOver(event) {
        if (!this.#disabled) {
            audio.play("button_hover", false, null, save.sfxVolume);
            this.#shadow.setOpacity(0);
            this.#setBackgroundRegion("button_hover");
            this.#tweenScaleTo(HOVER_SCALE);
        }
        return super.onOver(event);
    }

    onOut(event) {
        if (!this.#disabled) {
            this.#shadow.setOpacity(1);
            this.#setBackgroundRegion("button_default");
            this.#tweenScaleTo(1);
        }
        return super.onOut(event);
    }

    onClick(event) {
        audio.play("button_select", false, null, save.sfxVolume);
        this.#onAction?.();
        return false;
    }

    #setBackgroundRegion(regionName) {
        this.removeChild(this.#background);
        this.#background = new NineSliceSprite(this.#width / 2, this.#height / 2, {
            image: getButtonAtlas(),
            region: regionName,
            width: this.#width,
            height: this.#height,
            insetx: INSET_X,
            insety: INSET_Y,
        });
        this.#background.floating = false;
        this.addChild(this.#background, BACKGROUND_Z);
    }

    #tweenScaleTo(target) {
        if (this.#tween) {
            this.#tween.stop();
        }
        this.#tween = new Tween(this.#scaleState)
            .to({ value: target }, { duration: TWEEN_DURATION, easing: Tween.Easing.Quadratic.Out })
            .onUpdate(() => {
                const s = this.#scaleState.value;
                this.currentTransform.identity();
                this.currentTransform.scale(s, s, 1);
                this.pos.x = this.#baseX - (this.#width * (s - 1)) / 2;
                this.pos.y = this.#baseY - (this.#height * (s - 1)) / 2;
            })
            .start();
    }
}

export default imageButton;
