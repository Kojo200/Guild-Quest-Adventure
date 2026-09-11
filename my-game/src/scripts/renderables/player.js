import { Sprite } from "melonjs";

class PlayerEntity extends Sprite {

    /**
     * constructor
     * @param {number} x
     * @param {number} y
     * @param {{ image: string, [key: string]: unknown }} settings
     */
    constructor(x, y, settings) {
        // call the parent constructor
        super(x, y, settings);
    }

    /**
     * update the entity
     * @param {number} dt
     */
    update(dt) {
        // change body force based on inputs
        // ...
        // call the parent method
        return super.update(dt);
    }

    /**
     * collision handler
     * (called when colliding with other objects)
     */
    onCollision() {
        // Make all other objects solid
        return true;
    }
}

export default PlayerEntity;
