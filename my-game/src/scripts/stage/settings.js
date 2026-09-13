import { ColorLayer, Text, NineSliceSprite, UIBaseElement, Tween, save, state, audio, input } from "melonjs";
import responsiveStage from "./responsiveStage";
import menuButton from "../ui/menu";
import cycleButton from "../ui/cycleButton";
import keyBindButton from "../ui/keybind";
import { getButtonAtlas } from "../ui/buttonAtlas";
import { addCornerOrnaments } from "../ui/cornerFrame";

const BACKGROUND_COLOR = "#0d1420";

const GOLD = "#c9a86a";
const GOLD_HOVER_OFF = "rgba(201, 168, 106, 0.15)";
const GOLD_HOVER_ON = "rgba(201, 168, 106, 0.35)";

const MARGIN_X = 60;
const MARGIN_Y = 45;
const BACK_WIDTH = 140;
const BACK_HEIGHT = 36;

const TITLE_Y = 95;
const TITLE_PLATE_WIDTH = 260;
const TITLE_PLATE_HEIGHT = 56;
const TITLE_INSET_X = 12;
const TITLE_INSET_Y = 6;
const TITLE_SHADOW_PADDING = 10;
const TITLE_SHADOW_OFFSET_Y = 5;
const TITLE_TEXT_COLOR = "#4a2e18";

const TAB_WIDTH = 150;
const TAB_HEIGHT = 34;
const TAB_Y = 165;
const TAB_GAP = 10;
const TAB_INSET_X = 4;
const TAB_INSET_Y = 3;
const TAB_HOVER_SCALE = 1.08;
const TAB_TWEEN_DURATION = 140;
const TAB_ACTIVE_TEXT_COLOR = "#4a2e18";
const TAB_INACTIVE_TEXT_COLOR = "#dddddd";
const TABS = ["Gameplay", "Sound", "Controls", "Graphics"];

const ROW_WIDTH = 320;
const ROW_HEIGHT = 40;
const ROW_SPACING = 50;
const ROW_START_Y = 235;

const STEP_BUTTON_SIZE = 32;
const VOLUME_STEP = 0.1;

const BUTTON_STYLE = {
    font: "PressStart2P",
    size: 0.6,
    borderStrokeColor: GOLD,
    fillStyle: "#ffffff",
    hoverOffColor: GOLD_HOVER_OFF,
    hoverOnColor: GOLD_HOVER_ON,
};

class BackButton extends UIBaseElement {
    #background;
    #baseX;
    #baseY;
    #scaleState = { value: 1 };
    #tween;

    constructor(x, y) {
        super(x, y, BACK_WIDTH, BACK_HEIGHT);
        this.#baseX = x;
        this.#baseY = y;

        this.#background = new NineSliceSprite(BACK_WIDTH / 2, BACK_HEIGHT / 2, {
            image: getButtonAtlas(),
            region: "tab_default",
            width: BACK_WIDTH,
            height: BACK_HEIGHT,
            insetx: TAB_INSET_X,
            insety: TAB_INSET_Y,
        });
        this.#background.floating = false;
        this.addChild(this.#background, 0);

        const text = new Text(BACK_WIDTH / 2, BACK_HEIGHT / 2, {
            font: "sans-serif",
            size: 14,
            fillStyle: TAB_INACTIVE_TEXT_COLOR,
            textAlign: "center",
            textBaseline: "middle",
            text: "Back",
        });
        text.floating = false;
        this.addChild(text, 1);
    }

    onOver(event) {
        audio.play("button_hover", false, null, save.sfxVolume);
        this.#setRegion("tab_hover");
        this.#tweenScaleTo(TAB_HOVER_SCALE);
        return super.onOver(event);
    }

    onOut(event) {
        this.#setRegion("tab_default");
        this.#tweenScaleTo(1);
        return super.onOut(event);
    }

    onClick(event) {
        audio.play("button_select", false, null, save.sfxVolume);
        state.change(state.MENU);
        return false;
    }

    #setRegion(regionName) {
        this.removeChild(this.#background);
        this.#background = new NineSliceSprite(BACK_WIDTH / 2, BACK_HEIGHT / 2, {
            image: getButtonAtlas(),
            region: regionName,
            width: BACK_WIDTH,
            height: BACK_HEIGHT,
            insetx: TAB_INSET_X,
            insety: TAB_INSET_Y,
        });
        this.#background.floating = false;
        this.addChild(this.#background, 0);
    }

    #tweenScaleTo(target) {
        if (this.#tween) {
            this.#tween.stop();
        }
        this.#tween = new Tween(this.#scaleState)
            .to({ value: target }, { duration: TAB_TWEEN_DURATION, easing: Tween.Easing.Quadratic.Out })
            .onUpdate(() => {
                const s = this.#scaleState.value;
                this.currentTransform.identity();
                this.currentTransform.scale(s, s, 1);
                this.pos.x = this.#baseX - (BACK_WIDTH * (s - 1)) / 2;
                this.pos.y = this.#baseY - (BACK_HEIGHT * (s - 1)) / 2;
            })
            .start();
    }
}

