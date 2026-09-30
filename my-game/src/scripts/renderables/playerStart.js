import { Renderable } from "melonjs";

class PlayerStart extends Renderable {
    constructor(x, y, settings) {
        super(x, y, settings.width || 1, settings.height || 1);
        this.name = settings.name;
        this.alwaysUpdate = false;
    }

    draw() {

    }
}

export default PlayerStart;
