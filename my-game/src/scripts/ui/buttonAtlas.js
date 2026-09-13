import { TextureAtlas, loader } from "melonjs";

let atlas;

export function getButtonAtlas() {
    if (!atlas) {
        atlas = new TextureAtlas({ framewidth: 8, frameheight: 8 }, loader.getImage("ui_inputs"));
        atlas.addRegion("button_default", 3, 189, 34, 15);
        atlas.addRegion("button_hover", 2, 164, 36, 17);
        atlas.addRegion("button_shadow", 202, 192, 36, 13);
        atlas.addRegion("title_plate", 2, 164, 36, 17);
        atlas.addRegion("title_plate_shadow", 201, 167, 38, 15);
        atlas.addRegion("tab_default", 7, 23, 26, 12);
        atlas.addRegion("tab_hover", 6, 6, 28, 14);
    }
    return atlas;
}