class TabButton extends UIBaseElement {
    #isActive;
    #background;
    #onSelect;
    #baseX;
    #baseY;
    #scaleState = { value: 1 };
    #tween;

    constructor(x, y, label, isActive, onSelect) {
        super(x, y, TAB_WIDTH, TAB_HEIGHT);
        this.#isActive = isActive;
        this.#onSelect = onSelect;
        this.#baseX = x;
        this.#baseY = y;

        this.#background = new NineSliceSprite(TAB_WIDTH / 2, TAB_HEIGHT / 2, {
            image: getButtonAtlas(),
            region: isActive ? "tab_hover" : "tab_default",
            width: TAB_WIDTH,
            height: TAB_HEIGHT,
            insetx: TAB_INSET_X,
            insety: TAB_INSET_Y,
        });
        this.#background.floating = false;
        this.addChild(this.#background, 0);

        const text = new Text(TAB_WIDTH / 2, TAB_HEIGHT / 2, {
            font: "sans-serif",
            size: 14,
            fillStyle: isActive ? TAB_ACTIVE_TEXT_COLOR : TAB_INACTIVE_TEXT_COLOR,
            textAlign: "center",
            textBaseline: "middle",
            text: label,
        });
        text.floating = false;
        this.addChild(text, 1);
    }

    onOver(event) {
        audio.play("button_hover", false, null, save.sfxVolume);
        this.#setRegion("tab_hover");
        this.#tweenScaleTo(TAB_HOVER_SCALE);
        return super.onOver(event);
    }

    onOut(event) {
        this.#setRegion(this.#isActive ? "tab_hover" : "tab_default");
        this.#tweenScaleTo(1);
        return super.onOut(event);
    }

    onClick(event) {
        audio.play("button_select", false, null, save.sfxVolume);
        this.#onSelect();
        return false;
    }

    #setRegion(regionName) {
        this.removeChild(this.#background);
        this.#background = new NineSliceSprite(TAB_WIDTH / 2, TAB_HEIGHT / 2, {
            image: getButtonAtlas(),
            region: regionName,
            width: TAB_WIDTH,
            height: TAB_HEIGHT,
            insetx: TAB_INSET_X,
            insety: TAB_INSET_Y,
        });
        this.#background.floating = false;
        this.addChild(this.#background, 0);
    }

    #tweenScaleTo(target) {
        if (this.#tween) {
            this.#tween.stop();
        }
        this.#tween = new Tween(this.#scaleState)
            .to({ value: target }, { duration: TAB_TWEEN_DURATION, easing: Tween.Easing.Quadratic.Out })
            .onUpdate(() => {
                const s = this.#scaleState.value;

                this.currentTransform.identity();
                this.currentTransform.scale(s, s, 1);
                this.pos.x = this.#baseX - (TAB_WIDTH * (s - 1)) / 2;
                this.pos.y = this.#baseY - (TAB_HEIGHT * (s - 1)) / 2;
            })
            .start();
    }
}

class StepButton extends menuButton {
    constructor(x, y, label, onPress) {
        super(x, y, {
            font: "PressStart2P",
            text: label,
            size: 0.6,
            borderWidth: STEP_BUTTON_SIZE,
            borderHeight: ROW_HEIGHT,
            borderStrokeColor: GOLD,
            fillStyle: "#ffffff",
            hoverOffColor: GOLD_HOVER_OFF,
            hoverOnColor: GOLD_HOVER_ON,
        });
        this.onPress = onPress;
    }

