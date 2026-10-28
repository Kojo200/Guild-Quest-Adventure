import { QUEST_STATUS, QUEST_EVENT } from "./questData";

const STATE_VERSION = 1;

const STORED_STATUSES = [QUEST_STATUS.ACTIVE, QUEST_STATUS.READY, QUEST_STATUS.COMPLETED];

const clone = (value) => JSON.parse(JSON.stringify(value));

function freshState() {
    return { version: STATE_VERSION, quests: {}, tracked: null };
}

class questManager {
    #registry;
    #storage;
    #emitter;
    #rewardHandler;
    #now;
    #state = null; 
    #pending = []; 

    constructor({ registry, storage = null, emitter = null, rewardHandler = null, now = Date.now } = {}) {
        if (!registry) {
            throw new Error("questManager needs a quest registry");
        }
        this.#registry = registry;
        this.#storage = storage;
        this.#emitter = emitter;
        this.#rewardHandler = rewardHandler;
        this.#now = now;
    }

    // ---- setup -------------------------------------------------------

    setRewardHandler(handler) {
        this.#rewardHandler = handler;
    }

    load() {
        let raw = null;
        try {
            raw = this.#storage ? this.#storage.load() : null;
        } catch (error) {
            console.error("questManager: couldn't read saved quest progress, starting fresh", error);
        }
        this.#state = this.#normalise(raw);
    }

    reset() {
        this.#state = freshState();
        this.#pending.push(() => this.#emit(QUEST_EVENT.RESET, {}));
        this.#commit();
    }

    // ---- reading state -----------------------------------------------

    getStatus(id) {
        this.#require(id);
        const entry = this.#entry(id);
        if (entry) {
            return entry.status;
        }
        return this.#prerequisitesMet(this.#registry.get(id)) ? QUEST_STATUS.AVAILABLE : QUEST_STATUS.LOCKED;
    }

    isActive(id) {
        const status = this.getStatus(id);
        return status === QUEST_STATUS.ACTIVE || status === QUEST_STATUS.READY;
    }

    isCompleted(id) {
        return this.getStatus(id) === QUEST_STATUS.COMPLETED;
    }

    getProgress(id) {
        const quest = this.#require(id);
        const status = this.getStatus(id);
        const started = STORED_STATUSES.includes(status);
        const entry = this.#entry(id);
        let earlierDone = true;
        return quest.objectives.map((objective) => {
            const current =
                status === QUEST_STATUS.COMPLETED
                    ? objective.count
                    : Math.min(objective.count, entry?.objectives[objective.id] ?? 0);
            const done = current >= objective.count;
            const visible = started && (!quest.sequential || earlierDone);
            earlierDone = earlierDone && done;
            return {
                id: objective.id,
                type: objective.type,
                target: objective.target,
                description: objective.description,
                hint: objective.hint,
                current,
                required: objective.count,
                done,
                visible,
            };
        });
    }

    getActive() {
        this.#ensureLoaded();
        return Object.entries(this.#state.quests)
            .filter(([, entry]) => entry.status === QUEST_STATUS.ACTIVE || entry.status === QUEST_STATUS.READY)
            .sort(([, a], [, b]) => (a.startedAt ?? 0) - (b.startedAt ?? 0))
            .map(([id]) => this.#registry.get(id))
            .filter(Boolean);
    }

    getAvailable() {
        return this.#registry.all().filter((quest) => this.getStatus(quest.id) === QUEST_STATUS.AVAILABLE);
    }

    getCompleted() {
        this.#ensureLoaded();
        return Object.entries(this.#state.quests)
            .filter(([, entry]) => entry.status === QUEST_STATUS.COMPLETED)
            .sort(([, a], [, b]) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
            .map(([id]) => this.#registry.get(id))
            .filter(Boolean);
    }

    getTracked() {
        this.#ensureLoaded();
        const id = this.#state.tracked;
        return id ? this.#registry.get(id) : null;
    }

    // ---- changing state ----------------------------------------------

    start(id) {
        const quest = this.#require(id);
        if (this.getStatus(id) !== QUEST_STATUS.AVAILABLE) {
            return false;
        }
        this.#begin(quest);
        this.#commit();
        return true;
    }

    report(type, target, amount = 1) {
        if (!Number.isInteger(amount) || amount < 1) {
            return [];
        }
        this.#ensureLoaded();
        const touched = [];
   
        for (const [id, entry] of Object.entries(this.#state.quests)) {
            const quest = this.#registry.get(id);
            if (entry.status !== QUEST_STATUS.ACTIVE || !quest) {
                continue;
            }
            if (this.#applyReport(quest, entry, type, target, amount)) {
                touched.push(id);
            }
        }
        if (touched.length > 0) {
            this.#commit();
        }
        return touched;
    }

    turnIn(id) {
        const quest = this.#require(id);
        if (this.getStatus(id) !== QUEST_STATUS.READY) {
            return false;
        }
        this.#complete(quest);
        this.#commit();
        return true;
    }

    track(id) {
        this.#require(id);
        if (!this.isActive(id)) {
            return false;
        }
        this.#setTracked(id);
        this.#commit();
        return true;
    }

    // ---- internals ---------------------------------------------------

    #require(id) {
        const quest = this.#registry.get(id);
        if (!quest) {
            throw new Error(`questManager: unknown quest "${id}"`);
        }
        this.#ensureLoaded();
        return quest;
    }

    #ensureLoaded() {
        if (!this.#state) {
            this.load();
        }
    }

    #entry(id) {
        this.#ensureLoaded();
        return Object.prototype.hasOwnProperty.call(this.#state.quests, id) ? this.#state.quests[id] : null;
    }

    #prerequisitesMet(quest) {
        return quest.prerequisites.every((id) => this.#entry(id)?.status === QUEST_STATUS.COMPLETED);
    }

    #normalise(raw) {
        const state = freshState();
        if (!raw || typeof raw !== "object" || !raw.quests || typeof raw.quests !== "object") {
            return state;
        }
        for (const [id, saved] of Object.entries(raw.quests)) {
            if (id === "__proto__" || !saved || typeof saved !== "object" || !STORED_STATUSES.includes(saved.status)) {
                continue;
            }
         
            const quest = this.#registry.get(id);
            const objectives = {};
            for (const [objectiveId, value] of Object.entries(saved.objectives ?? {})) {
                if (objectiveId === "__proto__") {
                    continue;
                }
                const definition = quest?.objectives.find((o) => o.id === objectiveId);
                const count = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
                objectives[objectiveId] = definition ? Math.min(definition.count, count) : count;
            }
            state.quests[id] = {
                status: saved.status,
                objectives,
                startedAt: Number.isFinite(saved.startedAt) ? saved.startedAt : null,
                completedAt: Number.isFinite(saved.completedAt) ? saved.completedAt : null,
            };
        }
        const tracked = raw.tracked;
     
        if (
            typeof tracked === "string" &&
            Object.prototype.hasOwnProperty.call(state.quests, tracked) &&
            this.#isInProgress(state.quests[tracked])
        ) {
            state.tracked = tracked;
        }
        return state;
    }

    #isInProgress(entry) {
        return entry && (entry.status === QUEST_STATUS.ACTIVE || entry.status === QUEST_STATUS.READY);
    }

    #begin(quest) {
        this.#state.quests[quest.id] = {
            status: QUEST_STATUS.ACTIVE,
            objectives: Object.fromEntries(quest.objectives.map((o) => [o.id, 0])),
            startedAt: this.#now(),
            completedAt: null,
        };
        this.#pending.push(() => this.#emit(QUEST_EVENT.STARTED, { questId: quest.id, quest }));
        if (!this.#state.tracked) {
            this.#setTracked(quest.id);
        }
    }

