import { Application, audio, loader, state, plugin, pool } from "melonjs";
import TitleScreen from "./scripts/stage/title";
import PlayScreen from "./scripts/stage/play";
import SplashScreen from "./scripts/stage/splashscreen";
import PlayerEntity from "./scripts/renderables/player";
import DataManifest from "./manifest";
import "./index.css";

// create a new melonJS Application
const app = new Application(1218, 562, {
    parent: "screen",
    scale: "auto",
});

// mandatory since melonJS 20.0: this is what builds the renderer and adds
// the canvas to the page. It is asynchronous so a WebGPU device can be
// acquired, and resolves without suspending on the WebGL and Canvas backends.
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

// custom boot-sequence states, on top of melonJS's built-in ones
const STUDIO_LOGO = state.USER + 0;
const GAME_LOGO = state.USER + 1;

// set and load all resources
loader.preload(DataManifest, () => {
    // boot sequence: studio logo -> game logo -> title screen
    state.set(
        STUDIO_LOGO,
        new SplashScreen({
            // TODO: swap for the studio's actual logo once it's ready
            text: "[ STUDIO LOGO PLACEHOLDER ]",
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

    // set the user defined game stages
    state.set(state.MENU, new TitleScreen());
    state.set(state.PLAY, new PlayScreen());

    // add our player entity in the entity pool
    pool.register("mainPlayer", PlayerEntity);

    // start the game
    state.change(STUDIO_LOGO, false);
});
