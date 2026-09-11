import { type Application, Stage, ColorLayer } from "melonjs";

class PlayScreen extends Stage {
    /**
     *  action to perform on state change
     */
    onResetEvent(app: Application) {
        // add a gray background to the default Stage
        // TODO: replace with the guild hub / quest level once it's built
        app.world.addChild(new ColorLayer("background", "#202020"), 0);
    }
}

export default PlayScreen;
