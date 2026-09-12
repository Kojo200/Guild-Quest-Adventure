import { ColorLayer } from "melonjs";
import ResponsiveStage from "./responsivestage";

class PlayScreen extends ResponsiveStage {
  /**
   *  (re)builds every child on load and on every viewport resize
   *  @param {import("melonjs").Application} app
   */
  layout(app) {
    // add a gray background to the default Stage
    // TODO: replace with the guild hub / quest level once it's built
    this.addLayoutChild(new ColorLayer("background", "#202020"), 0);
  }
}

export default PlayScreen;
