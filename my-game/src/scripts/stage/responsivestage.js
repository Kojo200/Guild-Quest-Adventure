import { Stage, event } from "melonjs";

/**
 * A Stage that automatically rebuilds its visual layout whenever the
 * viewport is resized -- e.g. entering/exiting fullscreen under the
 * "flex" scaling method, which resizes the game's own coordinate space
 * rather than just stretching it visually.
 *
 * Subclasses implement `layout(app)` and add every child through
 * `this.addLayoutChild(renderable, z)` instead of `app.world.addChild`
 * directly. This base class removes and rebuilds those children on
 * every resize, so positions computed from `app.viewport.width/height`
 * never go stale.
 *
 * Subclasses that also need one-time setup/teardown unrelated to layout
 * (timers, input bindings, raw event listeners) can still override
 * `onResetEvent` / `onDestroyEvent` -- just call the `super` version too.
 */
class responsiveStage extends Stage {
  #app;
  #layoutChildren = [];
  #onResize = () => this.refresh();

  /**
   * @param {import("melonjs").Application} app
   */
  onResetEvent(app) {
    this.#app = app;
    this.refresh();
    event.on(event.VIEWPORT_ONRESIZE, this.#onResize);
  }

  onDestroyEvent() {
    event.off(event.VIEWPORT_ONRESIZE, this.#onResize);
  }

  /**
   * add a renderable that belongs to the current layout. Call this
   * instead of `app.world.addChild` from within `layout()`.
   */
  addLayoutChild(renderable, z) {
    this.#app.world.addChild(renderable, z);
    this.#layoutChildren.push(renderable);
  }

  /**
   * force a full layout rebuild -- call after anything that changes
   * what `layout()` should draw (e.g. switching a settings tab).
   * Also called automatically on viewport resize.
   */
  refresh() {
    this.#layoutChildren.forEach((child) =>
      this.#app.world.removeChildNow(child),
    );
    this.#layoutChildren = [];
    this.layout(this.#app);
  }

  /**
   * override in subclasses: (re)build every visual child via
   * `this.addLayoutChild(...)`. Called on first load, on every
   * viewport resize, and whenever a subclass calls `this.refresh()`.
   * @param {import("melonjs").Application} app
   */
  layout(app) {
    // no-op by default
  }
}

export default responsiveStage;
