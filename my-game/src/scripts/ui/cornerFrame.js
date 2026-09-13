import { Sprite } from "melonjs";
import { getFrameAtlas } from "./frameAtlas";

const DEFAULT_SCALE = 6;
const DEFAULT_MARGIN = 14;

export function getCornerFootprint(options = {}) {
    const { scale = DEFAULT_SCALE, margin = DEFAULT_MARGIN } = options;
    const atlas = getFrameAtlas();
    const region = atlas.getRegion("corner_ornament");
    return margin + region.width * scale;
}

export function addCornerOrnaments(addChild, width, height, options = {}) {
    const { scale = DEFAULT_SCALE, margin = DEFAULT_MARGIN, z = 1 } = options;
    const atlas = getFrameAtlas();
    const region = atlas.getRegion("corner_ornament");
    const size = region.width * scale;

    const corners = [
        { x: margin, y: margin, flipX: false, flipY: false },
        { x: width - margin - size, y: margin, flipX: true, flipY: false },
        { x: margin, y: height - margin - size, flipX: false, flipY: true },
        { x: width - margin - size, y: height - margin - size, flipX: true, flipY: true },
    ];

    for (const corner of corners) {
        const sprite = new Sprite(corner.x + size / 2, corner.y + size / 2, {
            image: atlas,
            region: "corner_ornament",
            flipX: corner.flipX,
            flipY: corner.flipY,
        });
        sprite.scale(scale);
        sprite.floating = false;
        addChild(sprite, z);
    }
}