    #applyReport(quest, entry, type, target, amount) {
        const remaining = quest.objectives.filter((o) => (entry.objectives[o.id] ?? 0) < o.count);
    
        const eligible = quest.sequential ? remaining.slice(0, 1) : remaining;

        let changed = false;
        for (const objective of eligible) {
            if (objective.type !== type || (objective.target !== "*" && objective.target !== target)) {
                continue;
            }
            const current = Math.min(objective.count, (entry.objectives[objective.id] ?? 0) + amount);
            entry.objectives[objective.id] = current;
            changed = true;
            const payload = {
                questId: quest.id,
                quest,
                objectiveId: objective.id,
                current,
                required: objective.count,
            };
            this.#pending.push(() => this.#emit(QUEST_EVENT.OBJECTIVE_UPDATED, payload));
            if (current >= objective.count) {
                this.#pending.push(() => this.#emit(QUEST_EVENT.OBJECTIVE_COMPLETED, payload));
            }
        }

        if (changed && quest.objectives.every((o) => (entry.objectives[o.id] ?? 0) >= o.count)) {
            if (quest.autoComplete) {
                this.#complete(quest);
            } else {
                entry.status = QUEST_STATUS.READY;
                this.#pending.push(() => this.#emit(QUEST_EVENT.READY, { questId: quest.id, quest }));
            }
        }
        return changed;
    }

    #complete(quest) {
        const entry = this.#entry(quest.id);
        entry.status = QUEST_STATUS.COMPLETED;
        entry.completedAt = this.#now();

        this.#pending.push(() => this.#grantRewards(quest));
        this.#pending.push(() => this.#emit(QUEST_EVENT.COMPLETED, { questId: quest.id, quest, rewards: quest.rewards }));

        const trackerCleared = this.#state.tracked === quest.id;
        if (trackerCleared) {
            this.#state.tracked = null;
        }
        if (quest.next && this.getStatus(quest.next) === QUEST_STATUS.AVAILABLE) {
            this.#begin(this.#registry.get(quest.next));
        }
        if (!this.#state.tracked) {
            const [first] = this.getActive();
            if (first) {
                this.#setTracked(first.id);
            } else if (trackerCleared) {
                this.#pending.push(() => this.#emit(QUEST_EVENT.TRACKED, { questId: null }));
            }
        }
    }

    #setTracked(id) {
        if (this.#state.tracked === id) {
            return;
        }
        this.#state.tracked = id;
        this.#pending.push(() => this.#emit(QUEST_EVENT.TRACKED, { questId: id }));
    }

    #commit() {
        if (this.#storage) {
            try {
                this.#storage.save(clone(this.#state));
            } catch (error) {
                console.error("questManager: couldn't save quest progress", error);
            }
        }
        const work = this.#pending;
        this.#pending = [];
        for (const run of work) {
            try {
                run();
            } catch (error) {
                console.error("questManager: a quest listener threw", error);
            }
        }
    }

    #grantRewards(quest) {
        if (this.#rewardHandler) {
            this.#rewardHandler(quest.rewards, quest);
        }
    }

    #emit(name, payload) {
        if (this.#emitter) {
            this.#emitter.emit(name, payload);
        }
    }
}

export default questManager;
