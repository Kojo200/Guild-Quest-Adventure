
export const HEAD_REACH = 40;

const DEFAULT_BASE_INSET = 7;

function overlaps(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function readDepthZone(raw) {
    const name = raw.name || "(unnamed)";
    if (!(raw.width > 0) || !(raw.height > 0)) {
        return { zone: null, problem: `DepthZone "${name}": it has to be a rectangle, with a width and height` };
    }
    let base = raw.y + raw.height - DEFAULT_BASE_INSET;
    if (raw.base !== undefined && raw.base !== "") {
        base = Number(raw.base);
        if (!Number.isFinite(base)) {
            return { zone: null, problem: `DepthZone "${name}": "base" must be a number, not "${raw.base}"` };
        }
    }
    return {
        zone: { name, base, rect: { x: raw.x, y: raw.y, width: raw.width, height: raw.height } },
        problem: null,
    };
}

export function inFrontOfTree(feet, zones, headReach = HEAD_REACH) {
    const feetCentreY = feet.y + feet.height / 2;
    const body = { x: feet.x, y: feet.y - headReach, width: feet.width, height: feet.height + headReach };
    return zones.some((zone) => feetCentreY >= zone.base && overlaps(body, zone.rect));
}
