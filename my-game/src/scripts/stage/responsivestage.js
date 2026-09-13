import { Stage, event } from "melonjs";

class responsiveStage extends Stage {
  #app;
  #layoutChildren = [];
  #onResize = () => this.refresh();

  onResetEvent(app) {
    this.#app = app;
    this.refresh();
    event.on(event.VIEWPORT_ONRESIZE, this.#onResize);
  }

  onDestroyEvent() {
    event.off(event.VIEWPORT_ONRESIZE, this.#onResize);
  }

  addLayoutChild(renderable, z) {
    this.#app.world.addChild(renderable, z);
    this.#layoutChildren.push(renderable);
  }

  refresh() {
    this.#layoutChildren.forEach((child) =>
      this.#app.world.removeChildNow(child),
    );
    this.#layoutChildren = [];
    this.layout(this.#app);
  }

  layout(app) {
  }
}

export default responsiveStage;
