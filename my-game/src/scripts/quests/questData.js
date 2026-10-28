export const QUEST_STATUS = Object.freeze({
    LOCKED: "locked",
    AVAILABLE: "available",
    ACTIVE: "active",
    READY: "ready",
    COMPLETED: "completed",
});

export const OBJECTIVE_TYPE = Object.freeze({
    KILL: "kill",
    COLLECT: "collect",
    TALK: "talk",
    REACH: "reach",
    INTERACT: "interact",
    USE: "use",
    CUSTOM: "custom",
});

export const QUEST_CATEGORY = Object.freeze({
    MAIN: "main",
    SIDE: "side",
});

export const QUEST_EVENT = Object.freeze({
    STARTED: "quest:started",
    OBJECTIVE_UPDATED: "quest:objectiveUpdated", 
    OBJECTIVE_COMPLETED: "quest:objectiveCompleted", 
    READY: "quest:ready", 
    COMPLETED: "quest:completed", 
    TRACKED: "quest:tracked", 
    RESET: "quest:reset", 
});

const QUEST_KEYS = [
    "id",
    "title",
    "description",
    "category",
    "prerequisites",
    "sequential",
    "autoComplete",
    "next",
    "objectives",
    "rewards",
];
const OBJECTIVE_KEYS = ["id", "type", "target", "count", "description", "hint"];
const REWARD_KEYS = ["xp", "gold", "items"];

const isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
const isCount = (value) => Number.isInteger(value) && value >= 1;
const isAmount = (value) => Number.isInteger(value) && value >= 0;

function deepFreeze(value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.values(value).forEach(deepFreeze);
    }
    return value;
}

function rejectUnknownKeys(object, allowed, fail, where) {
    for (const key of Object.keys(object)) {
        if (!allowed.includes(key)) {
            fail(`${where} has unknown key "${key}" (allowed: ${allowed.join(", ")})`);
        }
    }
}

function defineObjective(raw, index, fail) {
    const where = `objective #${index + 1}`;
    if (!raw || typeof raw !== "object") {
        fail(`${where} must be an object`);
    }
    rejectUnknownKeys(raw, OBJECTIVE_KEYS, fail, where);
    if (!isNonEmptyString(raw.id)) {
        fail(`${where} needs a non-empty string "id"`);
    }
    if (!Object.values(OBJECTIVE_TYPE).includes(raw.type)) {
        fail(`objective "${raw.id}" has invalid type "${raw.type}" (allowed: ${Object.values(OBJECTIVE_TYPE).join(", ")})`);
    }
    if (!isNonEmptyString(raw.target)) {
        fail(`objective "${raw.id}" needs a non-empty string "target" ("*" matches any target of that type)`);
    }
    const count = raw.count === undefined ? 1 : raw.count;
    if (!isCount(count)) {
        fail(`objective "${raw.id}" has invalid count ${JSON.stringify(raw.count)} (must be a whole number, 1 or more)`);
    }
    if (!isNonEmptyString(raw.description)) {
        fail(`objective "${raw.id}" needs a "description" -- it's the text the quest log shows`);
    }
    if (raw.hint !== undefined && typeof raw.hint !== "string") {
        fail(`objective "${raw.id}" has a "hint" that isn't text`);
    }
    return {
        id: raw.id,
        type: raw.type,
        target: raw.target,
        count,
        description: raw.description,
        hint: raw.hint ?? "",
    };
}

function defineRewards(raw, fail) {
    const rewards = raw === undefined ? {} : raw;
    if (!rewards || typeof rewards !== "object" || Array.isArray(rewards)) {
        fail(`"rewards" must be an object`);
    }
    rejectUnknownKeys(rewards, REWARD_KEYS, fail, "rewards");
    const xp = rewards.xp === undefined ? 0 : rewards.xp;
    const gold = rewards.gold === undefined ? 0 : rewards.gold;
    if (!isAmount(xp)) {
        fail(`rewards.xp must be a whole number, 0 or more`);
    }
    if (!isAmount(gold)) {
        fail(`rewards.gold must be a whole number, 0 or more`);
    }
    const rawItems = rewards.items === undefined ? [] : rewards.items;
    if (!Array.isArray(rawItems)) {
        fail(`rewards.items must be an array`);
    }
    const items = rawItems.map((item, index) => {
        if (!item || !isNonEmptyString(item.id)) {
            fail(`rewards.items #${index + 1} needs a non-empty string "id" (an id from items.js)`);
        }
        const count = item.count === undefined ? 1 : item.count;
        if (!isCount(count)) {
            fail(`rewards.items "${item.id}" has invalid count ${JSON.stringify(item.count)}`);
        }
        return { id: item.id, count };
    });
    return { xp, gold, items };
}

