import { state, input, level, event, save } from "melonjs";
import responsiveStage from "./responsiveStage";
import statBar from "../ui/statBar";
import PlayerEntity from "../renderables/player";
import CollisionDebugOverlay from "../renderables/collisionDebug";
import { buildMinimap } from "../ui/miniMap";
import { buildGearBoxChrome, buildGearBoxContent } from "../ui/gearBox";
import { buildPauseOverlay } from "../ui/pause";
import { buildQuestHud } from "../ui/questHud";
import { quests, QUEST_EVENT, QUEST_STATUS } from "../quests/questSystem";
import { TUTORIAL_QUEST_ID } from "../quests/tutorialQuest";
import QuestZone, { QuestTicker } from "../quests/questZone";
import DepthZone from "../renderables/depthZone";
import { inFrontOfTree, readDepthZone } from "../depthSort";
import { createQuestTriggers, readZone } from "../quests/questTriggers";
import { createKeyNamer, formatHint, trackerSummary } from "../quests/questText";
import { navigation } from "../navigation";
import { equipped } from "../equipment";
import { SLOT_CATEGORY } from "../items";
import { ALL_CATEGORY } from "../ui/inventory";

const MARGIN = 20;

const BAR_WIDTH = 220;
const BAR_HEIGHT = 18;
const BAR_GAP = 6;

const HUD_Z_BASE = 1000;

const MAP_LAYER_Z = { trees: 30, "trees base": 17.5 };

const PLAYER_Z = 20;
const PLAYER_Z_IN_FRONT = 31;

const MESSAGE_MS = 6000;

const QUEST_HUD_EVENTS = [
    QUEST_EVENT.STARTED,
    QUEST_EVENT.OBJECTIVE_UPDATED,
    QUEST_EVENT.OBJECTIVE_COMPLETED,
    QUEST_EVENT.READY,
    QUEST_EVENT.COMPLETED,
    QUEST_EVENT.TRACKED,
    QUEST_EVENT.RESET,
];

function refreshAbsoluteBounds(container) {
    container.forEach((child) => {
        child.updateBounds(true);
        if (typeof child.forEach === "function") {
            refreshAbsoluteBounds(child);
        }
    });
}

class PlayScreen extends responsiveStage {
    #paused = false;
    #inventoryOpen = false;
    #inventoryCategory = ALL_CATEGORY;
    #inventoryLockedSlot = null;
    #app;
    #gearBoxChrome; 
    #gearBoxChildren = []; 
    #levelLoaded = false; 
    #player = null;
    #depthZones = []; 
    #playerInFront = false; 
    #loadingLevel = false; 

