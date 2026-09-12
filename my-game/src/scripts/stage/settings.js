import { Stage, ColorLayer, Text, save, state, audio, input } from "melonjs";
import MenuButton from "../ui/menubutton";
import CycleButton from "../ui/cyclebutton";
import KeyBindButton from "../ui/keybindbutton";

const BACKGROUND_COLOR = "#0d1420";

const GOLD = "#c9a86a";
const GOLD_HOVER_OFF = "rgba(201, 168, 106, 0.15)";
const GOLD_HOVER_ON = "rgba(201, 168, 106, 0.35)";

const TAB_ACTIVE_BORDER = "#e9cf9a";
const TAB_ACTIVE_FILL = "#ffffff";
const TAB_INACTIVE_BORDER = "#5a4d38";
const TAB_INACTIVE_FILL = "#8a8a8a";

const MARGIN = 20;
const BACK_WIDTH = 140;
const BACK_HEIGHT = 36;

const TAB_WIDTH = 150;
const TAB_HEIGHT = 34;
const TAB_Y = 140;
const TAB_GAP = 10;
const TABS = ["Gameplay", "Sound", "Controls", "Graphics"];

const ROW_WIDTH = 320;
const ROW_HEIGHT = 40;
const ROW_SPACING = 50;
const ROW_START_Y = 210;

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

class BackButton extends MenuButton {
    constructor(x, y) {
        super(x, y, {
            font: "PressStart2P",
            text: "Back",
            size: 0.7,
            borderWidth: BACK_WIDTH,
            borderHeight: BACK_HEIGHT,
            borderStrokeColor: GOLD,
            fillStyle: "#ffffff",
            hoverOffColor: GOLD_HOVER_OFF,
            hoverOnColor: GOLD_HOVER_ON,
        });
    }

    onAction() {
        state.change(state.MENU);
    }
}

class TabButton extends MenuButton {
    constructor(x, y, label, isActive, onSelect) {
        super(x, y, {
            font: "PressStart2P",
            text: label,
            size: 0.55,
            borderWidth: TAB_WIDTH,
            borderHeight: TAB_HEIGHT,
            borderStrokeColor: isActive ? TAB_ACTIVE_BORDER : TAB_INACTIVE_BORDER,
            fillStyle: isActive ? TAB_ACTIVE_FILL : TAB_INACTIVE_FILL,
            hoverOffColor: GOLD_HOVER_OFF,
            hoverOnColor: GOLD_HOVER_ON,
        });
        this.onSelect = onSelect;
    }

    onAction() {
        this.onSelect();
    }
}

class StepButton extends MenuButton {
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

class SettingsScreen extends Stage {
    #app;
    #activeTab = TABS[0];
    #contentChildren = [];

    /**
     * @param {import("melonjs").Application} app
     */
    onResetEvent(app) {
        this.#app = app;
        this.#activeTab = TABS[0];
        const { width, height } = app.viewport;

        app.world.addChild(new ColorLayer("background", BACKGROUND_COLOR), 0);

        app.world.addChild(
            new Text(width / 2, 70, {
                font: "sans-serif",
                size: 30,
                fillStyle: GOLD,
                textAlign: "center",
                textBaseline: "middle",
                text: "Settings",
            }),
            1,
        );

        app.world.addChild(new BackButton(MARGIN, height - BACK_HEIGHT - MARGIN), 1);

        this.#buildContent();
    }

    #selectTab(label) {
        this.#activeTab = label;
        this.#buildContent();
    }

    // (re)builds the tab bar plus the active tab's rows. Called on first
    // load and every time the player switches tabs -- simplest way to
    // keep tab highlighting and row content in sync without needing to
    // mutate already-built UITextButton instances in place.
    #buildContent() {
        const app = this.#app;
        this.#contentChildren.forEach((child) => app.world.removeChildNow(child));
        this.#contentChildren = [];

        const { width } = app.viewport;

        const addRow = (renderable) => {
            app.world.addChild(renderable, 1);
            this.#contentChildren.push(renderable);
        };

