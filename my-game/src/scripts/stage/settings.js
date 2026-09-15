import { ColorLayer, Text, Sprite, NineSliceSprite, UIBaseElement, Tween, save, state, audio, input } from "melonjs";
import responsiveStage from "./responsiveStage";
import menuButton from "../ui/menu";
import cycleButton from "../ui/cycleButton";
import keyBindButton from "../ui/keybind";
import { getButtonAtlas, getBannerAtlas } from "../ui/atlas";
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
const CLICK_SOUND_COOLDOWN_MS = 400;
const TAB_ACTIVE_TEXT_COLOR = "#4a2e18";
const TAB_INACTIVE_TEXT_COLOR = "#dddddd";
const TABS = ["Gameplay", "Sound", "Controls", "Graphics"];

const ROW_WIDTH = 320;
const ROW_HEIGHT = 40;
const ROW_SPACING = 50;
const ROW_START_Y = 235;

const PANEL_PADDING_X = 30;
const PANEL_PADDING_Y = 4;
const PANEL_WIDTH = ROW_WIDTH + PANEL_PADDING_X * 2;
const PANEL_HEIGHT = 4 * ROW_SPACING + ROW_HEIGHT + PANEL_PADDING_Y * 2;
const PANEL_Y = ROW_START_Y - PANEL_PADDING_Y;

const STEP_BUTTON_SIZE = 32;
const VOLUME_STEP = 0.1;
const DIVIDER_WIDTH = ROW_WIDTH - 60;

const RESET_WIDTH = 90;
const RESET_HEIGHT = 24;
const RESET_MARGIN = 10;
const RESET_Y = PANEL_Y + PANEL_HEIGHT + RESET_MARGIN;

class actionButton extends UIBaseElement {
    #background;
    #baseX;
    #baseY;
    #width;
    #height;
    #onAction;
    #scaleState = { value: 1 };
    #tween;
    #lastClickTime = -Infinity;

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
            insetx: TAB_INSET_X,
            insety: TAB_INSET_Y,
        });
        this.#background.floating = false;
        this.addChild(this.#background, 0);

        const label = new Text(width / 2, height / 2, {
            font: "sans-serif",
            size: 14,
            fillStyle: TAB_INACTIVE_TEXT_COLOR,
            textAlign: "center",
            textBaseline: "middle",
            text,
        });
        label.floating = false;
        this.addChild(label, 1);
    }

    onOver(event) {
        if (performance.now() - this.#lastClickTime > CLICK_SOUND_COOLDOWN_MS) {
            audio.play("button_hover", false, null, save.sfxVolume);
        }
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
        this.#lastClickTime = performance.now();
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
                this.pos.x = this.#baseX - (this.#width * (s - 1)) / 2;
                this.pos.y = this.#baseY - (this.#height * (s - 1)) / 2;
            })
            .start();
    }
}

class TabButton extends UIBaseElement {
    #isActive;
    #background;
    #text;
    #label;
    #onSelect;
    #baseX;
    #baseY;
    #scaleState = { value: 1 };
    #tween;
    #hovering = false;
    #lastClickTime = -Infinity;

