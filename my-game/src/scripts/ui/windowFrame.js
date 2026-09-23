import { Sprite, NineSliceSprite } from "melonjs";
import { getFrameAtlas, getBannerAtlas } from "./atlas";

const INSET_X = 4;
const INSET_Y = 4;
const FILL_PADDING = 4;

export function createWindowFrame(x, y, width, height) {
    const fill = new Sprite(x + width / 2, y + height / 2, {
        image: getBannerAtlas(),
        region: "divider_pixel",
    });
    fill.scale(Math.max(1, width - FILL_PADDING), Math.max(1, height - FILL_PADDING));
    fill.floating = false;

    const frame = new NineSliceSprite(x + width / 2, y + height / 2, {
        image: getFrameAtlas(),
        region: "square_frame",
        width,
        height,
        insetx: INSET_X,
        insety: INSET_Y,
    });
    frame.floating = false;

    return [fill, frame];
}
