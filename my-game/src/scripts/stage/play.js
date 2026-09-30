import { state, input, level } from "melonjs";
import responsiveStage from "./responsiveStage";
import statBar from "../ui/statBar";
import { buildMinimap } from "../ui/miniMap";
import { buildGearBoxChrome, buildGearBoxContent } from "../ui/gearBox";
import { buildPauseOverlay } from "../ui/pause";
import { navigation } from "../navigation";
import { equipped } from "../equipment";
import { SLOT_CATEGORY } from "../items";
import { ALL_CATEGORY } from "../ui/inventory";

const MARGIN = 20;

const BAR_WIDTH = 220;
const BAR_HEIGHT = 18;
const BAR_GAP = 6;

const HUD_Z_BASE = 1000;

class PlayScreen extends responsiveStage {
    #paused = false;
    #inventoryOpen = false;
    #inventoryCategory = ALL_CATEGORY;
    #inventoryLockedSlot = null;
    #app;
    #gearBoxChrome;
    #gearBoxChildren = [];
    #levelLoaded = false;
    #onKeyDown = (event) => {
        if (event.keyCode === input.KEY.ESC) {
            if (this.#inventoryOpen) {
                this.#closeInventory();
            } else {
                this.#togglePause();
            }
        }
    };

    onResetEvent(app) {
        this.#paused = navigation.returnPaused;
        navigation.returnPaused = false;
        this.#levelLoaded = false;
        super.onResetEvent(app);
        window.addEventListener("keydown", this.#onKeyDown);
    }

    onDestroyEvent(app) {
        super.onDestroyEvent(app);
        window.removeEventListener("keydown", this.#onKeyDown);
    }

    #togglePause() {
        this.#paused = !this.#paused;
        this.refresh();
    }

    #toggleInventory() {
        this.#inventoryOpen = !this.#inventoryOpen;
        this.#inventoryLockedSlot = null;
        if (this.#inventoryOpen) {
            this.#inventoryCategory = ALL_CATEGORY;
        }
        this.#rebuildGearBoxContent();
    }

    #closeInventory() {
        this.#inventoryOpen = false;
        this.#inventoryLockedSlot = null;
        this.#rebuildGearBoxContent();
    }

    #onSlotClick(slotKey) {
        this.#inventoryLockedSlot = slotKey;
        this.#inventoryOpen = true;
        this.#inventoryCategory = ALL_CATEGORY;
        this.#rebuildGearBoxContent();
    }

    #onSelectItem(itemId) {
        if (this.#inventoryLockedSlot) {
            equipped[this.#inventoryLockedSlot] = itemId;
        }
        this.#closeInventory();
    }

    layout(app) {
        this.#app = app;
        const { width, height } = app.viewport;
        const addChild = (child, z) => {
            child.floating = true;
            this.addLayoutChild(child, HUD_Z_BASE + z);
        };

        if (!this.#levelLoaded) {
            // TODO: replace with the guild hub / full world map once
            // that exists -- this is the standalone tutorial area for now
            level.load("Tutorial_area");
            this.#levelLoaded = true;
        }

        buildMinimap(addChild, width);
        this.#buildStatBars(height);

        this.#gearBoxChrome = buildGearBoxChrome(addChild, width, height, () => this.#toggleInventory());
        this.#rebuildGearBoxContent();

        if (this.#paused) {
            buildPauseOverlay(
                addChild,
                width,
                height,
                () => this.#togglePause(),
                () => {
                    navigation.returnState = state.PLAY;
                    navigation.returnPaused = true;
                    state.change(state.SETTINGS);
                },
                () => state.change(state.MENU),
            );
        }
    }

    #rebuildGearBoxContent() {
        const app = this.#app;
        for (const child of this.#gearBoxChildren) {
            app.world.removeChildNow(child);
        }
        this.#gearBoxChildren = [];

        const addChild = (child, z) => {
            child.floating = true; 
            app.world.addChild(child, HUD_Z_BASE + z);
            this.#gearBoxChildren.push(child);
        };

        this.#gearBoxChrome.titleText.setText(this.#inventoryOpen ? "Inventory" : "Gear");
        this.#gearBoxChrome.invButton.setText(this.#inventoryOpen ? "Back" : "Inv");

        const { width, height } = app.viewport;
        buildGearBoxContent(addChild, width, height, {
            inventoryOpen: this.#inventoryOpen,
            equipped,
            inventoryCategory: this.#inventoryCategory,
            lockedCategory: this.#inventoryLockedSlot ? SLOT_CATEGORY[this.#inventoryLockedSlot] : null,
            onSlotClick: (slotKey) => this.#onSlotClick(slotKey),
            onSelectCategory: (category) => {
                this.#inventoryCategory = category;
                this.#rebuildGearBoxContent();
            },
            onSelectItem: (itemId) => this.#onSelectItem(itemId),
        }, this.#gearBoxChrome);
    }

    #buildStatBars(height) {
        const hpY = height - MARGIN - BAR_HEIGHT * 2 - BAR_GAP;
        const mpY = height - MARGIN - BAR_HEIGHT;

        // TODO: wire these up to real player stats -- constructor
        // defaults to full, since there's no player/HP/MP data yet
        const hpBar = new statBar(MARGIN, hpY, BAR_WIDTH, BAR_HEIGHT, "bar_fill_hp");
        hpBar.floating = true;
        this.addLayoutChild(hpBar, HUD_Z_BASE + 1);

        const mpBar = new statBar(MARGIN, mpY, BAR_WIDTH, BAR_HEIGHT, "bar_fill_mp");
        mpBar.floating = true;
        this.addLayoutChild(mpBar, HUD_Z_BASE + 1);
    }
}

export default PlayScreen;
