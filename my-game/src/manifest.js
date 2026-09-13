// a melonJS data manifest
const DataManifest = [

    /* Bitmap Text */
    {
        name: "PressStart2P",
        type: "image",
        src:  "/data/fnt/PressStart2P.png"
    },
    {
        name: "PressStart2P",
        type: "binary",
        src: "/data/fnt/PressStart2P.fnt"
    },

    /* UI sound effects */
    {
        name: "button_hover",
        type: "audio",
        src: "/data/sfx/"
    },
    {
        name: "button_select",
        type: "audio",
        src: "/data/sfx/"
    },

    /* Boot sequence logos */
    {
        name: "studio_logo",
        type: "image",
        src: "/data/img/studio_logo.png"
    },

    /* Medieval UI kit (buttons, panels, etc.) -- sheets stay untouched,
       exact pixel regions are sliced out at runtime via a TextureAtlas */
    {
        name: "ui_inputs",
        type: "image",
        src: "/data/img/ui_inputs.png"
    },
    {
        name: "ui_frames",
        type: "image",
        src: "/data/img/ui_frames.png"
    }
];

export default DataManifest;
