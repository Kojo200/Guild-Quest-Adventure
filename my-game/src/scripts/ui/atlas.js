import { TextureAtlas, loader } from "melonjs";

let buttonAtlas;
let frameAtlas;
let bannerAtlas;

export function getButtonAtlas() {
    if (!buttonAtlas) {
        buttonAtlas = new TextureAtlas({ framewidth: 8, frameheight: 8 }, loader.getImage("ui_inputs"));
        buttonAtlas.addRegion("button_default", 3, 189, 34, 15);
        buttonAtlas.addRegion("button_hover", 2, 164, 36, 17);
        buttonAtlas.addRegion("button_shadow", 202, 192, 36, 13);
        buttonAtlas.addRegion("title_plate", 2, 164, 36, 17);
        buttonAtlas.addRegion("title_plate_shadow", 201, 167, 38, 15);
        buttonAtlas.addRegion("tab_default", 7, 23, 26, 12);
        buttonAtlas.addRegion("tab_hover", 6, 6, 28, 14);
        buttonAtlas.addRegion("solid_fill", 15, 195, 1, 1);
    }
    return buttonAtlas;
}

export function getFrameAtlas() {
    if (!frameAtlas) {
        frameAtlas = new TextureAtlas({ framewidth: 8, frameheight: 8 }, loader.getImage("ui_frames"));
        frameAtlas.addRegion("corner_ornament", 1, 353, 9, 9);
    }
    return frameAtlas;
}

export function getBannerAtlas() {
    if (!bannerAtlas) {
        bannerAtlas = new TextureAtlas({ framewidth: 8, frameheight: 8 }, loader.getImage("ui_banners"));
        bannerAtlas.addRegion("divider_pixel", 140, 202, 1, 1);
    }
    return bannerAtlas;
}