    onAction() {
        this.onPress();
    }
}

const DEFAULT_KEY_BINDINGS = () => ({
    moveUp: input.KEY.W,
    moveDown: input.KEY.S,
    moveLeft: input.KEY.A,
    moveRight: input.KEY.D,
    interact: input.KEY.E,
});

class SettingsScreen extends responsiveStage {
    #activeTab = TABS[0];

    onResetEvent(app) {
        this.#activeTab = TABS[0];
        super.onResetEvent(app);
    }

    #selectTab(label) {
        this.#activeTab = label;
        this.refresh();
    }

    layout(app) {
        const { width, height } = app.viewport;

        this.addLayoutChild(new ColorLayer("background", BACKGROUND_COLOR), 0);

        addCornerOrnaments((child, z) => this.addLayoutChild(child, z), width, height);

        this.addLayoutChild(
            new NineSliceSprite(width / 2, TITLE_Y + TITLE_SHADOW_OFFSET_Y, {
                image: getButtonAtlas(),
                region: "title_plate_shadow",
                width: TITLE_PLATE_WIDTH + TITLE_SHADOW_PADDING * 2,
                height: TITLE_PLATE_HEIGHT + TITLE_SHADOW_PADDING * 2,
                insetx: TITLE_INSET_X,
                insety: TITLE_INSET_Y,
            }),
            1,
        );
        this.addLayoutChild(
            new NineSliceSprite(width / 2, TITLE_Y, {
                image: getButtonAtlas(),
                region: "title_plate",
                width: TITLE_PLATE_WIDTH,
                height: TITLE_PLATE_HEIGHT,
                insetx: TITLE_INSET_X,
                insety: TITLE_INSET_Y,
            }),
            2,
        );
        this.addLayoutChild(
            new Text(width / 2, TITLE_Y, {
                font: "sans-serif",
                size: 30,
                fillStyle: TITLE_TEXT_COLOR,
                textAlign: "center",
                textBaseline: "middle",
                text: "Settings",
            }),
            3,
        );

        this.addLayoutChild(new BackButton(MARGIN_X, height - BACK_HEIGHT - MARGIN_Y), 1);

        const totalTabWidth = TABS.length * TAB_WIDTH + (TABS.length - 1) * TAB_GAP;
        let tabX = (width - totalTabWidth) / 2;
        for (const label of TABS) {
            this.addLayoutChild(
                new TabButton(tabX, TAB_Y, label, label === this.#activeTab, () => this.#selectTab(label)),
                1,
            );
            tabX += TAB_WIDTH + TAB_GAP;
        }

        const rowX = (width - ROW_WIDTH) / 2;
        let y = ROW_START_Y;

        if (this.#activeTab === "Gameplay") {
            this.addLayoutChild(this.#toggleRow(rowX, y, "Screen Shake", "screenShake"), 1); y += ROW_SPACING;
            this.addLayoutChild(this.#toggleRow(rowX, y, "Damage Numbers", "damageNumbers"), 1); y += ROW_SPACING;
            this.addLayoutChild(new cycleButton(rowX, y, {
                ...BUTTON_STYLE,
                borderWidth: ROW_WIDTH,
                borderHeight: ROW_HEIGHT,
                label: "Difficulty",
                values: ["normal", "hard"],
                displayValues: ["Normal", "Hard"],
                get: () => save.difficulty,
                set: (v) => { save.difficulty = v; },
            }), 1);
        } else if (this.#activeTab === "Sound") {
            this.addLayoutChild(this.#toggleRow(rowX, y, "Mute All", "masterMuted", (muted) => {
                if (muted) {
                    audio.muteAll();
                } else {
                    audio.unmuteAll();
                }
            }), 1);
            y += ROW_SPACING;
            this.#volumeRow(rowX, y, "Music", "musicVolume");
            y += ROW_SPACING;
            this.#volumeRow(rowX, y, "SFX", "sfxVolume");
        } else if (this.#activeTab === "Controls") {
            const bindings = save.keyBindings ?? DEFAULT_KEY_BINDINGS();
            const controls = [
                ["Move Up", "moveUp"],
                ["Move Down", "moveDown"],
                ["Move Left", "moveLeft"],
                ["Move Right", "moveRight"],
                ["Interact", "interact"],
            ];
            for (const [label, action] of controls) {
                this.addLayoutChild(new keyBindButton(rowX, y, {
                    ...BUTTON_STYLE,
                    borderWidth: ROW_WIDTH,
                    borderHeight: ROW_HEIGHT,
                    label,
                    action,
                    keyCode: bindings[action],
                    onRebind: (newKeyCode) => {
                        save.keyBindings = { ...save.keyBindings, [action]: newKeyCode };
                    },
                }), 1);
                y += ROW_SPACING;
            }
        } else if (this.#activeTab === "Graphics") {
            this.addLayoutChild(new cycleButton(rowX, y, {
                ...BUTTON_STYLE,
                borderWidth: ROW_WIDTH,
                borderHeight: ROW_HEIGHT,
                label: "Fullscreen",
                values: [false, true],
                displayValues: ["Off", "On"],
                get: () => app.isFullscreen(),
                set: (v) => (v ? app.requestFullscreen() : app.exitFullscreen()),
            }), 1);
            y += ROW_SPACING;
            this.addLayoutChild(new cycleButton(rowX, y, {
                ...BUTTON_STYLE,
                borderWidth: ROW_WIDTH,
                borderHeight: ROW_HEIGHT,
                label: "Anti-Aliasing",
                values: [false, true],
                displayValues: ["Off", "On"],
                get: () => save.antiAliasing === true,
                set: (v) => {
                    save.antiAliasing = v;
                    app.renderer.setAntiAlias(v);
                },
            }), 1);
            y += ROW_SPACING;
            this.addLayoutChild(new cycleButton(rowX, y, {
                ...BUTTON_STYLE,
                borderWidth: ROW_WIDTH,
                borderHeight: ROW_HEIGHT,
                label: "Filtering",
                values: [false, true],
                displayValues: ["Smooth", "Pixelated"],
                get: () => save.pixelPerfect === true,
                set: (v) => {
                    save.pixelPerfect = v;
                    app.renderer.setTextureFilter(v ? "nearest" : "linear");
                },
            }), 1);
            y += ROW_SPACING;
            this.addLayoutChild(new Text(rowX + ROW_WIDTH / 2, y + ROW_HEIGHT / 2, {
                font: "sans-serif",
                size: 13,
                fillStyle: "#777777",
                textAlign: "center",
                textBaseline: "middle",
                text: `Renderer: ${app.renderer.type}`,
            }), 1);
        }
    }

    #toggleRow(x, y, label, saveKey, onChange) {
        return new cycleButton(x, y, {
            ...BUTTON_STYLE,
            borderWidth: ROW_WIDTH,
            borderHeight: ROW_HEIGHT,
            label,
            values: [true, false],
            displayValues: ["On", "Off"],
            get: () => save[saveKey] === true,
            set: (v) => {
                save[saveKey] = v;
                onChange?.(v);
            },
        });
    }

    #volumeRow(x, y, label, saveKey) {
        const format = () => `${label}: ${Math.round(save[saveKey] * 100)}%`;
        const clamp = (v) => Math.min(1, Math.max(0, Math.round(v * 10) / 10));

        const valueText = new Text(x + ROW_WIDTH / 2, y + ROW_HEIGHT / 2, {
            font: "sans-serif",
            size: 14,
            fillStyle: "#ffffff",
            textAlign: "center",
            textBaseline: "middle",
            text: format(),
        });

        const applyDelta = (delta) => {
            save[saveKey] = clamp(save[saveKey] + delta);
            valueText.setText(format());
        };

        this.addLayoutChild(new StepButton(x, y, "-", () => applyDelta(-VOLUME_STEP)), 1);
        this.addLayoutChild(valueText, 1);
        this.addLayoutChild(new StepButton(x + ROW_WIDTH - STEP_BUTTON_SIZE, y, "+", () => applyDelta(VOLUME_STEP)), 1);
    }
}

export default SettingsScreen;