    constructor(x, y, label, isActive, onSelect) {
        super(x, y, TAB_WIDTH, TAB_HEIGHT);
        this.#isActive = isActive;
        this.#label = label;
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

        this.#text = new Text(TAB_WIDTH / 2, TAB_HEIGHT / 2, {
            font: "sans-serif",
            size: 14,
            fillStyle: isActive ? TAB_ACTIVE_TEXT_COLOR : TAB_INACTIVE_TEXT_COLOR,
            textAlign: "center",
            textBaseline: "middle",
            text: label,
        });
        this.#text.floating = false;
        this.addChild(this.#text, 1);
    }

    get label() {
        return this.#label;
    }

    setActive(isActive) {
        if (this.#isActive === isActive) {
            return;
        }
        this.#isActive = isActive;
        if (!this.#hovering) {
            this.#setRegion(isActive ? "tab_hover" : "tab_default");
        }
        this.removeChild(this.#text);
        this.#text = new Text(TAB_WIDTH / 2, TAB_HEIGHT / 2, {
            font: "sans-serif",
            size: 14,
            fillStyle: isActive ? TAB_ACTIVE_TEXT_COLOR : TAB_INACTIVE_TEXT_COLOR,
            textAlign: "center",
            textBaseline: "middle",
            text: this.#label,
        });
        this.#text.floating = false;
        this.addChild(this.#text, 1);
    }

    onOver(event) {
        if (!this.#hovering) {
            this.#hovering = true;
            if (performance.now() - this.#lastClickTime > CLICK_SOUND_COOLDOWN_MS) {
                audio.play("button_hover", false, null, save.sfxVolume);
            }
        }
        this.#setRegion("tab_hover");
        this.#tweenScaleTo(TAB_HOVER_SCALE);
        return super.onOver(event);
    }

    onOut(event) {
        this.#hovering = false;
        this.#setRegion(this.#isActive ? "tab_hover" : "tab_default");
        this.#tweenScaleTo(1);
        return super.onOut(event);
    }

    onClick(event) {
        this.#lastClickTime = performance.now();
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
    #app;
    #tabButtons = [];
    #contentChildren = [];

    onResetEvent(app) {
        this.#activeTab = TABS[0];
        super.onResetEvent(app);
    }

    #selectTab(label) {
        if (this.#activeTab === label) {
            return;
        }
        this.#activeTab = label;

        for (const tab of this.#tabButtons) {
            tab.setActive(tab.label === label);
        }
        this.#rebuildContent();
    }

    layout(app) {
        this.#app = app;
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

        this.addLayoutChild(
            new actionButton(MARGIN_X, height - BACK_HEIGHT - MARGIN_Y, BACK_WIDTH, BACK_HEIGHT, "Back", () => state.change(state.MENU)),
            1,
        );

        const totalTabWidth = TABS.length * TAB_WIDTH + (TABS.length - 1) * TAB_GAP;
        let tabX = (width - totalTabWidth) / 2;
        this.#tabButtons = [];
        for (const label of TABS) {
            const tab = new TabButton(tabX, TAB_Y, label, label === this.#activeTab, () => this.#selectTab(label));
            this.addLayoutChild(tab, 1);
            this.#tabButtons.push(tab);
            tabX += TAB_WIDTH + TAB_GAP;
        }

        this.#rebuildContent();
    }

    #rebuildContent() {
        const app = this.#app;
        for (const child of this.#contentChildren) {
            app.world.removeChildNow(child);
        }
        this.#contentChildren = [];

        const addContent = (child, z) => {
            app.world.addChild(child, z);
            this.#contentChildren.push(child);
        };

        const { width } = app.viewport;
        const panelX = (width - PANEL_WIDTH) / 2;

        const panel = new Sprite(panelX + PANEL_WIDTH / 2, PANEL_Y + PANEL_HEIGHT / 2, {
            image: getButtonAtlas(),
            region: "solid_fill",
        });
        panel.scale(PANEL_WIDTH, PANEL_HEIGHT);
        panel.floating = false;
        addContent(panel, 1);

        const rowX = (width - ROW_WIDTH) / 2;
        let y = ROW_START_Y;

        if (this.#activeTab === "Gameplay") {
            addContent(this.#toggleRow(rowX, y, "Screen Shake", "screenShake"), 2); y += ROW_SPACING;
            this.#divider(addContent, rowX + ROW_WIDTH / 2, y - 5);
            addContent(this.#toggleRow(rowX, y, "Damage Numbers", "damageNumbers"), 2); y += ROW_SPACING;
            this.#divider(addContent, rowX + ROW_WIDTH / 2, y - 5);
            addContent(new cycleButton(rowX, y, {
                width: ROW_WIDTH,
                height: ROW_HEIGHT,
                label: "Difficulty",
                values: ["normal", "hard"],
                displayValues: ["Normal", "Hard"],
                get: () => save.difficulty,
                set: (v) => { save.difficulty = v; },
            }), 2);
        } else if (this.#activeTab === "Sound") {
            addContent(this.#toggleRow(rowX, y, "Mute All", "masterMuted", (muted) => {
                if (muted) {
                    audio.muteAll();
                } else {
                    audio.unmuteAll();
                }
            }), 2);
            y += ROW_SPACING;
            this.#divider(addContent, rowX + ROW_WIDTH / 2, y - 5);
            this.#volumeRow(addContent, rowX, y, "Music", "musicVolume");
            y += ROW_SPACING;
            this.#divider(addContent, rowX + ROW_WIDTH / 2, y - 5);
            this.#volumeRow(addContent, rowX, y, "SFX", "sfxVolume");
        } else if (this.#activeTab === "Controls") {
            addContent(
                new actionButton(panelX + RESET_MARGIN, RESET_Y, RESET_WIDTH, RESET_HEIGHT, "Reset", () => this.#resetControls()),
                2,
            );

            const bindings = save.keyBindings ?? DEFAULT_KEY_BINDINGS();
            const controls = [
                ["Move Up", "moveUp"],
                ["Move Down", "moveDown"],
                ["Move Left", "moveLeft"],
                ["Move Right", "moveRight"],
                ["Interact", "interact"],
            ];
            for (const [label, action] of controls) {
                addContent(new keyBindButton(rowX, y, {
                    width: ROW_WIDTH,
                    height: ROW_HEIGHT,
                    label,
                    action,
                    keyCode: bindings[action],
                    onRebind: (newKeyCode) => {
                        save.keyBindings = { ...save.keyBindings, [action]: newKeyCode };
                    },
                }), 2);
                y += ROW_SPACING;
                if (action !== controls[controls.length - 1][1]) {
                    this.#divider(addContent, rowX + ROW_WIDTH / 2, y - 5);
                }
            }
        } else if (this.#activeTab === "Graphics") {
            addContent(new cycleButton(rowX, y, {
                width: ROW_WIDTH,
                height: ROW_HEIGHT,
                label: "Fullscreen",
                values: [false, true],
                displayValues: ["Off", "On"],
                get: () => app.isFullscreen(),
                set: (v) => (v ? app.requestFullscreen() : app.exitFullscreen()),
            }), 2);
            y += ROW_SPACING;
            this.#divider(addContent, rowX + ROW_WIDTH / 2, y - 5);
            addContent(new cycleButton(rowX, y, {
                width: ROW_WIDTH,
                height: ROW_HEIGHT,
                label: "Anti-Aliasing",
                values: [false, true],
                displayValues: ["Off", "On"],
                get: () => save.antiAliasing === true,
                set: (v) => {
                    save.antiAliasing = v;
                    app.renderer.setAntiAlias(v);
                },
            }), 2);
            y += ROW_SPACING;
            this.#divider(addContent, rowX + ROW_WIDTH / 2, y - 5);
            addContent(new cycleButton(rowX, y, {
                width: ROW_WIDTH,
                height: ROW_HEIGHT,
                label: "Filtering",
                values: [false, true],
                displayValues: ["Smooth", "Pixelated"],
                get: () => save.pixelPerfect === true,
                set: (v) => {
                    save.pixelPerfect = v;
                    app.renderer.setTextureFilter(v ? "nearest" : "linear");
                },
            }), 2);
            y += ROW_SPACING;
            addContent(new Text(rowX + ROW_WIDTH / 2, y + ROW_HEIGHT / 2, {
                font: "sans-serif",
                size: 13,
                fillStyle: "#777777",
                textAlign: "center",
                textBaseline: "middle",
                text: `Renderer: ${app.renderer.type}`,
            }), 2);
        }
    }

    #resetControls() {
        const current = save.keyBindings ?? DEFAULT_KEY_BINDINGS();
        const defaults = DEFAULT_KEY_BINDINGS();
        
        for (const action of Object.keys(defaults)) {
            input.unbindKey(current[action]);
            input.bindKey(defaults[action], action);
        }
        save.keyBindings = defaults;
        this.#rebuildContent();
    }

    #divider(addContent, centerX, y) {
        const line = new Sprite(centerX, y, {
            image: getBannerAtlas(),
            region: "divider_pixel",
        });
        line.scale(DIVIDER_WIDTH, 2);
        line.floating = false;
        addContent(line, 2);
    }

    #toggleRow(x, y, label, saveKey, onChange) {
        return new cycleButton(x, y, {
            width: ROW_WIDTH,
            height: ROW_HEIGHT,
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

    #volumeRow(addContent, x, y, label, saveKey) {
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

        addContent(new StepButton(x, y, "-", () => applyDelta(-VOLUME_STEP)), 2);
        addContent(valueText, 2);
        addContent(new StepButton(x + ROW_WIDTH - STEP_BUTTON_SIZE, y, "+", () => applyDelta(VOLUME_STEP)), 2);
    }
}

export default SettingsScreen;
