import { Renderable } from "melonjs";

class MapMarker extends Renderable {
    constructor(x, y, settings) {
        super(x, y, settings.width || 1, settings.height || 1);
        this.name = settings.name;
        this.alwaysUpdate = false;
    }

    draw() {

    }
}

export default MapMarker;
