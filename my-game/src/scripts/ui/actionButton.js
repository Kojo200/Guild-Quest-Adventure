import { UIBaseElement, NineSliceSprite, Text, Tween, audio, save } from "melonjs";
import { getButtonAtlas } from "./atlas";

const INSET_X = 4;
const INSET_Y = 3;
const HOVER_SCALE = 1.08;
const TWEEN_DURATION = 140;
const TEXT_COLOR = "#dddddd";

const HOVER_COOLDOWN_MS = 400;
let lastAnyClickTime = -Infinity;

class actionButton extends UIBaseElement {
    #background;
    #baseX;
    #baseY;
    #width;
    #height;
    #onAction;
    #label;
    #scaleState = { value: 1 };
    #tween;

    constructor(x, y, width, height, text, onAction) {
        super(x, y, width, height);
        this.#baseX = x;
        this.#baseY = y;
        this.#width = width;
        this.#height = height;
        this.#onAction = onAction;

        this.#background = new NineSliceSprite(width / 2, height / 2, {
            image: getButtonAtlas(),
            region: "tab_default",
            width,
            height,
            insetx: INSET_X,
            insety: INSET_Y,
        });
        this.#background.floating = false;
        this.addChild(this.#background, 0);

        this.#label = new Text(width / 2, height / 2, {
            font: "sans-serif",
            size: 14,
            fillStyle: TEXT_COLOR,
            textAlign: "center",
            textBaseline: "middle",
            text,
        });
        this.#label.floating = false;
        this.addChild(this.#label, 1);
    }

    setText(text) {
        this.#label.setText(text);
    }

    setOnAction(onAction) {
        this.#onAction = onAction;
    }

    onOver(event) {
        
        if (performance.now() - lastAnyClickTime > HOVER_COOLDOWN_MS) {
            audio.play("button_hover", false, null, save.sfxVolume);
            this.#setRegion("tab_hover");
            this.#tweenScaleTo(HOVER_SCALE);
        }
        return super.onOver(event);
    }

    onOut(event) {
        this.#setRegion("tab_default");
        this.#tweenScaleTo(1);
        return super.onOut(event);
    }

    onClick(event) {
        lastAnyClickTime = performance.now();
        audio.play("button_select", false, null, save.sfxVolume);
        this.#onAction();
        return false;
    }

    #setRegion(regionName) {
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
        this.addChild(this.#background, 0);
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

export default actionButton;
