import { Application, audio, loader, state, plugin, pool, save, input } from "melonjs";
import TitleScreen from "./scripts/stage/title";
import PlayScreen from "./scripts/stage/play";
import SettingsScreen from "./scripts/stage/settings";
import SplashScreen from "./scripts/stage/splashscreen";
import PlayerEntity from "./scripts/renderables/player";
import PlayerStart from "./scripts/renderables/playerStart";
import DataManifest from "./manifest";
import "./index.css";

// create a new melonJS Application
const app = new Application(1218, 562, {
    parent: "screen",
    scale: "auto",
    scaleMethod: "flex",
});

await app.init();

// initialize the audio
audio.init("mp3,ogg");

// allow cross-origin for image/texture loading
loader.setOptions({ crossOrigin: "anonymous" });

// initialize the debug plugin in development mode
if (import.meta.env.DEV) {
    import("@melonjs/debug-plugin").then((debugPlugin) => {
        plugin.register(debugPlugin.DebugPanelPlugin, "debugPanel");
    });
}

save.add({
    hasSave: false,
    screenShake: true,
    damageNumbers: true,
    difficulty: "normal",
    masterMuted: false,
    musicVolume: 1,
    sfxVolume: 1,
    pixelPerfect: true,
    antiAliasing: false,
    keyBindings: {
        moveUp: input.KEY.W,
        moveDown: input.KEY.S,
        moveLeft: input.KEY.A,
        moveRight: input.KEY.D,
        interact: input.KEY.E,
    },
});

if (save.masterMuted) {
    audio.muteAll();
}
app.renderer.setAntiAlias(save.antiAliasing);
app.renderer.setTextureFilter(save.pixelPerfect ? "nearest" : "linear");
for (const [action, keyCode] of Object.entries(save.keyBindings)) {
    input.bindKey(keyCode, action);
}

// custom boot-sequence
const STUDIO_LOGO = state.USER + 0;
const GAME_LOGO = state.USER + 1;

// set and load all resources
loader.preload(DataManifest, () => {
    state.transition("fade", "#000000", 400);

    // boot sequence
    state.set(
        STUDIO_LOGO,
        new SplashScreen({
            image: "studio_logo",
            imageWidth: 1920,
            imageHeight: 1080,
            backgroundColor: "#000000",
            subtitle: "click or press any key to continue",
            nextState: GAME_LOGO,
        }),
    );
    state.set(
        GAME_LOGO,
        new SplashScreen({
            // TODO: swap for the game's actual logo once it's ready
            text: "GUILD QUEST ADVENTURE",
            subtitle: "click or press any key to continue",
            textColor: "#c9a86a",
            nextState: state.MENU,
        }),
    );

    state.set(state.MENU, new TitleScreen());
    state.set(state.PLAY, new PlayScreen());
    state.set(state.SETTINGS, new SettingsScreen());

    pool.register("mainPlayer", PlayerEntity);
    pool.register("PlayerStart", PlayerStart);

    // start the game
    state.change(STUDIO_LOGO, false);
});
