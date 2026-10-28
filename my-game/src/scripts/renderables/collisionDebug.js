import { Renderable, collision } from "melonjs";

class CollisionDebugOverlay extends Renderable {
    #world;

    constructor(world) {
        super(0, 0, Infinity, Infinity);
        this.#world = world;
        this.floating = false;
        this.alwaysUpdate = true;
    }

    update() {
        return true;
    }

    draw(renderer) {
        renderer.save();
        renderer.lineWidth = 1;

        for (const child of this.#world.children) {
            if (!child.body) {
                continue;
            }
            const isPlayer = child.body.collisionType === collision.types.PLAYER_OBJECT;
            renderer.setColor(isPlayer ? "#00ff00" : "#ff3333");
            this.#strokeBodyBounds(renderer, child);
        }

        renderer.restore();
    }

    #strokeBodyBounds(renderer, renderable) {
        const bounds = renderable.body.getBounds();
        let x = renderable.pos.x;
        let y = renderable.pos.y;
        let parent = renderable.ancestor;
        while (parent && parent !== this.ancestor) {
            x += parent.pos.x;
            y += parent.pos.y;
            parent = parent.ancestor;
        }
        renderer.strokeRect(x + bounds.x, y + bounds.y, bounds.width, bounds.height);
    }
}

export default CollisionDebugOverlay;
