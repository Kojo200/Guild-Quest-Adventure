import { TextureAtlas, loader } from "melonjs";

let atlas;

export function getFrameAtlas() {
    if (!atlas) {
        atlas = new TextureAtlas({ framewidth: 8, frameheight: 8 }, loader.getImage("ui_frames"));
        atlas.addRegion("corner_ornament", 1, 353, 9, 9);
    }
    return atlas;
}