export function defineQuest(raw) {
    if (!raw || typeof raw !== "object") {
        throw new Error("defineQuest: expected a quest definition object");
    }
    if (!isNonEmptyString(raw.id)) {
        throw new Error(`defineQuest: every quest needs a non-empty string "id"`);
    }
    const id = raw.id;
    const fail = (message) => {
        throw new Error(`Quest "${id}": ${message}`);
    };

    rejectUnknownKeys(raw, QUEST_KEYS, fail, "quest");
    if (!isNonEmptyString(raw.title)) {
        fail(`needs a non-empty string "title"`);
    }
    if (raw.description !== undefined && typeof raw.description !== "string") {
        fail(`"description" must be a string`);
    }
    const category = raw.category === undefined ? QUEST_CATEGORY.MAIN : raw.category;
    if (!Object.values(QUEST_CATEGORY).includes(category)) {
        fail(`invalid category "${raw.category}" (allowed: ${Object.values(QUEST_CATEGORY).join(", ")})`);
    }

    const prerequisites = raw.prerequisites === undefined ? [] : raw.prerequisites;
    if (!Array.isArray(prerequisites) || !prerequisites.every(isNonEmptyString)) {
        fail(`"prerequisites" must be an array of quest id strings`);
    }
    if (prerequisites.includes(id)) {
        fail(`can't be its own prerequisite`);
    }

    for (const flag of ["sequential", "autoComplete"]) {
        if (raw[flag] !== undefined && typeof raw[flag] !== "boolean") {
            fail(`"${flag}" must be true or false`);
        }
    }

    const next = raw.next === undefined ? null : raw.next;
    if (next !== null && !isNonEmptyString(next)) {
        fail(`"next" must be a quest id string (or left out)`);
    }
    if (next === id) {
        fail(`"next" can't point at itself`);
    }

    if (!Array.isArray(raw.objectives) || raw.objectives.length === 0) {
        fail(`needs at least one objective`);
    }
    const objectives = raw.objectives.map((objective, index) => defineObjective(objective, index, fail));
    const seen = new Set();
    for (const objective of objectives) {
        if (seen.has(objective.id)) {
            fail(`has two objectives with the id "${objective.id}"`);
        }
        seen.add(objective.id);
    }

    return deepFreeze({
        id,
        title: raw.title,
        description: raw.description ?? "",
        category,
        prerequisites: [...prerequisites],
        sequential: raw.sequential ?? false,
        autoComplete: raw.autoComplete ?? true,
        next,
        objectives,
        rewards: defineRewards(raw.rewards, fail),
    });
}

export function createQuestRegistry() {
    const quests = new Map();

    return {
        register(definition) {
            const quest = defineQuest(definition);
            if (quests.has(quest.id)) {
                throw new Error(`Quest "${quest.id}" is registered twice`);
            }
            quests.set(quest.id, quest);
            return quest;
        },

        get(id) {
            return quests.get(id) ?? null;
        },

        has(id) {
            return quests.has(id);
        },

        all() {
            return [...quests.values()];
        },

        validate() {
            for (const quest of quests.values()) {
                for (const prerequisite of quest.prerequisites) {
                    if (!quests.has(prerequisite)) {
                        throw new Error(`Quest "${quest.id}": prerequisite "${prerequisite}" is not a registered quest`);
                    }
                }
                if (quest.next !== null && !quests.has(quest.next)) {
                    throw new Error(`Quest "${quest.id}": next "${quest.next}" is not a registered quest`);
                }
            }

            const state = new Map(); 
            const visit = (id, path) => {
                if (state.get(id) === "done") {
                    return;
                }
                if (state.get(id) === "visiting") {
                    throw new Error(`Quest prerequisites form a loop: ${[...path, id].join(" -> ")}`);
                }
                state.set(id, "visiting");
                for (const prerequisite of quests.get(id).prerequisites) {
                    visit(prerequisite, [...path, id]);
                }
                state.set(id, "done");
            };
            for (const id of quests.keys()) {
                visit(id, []);
            }
            return true;
        },
    };
}

export const questRegistry = createQuestRegistry();

export function registerQuest(definition) {
    return questRegistry.register(definition);
}
