import { ColorLayer, state, input } from "melonjs";
import responsiveStage from "./responsiveStage";
import statBar from "../ui/statBar";
import { buildMinimap } from "../ui/miniMap";
import { buildGearBox } from "../ui/gearBox";
import { buildPauseOverlay } from "../ui/pause";
import { navigation } from "../navigation";
import { equipped } from "../equipment";
import { SLOT_CATEGORY } from "../items";
import { ALL_CATEGORY } from "../ui/inventory";

const MARGIN = 20;

const BAR_WIDTH = 220;
const BAR_HEIGHT = 18;
const BAR_GAP = 6;

class PlayScreen extends responsiveStage {
    #paused = false;
    #inventoryOpen = false;
    #inventoryCategory = ALL_CATEGORY;
    #inventoryLockedSlot = null; // which equip slot triggered the inventory, if any
    #onKeyDown = (event) => {
        if (event.keyCode === input.KEY.ESC) {
            if (this.#inventoryOpen) {
                this.#closeInventory();
            } else {
                this.#togglePause();
            }
        }
    };

    /**
     * @param {import("melonjs").Application} app
     */
    onResetEvent(app) {
        this.#paused = navigation.returnPaused;
        navigation.returnPaused = false;
        super.onResetEvent(app); // builds the layout below + resize handling
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
        this.refresh();
    }

    #closeInventory() {
        this.#inventoryOpen = false;
        this.#inventoryLockedSlot = null;
        this.refresh();
    }

    #onSlotClick(slotKey) {
        this.#inventoryLockedSlot = slotKey;
        this.#inventoryOpen = true;
        this.#inventoryCategory = ALL_CATEGORY;
    }

    #onSelectItem(itemId) {
        if (this.#inventoryLockedSlot) {
            equipped[this.#inventoryLockedSlot] = itemId;
        }
        this.#closeInventory();
    }

    layout(app) {
        const { width, height } = app.viewport;
        const addChild = (child, z) => this.addLayoutChild(child, z);

        // TODO: replace with the guild hub / quest level once it's built
        this.addLayoutChild(new ColorLayer("background", "#202020"), 0);

        buildMinimap(addChild, width);
        this.#buildStatBars(height);

        buildGearBox(addChild, width, height, {
            inventoryOpen: this.#inventoryOpen,
            equipped,
            inventoryCategory: this.#inventoryCategory,
            lockedCategory: this.#inventoryLockedSlot ? SLOT_CATEGORY[this.#inventoryLockedSlot] : null,
            onToggleInventory: () => this.#toggleInventory(),
            onSlotClick: (slotKey) => this.#onSlotClick(slotKey),
            onSelectCategory: (category) => {
                this.#inventoryCategory = category;
                this.refresh();
            },
            onSelectItem: (itemId) => this.#onSelectItem(itemId),
        });

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

    #buildStatBars(height) {
        const hpY = height - MARGIN - BAR_HEIGHT * 2 - BAR_GAP;
        const mpY = height - MARGIN - BAR_HEIGHT;

        // TODO: wire these up to real player stats -- constructor
        // defaults to full, since there's no player/HP/MP data yet
        const hpBar = new statBar(MARGIN, hpY, BAR_WIDTH, BAR_HEIGHT, "bar_fill_hp");
        this.addLayoutChild(hpBar, 1);

        const mpBar = new statBar(MARGIN, mpY, BAR_WIDTH, BAR_HEIGHT, "bar_fill_mp");
        this.addLayoutChild(mpBar, 1);
    }
}

export default PlayScreen;
