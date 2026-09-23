import { TextureAtlas, loader } from "melonjs";

let buttonAtlas;
let frameAtlas;
let bannerAtlas;
let barAtlas;
let iconAtlas;

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
        frameAtlas.addRegion("square_frame", 5, 5, 30, 32);
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

export function getBarAtlas() {
    if (!barAtlas) {
        barAtlas = new TextureAtlas({ framewidth: 8, frameheight: 8 }, loader.getImage("ui_bars"));
        barAtlas.addRegion("bar_frame", 0, 89, 24, 6);
        barAtlas.addRegion("bar_fill_hp", 1, 122, 22, 3);
        barAtlas.addRegion("bar_fill_mp", 25, 122, 22, 3);
    }
    return barAtlas;
}

export function getIconAtlas() {
    if (!iconAtlas) {
        iconAtlas = new TextureAtlas({ framewidth: 8, frameheight: 8 }, loader.getImage("ui_icons"));
        iconAtlas.addRegion("icon_helmet", 0, 296, 7, 7);
        iconAtlas.addRegion("icon_gloves", 8, 296, 9, 7);
        iconAtlas.addRegion("icon_chest", 15, 298, 9, 4);
        iconAtlas.addRegion("icon_legs", 23, 296, 10, 9);
        iconAtlas.addRegion("icon_boots", 30, 296, 10, 9);
        iconAtlas.addRegion("icon_weapon", 0, 320, 12, 15);
        iconAtlas.addRegion("icon_ring", 1, 343, 9, 8);
    }
    return iconAtlas;
}