        const totalTabWidth = TABS.length * TAB_WIDTH + (TABS.length - 1) * TAB_GAP;
        let tabX = (width - totalTabWidth) / 2;
        for (const label of TABS) {
            addRow(new TabButton(tabX, TAB_Y, label, label === this.#activeTab, () => this.#selectTab(label)));
            tabX += TAB_WIDTH + TAB_GAP;
        }

        const rowX = (width - ROW_WIDTH) / 2;
        let y = ROW_START_Y;

        if (this.#activeTab === "Gameplay") {
            addRow(this.#toggleRow(rowX, y, "Screen Shake", "screenShake")); y += ROW_SPACING;
            addRow(this.#toggleRow(rowX, y, "Damage Numbers", "damageNumbers")); y += ROW_SPACING;
            addRow(new CycleButton(rowX, y, {
                ...BUTTON_STYLE,
                borderWidth: ROW_WIDTH,
                borderHeight: ROW_HEIGHT,
                label: "Difficulty",
                values: ["normal", "hard"],
                displayValues: ["Normal", "Hard"],
                get: () => save.difficulty,
                set: (v) => { save.difficulty = v; },
            }));
        } else if (this.#activeTab === "Sound") {
            addRow(this.#toggleRow(rowX, y, "Mute All", "masterMuted", (muted) => {
                if (muted) {
                    audio.muteAll();
                } else {
                    audio.unmuteAll();
                }
            }));
            y += ROW_SPACING;
            this.#volumeRow(addRow, rowX, y, "Music", "musicVolume");
            y += ROW_SPACING;
            this.#volumeRow(addRow, rowX, y, "SFX", "sfxVolume");
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
                addRow(new KeyBindButton(rowX, y, {
                    ...BUTTON_STYLE,
                    borderWidth: ROW_WIDTH,
                    borderHeight: ROW_HEIGHT,
                    label,
                    action,
                    keyCode: bindings[action],
                    onRebind: (newKeyCode) => {
                        save.keyBindings = { ...save.keyBindings, [action]: newKeyCode };
                    },
                }));
                y += ROW_SPACING;
            }
        } else if (this.#activeTab === "Graphics") {
            addRow(new CycleButton(rowX, y, {
                ...BUTTON_STYLE,
                borderWidth: ROW_WIDTH,
                borderHeight: ROW_HEIGHT,
                label: "Fullscreen",
                values: [false, true],
                displayValues: ["Off", "On"],
                get: () => app.isFullscreen(),
                set: (v) => (v ? app.requestFullscreen() : app.exitFullscreen()),
            }));
            y += ROW_SPACING;
            addRow(new CycleButton(rowX, y, {
                ...BUTTON_STYLE,
                borderWidth: ROW_WIDTH,
                borderHeight: ROW_HEIGHT,
                label: "Filtering",
                values: [false, true],
                displayValues: ["Smooth", "Pixelated"],
                get: () => save.pixelPerfect === true,
                set: (v) => {
                    save.pixelPerfect = v;
                    app.renderer.setTextureFilter(v ? "nearest" : "auto");
                },
            }));
            y += ROW_SPACING;
            addRow(new Text(rowX + ROW_WIDTH / 2, y + ROW_HEIGHT / 2, {
                font: "sans-serif",
                size: 13,
                fillStyle: "#777777",
                textAlign: "center",
                textBaseline: "middle",
                text: `Renderer: ${app.renderer.type}`,
            }));
        }
    }

    #toggleRow(x, y, label, saveKey, onChange) {
        return new CycleButton(x, y, {
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

    #volumeRow(addRow, x, y, label, saveKey) {
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

        addRow(new StepButton(x, y, "-", () => applyDelta(-VOLUME_STEP)));
        addRow(valueText);
        addRow(new StepButton(x + ROW_WIDTH - STEP_BUTTON_SIZE, y, "+", () => applyDelta(VOLUME_STEP)));
    }
}

export default SettingsScreen;
