
import { Renderable, pool } from "melonjs";

class QuestZone extends Renderable {
  
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
            target: settings.target,
            trigger: settings.trigger,
            message: settings.message,
        };
    }

    draw() {
    }
}

export class QuestTicker extends Renderable {
    #onTick;

    constructor(onTick) {
        super(0, 0, 1, 1);
        this.#onTick = onTick;
        this.alwaysUpdate = true; 
    }

    update() {
        this.#onTick();
        return false; 
    }

    draw() {
       
    }
}

if (!pool.exists("QuestZone")) {
    pool.register("QuestZone", QuestZone);
}

export default QuestZone;
