import { Stage, event } from "melonjs";

class responsiveStage extends Stage {
    #app;
    #layoutChildren = [];
    #onResize = () => this.refresh();

    onResetEvent(app) {
        this.#app = app;
   
        this.#resetWorldPosition();
        this.refresh();
        event.on(event.VIEWPORT_ONRESIZE, this.#onResize);
    }

    onDestroyEvent() {
        event.off(event.VIEWPORT_ONRESIZE, this.#onResize);
      
        this.#resetWorldPosition();
    }

    #resetWorldPosition() {
        const world = this.#app.world;
        if (world.pos.x !== 0 || world.pos.y !== 0) {
            world.pos.set(0, 0, world.pos.z);
        }
    }

    addLayoutChild(renderable, z) {
        this.#app.world.addChild(renderable, z);
        this.#layoutChildren.push(renderable);
    }

    refresh() {
        this.#layoutChildren.forEach((child) => this.#app.world.removeChildNow(child));
        this.#layoutChildren = [];
        this.layout(this.#app);
    }

    layout(app) {
      
    }
}

export default responsiveStage;
