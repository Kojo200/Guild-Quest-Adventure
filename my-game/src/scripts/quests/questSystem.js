import { event, save } from "melonjs";
import { questRegistry } from "./questData";
import questManager from "./questManager";
import "./questList";

const SAVE_KEY = "questState";

function ensureSaveKey() {
    if (!(SAVE_KEY in save)) {
        save.add({ [SAVE_KEY]: null });
    }
}

const saveStorage = {
    load() {
        ensureSaveKey();
        return save[SAVE_KEY];
    },
    save(state) {
        ensureSaveKey();
        save[SAVE_KEY] = state;
    },
};

export const quests = new questManager({
    registry: questRegistry,
    storage: saveStorage,
    emitter: event,
});

if (import.meta.env?.DEV) {
    globalThis.quests = quests;
}

export { QUEST_STATUS, QUEST_EVENT, OBJECTIVE_TYPE, QUEST_CATEGORY } from "./questData";