    // --- quests ---
    #questHud = null; 
    #triggers = null; 
    #interactZone = null; 
    #hint = ""; 
    #message = null; 
    #keyName = createKeyNamer(input.KEY);
    #onQuestChanged = () => this.#syncQuestHud();
    #onQuestStepChanged = () => this.#triggers?.rearm();
    #onQuestCompleted = ({ quest }) => this.#showMessage(`Quest complete: ${quest.title}`);
    #onViewportResize = () => this.#fitWorldToViewport();
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
        this.#questHud = null;
        this.#interactZone = null;
        this.#hint = "";
        this.#message = null;
        this.#triggers = createQuestTriggers({
            quests,
            isDown: (action) => input.keyStatus(action),
            onInteract: (zone) => {
                if (zone.message) {
                    this.#showMessage(zone.message);
                }
            },
        });
        super.onResetEvent(app);
        window.addEventListener("keydown", this.#onKeyDown);
        QUEST_HUD_EVENTS.forEach((name) => event.on(name, this.#onQuestChanged));
        event.on(QUEST_EVENT.STARTED, this.#onQuestStepChanged);
        event.on(QUEST_EVENT.OBJECTIVE_COMPLETED, this.#onQuestStepChanged);
        event.on(QUEST_EVENT.COMPLETED, this.#onQuestCompleted);
    }

    onDestroyEvent(app) {
        event.off(event.VIEWPORT_ONRESIZE, this.#onViewportResize);
        super.onDestroyEvent(app); 
        window.removeEventListener("keydown", this.#onKeyDown);
        QUEST_HUD_EVENTS.forEach((name) => event.off(name, this.#onQuestChanged));
        event.off(QUEST_EVENT.STARTED, this.#onQuestStepChanged);
        event.off(QUEST_EVENT.OBJECTIVE_COMPLETED, this.#onQuestStepChanged);
        event.off(QUEST_EVENT.COMPLETED, this.#onQuestCompleted);
        this.#triggers = null;
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
            this.#levelLoaded = true;
            this.#loadingLevel = true;
            try {
                level.load("Tutorial_area", { setViewportBounds: false, onLoaded: () => this.#onLevelLoaded(app) });
            } finally {
                this.#loadingLevel = false;
            }
        }

        buildMinimap(addChild, width, this.#player, level.getCurrentLevel()?.getBounds());
        this.#buildStatBars(height);

        this.#gearBoxChrome = buildGearBoxChrome(addChild, width, height, () => this.#toggleInventory());
        this.#rebuildGearBoxContent();

        this.#questHud = buildQuestHud(addChild, width, height);
        this.#syncQuestHud();

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

    #onLevelLoaded(app) {
        this.#fitWorldToViewport();
        event.off(event.VIEWPORT_ONRESIZE, this.#onViewportResize); 
        event.on(event.VIEWPORT_ONRESIZE, this.#onViewportResize);
        this.#spawnPlayer(app);
        this.#applyLayerDepths(app);
        this.#setUpDepth(app);
        this.#setUpQuests(app);
    
        if (!this.#loadingLevel) {
            this.refresh();
        }
    }

    #fitWorldToViewport() {
        const app = this.#app;
        const map = level.getCurrentLevel();
        if (!app || !map) {
            return;
        }
        const mapBounds = map.getBounds();
        const { width, height } = app.viewport;
        app.viewport.setBounds(0, 0, Math.max(mapBounds.width, width), Math.max(mapBounds.height, height));
        const x = Math.max(0, ~~((width - mapBounds.width) / 2));
        const y = Math.max(0, ~~((height - mapBounds.height) / 2));
        if (app.world.pos.x !== x || app.world.pos.y !== y) {
            app.world.pos.set(x, y, app.world.pos.z);
            refreshAbsoluteBounds(app.world);
        }
    }

    #applyLayerDepths(app) {
        for (const [name, z] of Object.entries(MAP_LAYER_Z)) {
            const layers = app.world.getChildByName(name);
            if (layers.length === 0) {
                console.warn('PlayScreen: the map has no layer called "' + name + '" (needed for its depth)');
                continue;
            }
            layers.forEach((layer) => {
                layer.pos.z = z;
            });
        }
        app.world.sort(true); 
    }

    #setUpQuests(app) {
        const zones = [];
        for (const child of app.world.children) {
            if (child instanceof QuestZone) {
                const { zone, problem } = readZone(child.zoneData);
                if (problem) {
                    console.warn(`PlayScreen: ${problem} -- ignoring it`);
                } else {
                    zones.push(zone);
                }
            }
        }
        this.#triggers.setZones(zones);
        app.world.addChild(
            new QuestTicker(() => {
                this.#tickQuests();
                this.#tickDepth();
            }),
            22,
        );

        if (quests.getStatus(TUTORIAL_QUEST_ID) === QUEST_STATUS.AVAILABLE) {
            quests.start(TUTORIAL_QUEST_ID);
        }
        if (zones.length === 0 && quests.isActive(TUTORIAL_QUEST_ID)) {
            console.warn(
                "PlayScreen: the tutorial quest is running but the map has no QuestZone objects, so its " +
                    'signpost / dock / boat steps can\'t be completed -- draw them in Tiled (see questZone.js)',
            );
        }
        this.#syncQuestHud();
    }

    #feetRect() {
        const bounds = this.#player.body.getBounds();
        return {
            x: this.#player.pos.x + bounds.x,
            y: this.#player.pos.y + bounds.y,
            width: bounds.width,
            height: bounds.height,
        };
    }

    #setUpDepth(app) {
        this.#depthZones = [];
        this.#playerInFront = false;
        for (const child of app.world.children) {
            if (child instanceof DepthZone) {
                const { zone, problem } = readDepthZone(child.zoneData);
                if (problem) {
                    console.warn(`PlayScreen: ${problem} -- ignoring it`);
                } else {
                    this.#depthZones.push(zone);
                }
            }
        }
        if (this.#depthZones.length === 0) {
            console.warn(
                "PlayScreen: the map has no DepthZone objects, so the player will always walk behind the trees " +
                    "-- draw one around each tree in Tiled (see depthZone.js)",
            );
        }
    }

    #tickDepth() {
        if (this.#paused || !this.#player || this.#depthZones.length === 0) {
            return;
        }
        const inFront = inFrontOfTree(this.#feetRect(), this.#depthZones);
        if (inFront !== this.#playerInFront) {
            this.#playerInFront = inFront;
            this.#player.pos.z = inFront ? PLAYER_Z_IN_FRONT : PLAYER_Z;
            this.#app.world.sort(); 
        }
    }

    #tickQuests() {
        if (this.#paused || !this.#player || !this.#triggers) {
            return;
        }
      
        const { interactZone } = this.#triggers.update(this.#feetRect());
        this.#interactZone = interactZone;
        this.#refreshBanner();
    }

    #hintOptions() {
        return { bindings: save.keyBindings ?? {}, keyName: this.#keyName };
    }

    #showMessage(text) {
        this.#message = { text, until: performance.now() + MESSAGE_MS };
        this.#refreshBanner();
    }

    #syncQuestHud() {
        if (!this.#questHud) {
            return;
        }
        const quest = quests.getTracked();
        if (quest) {
            const summary = trackerSummary(quest, quests.getProgress(quest.id));
            this.#questHud.setTracker(summary);
            this.#hint = formatHint(summary.hint, this.#hintOptions());
        } else {
            this.#questHud.setTracker(null);
            this.#hint = "";
        }
        this.#refreshBanner();
    }

    #refreshBanner() {
        if (!this.#questHud) {
            return;
        }
        if (this.#message && performance.now() >= this.#message.until) {
            this.#message = null;
        }
        let text = this.#hint;
        if (this.#message) {
            text = this.#message.text;
        } else if (this.#interactZone) {
            text = formatHint("Press {interact} to interact", this.#hintOptions());
        }
        this.#questHud.setBanner(text || null);
    }

    #spawnPlayer(app) {
        const [spawnPoint] = app.world.getChildByName("PlayerStart");
        if (!spawnPoint) {
            console.warn('PlayScreen: no "PlayerStart" object found on the map -- spawning at (0, 0) instead');
        }
        const x = spawnPoint ? spawnPoint.pos.x : 0;
        const y = spawnPoint ? spawnPoint.pos.y : 0;
        const [hitBox] = app.world.getChildByName("PlayHitBox");
        const hitBoxSize = hitBox ? { width: hitBox.width, height: hitBox.height } : undefined;

        this.#player = new PlayerEntity(x, y, hitBoxSize);
        app.world.addChild(this.#player, PLAYER_Z);
        app.world.addChild(new CollisionDebugOverlay(app.world), 21);
        app.viewport.follow(this.#player, app.viewport.AXIS.BOTH, 1);
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
        const hpBar = new statBar(MARGIN, hpY, BAR_WIDTH, BAR_HEIGHT, "bar_fill_hp");
        hpBar.floating = true;
        this.addLayoutChild(hpBar, HUD_Z_BASE + 1);

        const mpBar = new statBar(MARGIN, mpY, BAR_WIDTH, BAR_HEIGHT, "bar_fill_mp");
        mpBar.floating = true;
        this.addLayoutChild(mpBar, HUD_Z_BASE + 1);
    }
}

export default PlayScreen;
