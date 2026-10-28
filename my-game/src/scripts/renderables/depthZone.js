import { Renderable, pool } from "melonjs";

class DepthZone extends Renderable {
    constructor(x, y, settings) {
        super(x, y, settings.width || 1, settings.height || 1);
        this.name = settings.name;
        this.alwaysUpdate = false;
      
        this.zoneData = {
            name: settings.name,
            x,
            y,
            width: settings.width,
            height: settings.height,
            base: settings.base,
        };
    }

    draw() {
    }
}

if (!pool.exists("DepthZone")) {
    pool.register("DepthZone", DepthZone);
}

export default DepthZone;
