
export const ZONE_TRIGGER = Object.freeze({
    ENTER: "enter",
    INTERACT: "interact",
});

export const WALK_TARGET = "walk_tile";

export function readZone(raw) {
    const name = raw.name || "(unnamed)";
    const trigger = raw.trigger === undefined || raw.trigger === "" ? ZONE_TRIGGER.ENTER : raw.trigger;
    if (!Object.values(ZONE_TRIGGER).includes(trigger)) {
        return { zone: null, problem: `QuestZone "${name}": trigger must be "enter" or "interact", not "${trigger}"` };
    }
    if (typeof raw.target !== "string" || raw.target === "") {
        return { zone: null, problem: `QuestZone "${name}": it needs a "target" property (text)` };
    }
   
    if (!(raw.width > 0) || !(raw.height > 0)) {
        return { zone: null, problem: `QuestZone "${name}": it has to be a rectangle, with a width and height` };
    }
    return {
        zone: {
            name,
            target: raw.target,
            trigger,
            message: typeof raw.message === "string" ? raw.message : "",
            rect: { x: raw.x, y: raw.y, width: raw.width, height: raw.height },
        },
        problem: null,
    };
}

function overlaps(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function createQuestTriggers({ quests, isDown, onInteract = () => {}, tileSize = 16, maxStep = 48 }) {
    let zones = [];
    const inside = new Set();
    let lastPoint = null;
    let walked = 0; 
    let interactWasDown = false;

    return {
        setZones(newZones) {
            zones = newZones;
            inside.clear();
        },

        rearm() {
            inside.clear();
        },

        update(rect) {
            const point = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
            if (lastPoint) {
                const step = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
                if (step <= maxStep) {
                    walked += step;
                    const tiles = Math.floor(walked / tileSize);
                    if (tiles > 0) {
                        walked -= tiles * tileSize;
                        quests.report("custom", WALK_TARGET, tiles);
                    }
                }
            }
            lastPoint = point;

            const interactDown = isDown("interact");
            const interactPressed = interactDown && !interactWasDown;
            interactWasDown = interactDown;

            let interactZone = null;
            for (const zone of zones) {
                const isInside = overlaps(rect, zone.rect);
                const wasInside = inside.has(zone);
                if (isInside) {
                    inside.add(zone);
                } else {
                    inside.delete(zone);
                }

                if (zone.trigger === ZONE_TRIGGER.ENTER) {
                    if (isInside && !wasInside) {
                        quests.report("reach", zone.target);
                    }
                } else if (isInside && !interactZone) {
                    interactZone = zone;
                }
            }

            if (interactPressed && interactZone) {
                quests.report("interact", interactZone.target);
                onInteract(interactZone);
            }
            return { interactZone };
        },
    };
}
