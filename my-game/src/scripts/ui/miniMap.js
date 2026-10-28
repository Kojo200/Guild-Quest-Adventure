import { Text, Renderable, Sprite } from "melonjs";
import { createWindowFrame } from "./windowFrame";

const MARGIN = 20;
const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 140;
const MARKER_SIZE = 5;
const MARKER_COLOR = "#e0473c";

class MinimapMarker extends Renderable {
    #player;
    #bounds;
    #panelX;
    #panelY;

    constructor(player, bounds, panelX, panelY) {
        super(panelX, panelY, MARKER_SIZE, MARKER_SIZE);
        this.#player = player;
        this.#bounds = bounds;
        this.#panelX = panelX;
        this.#panelY = panelY;
    }

    update() {
        const ratioX = (this.#player.pos.x - this.#bounds.min.x) / this.#bounds.width;
        const ratioY = (this.#player.pos.y - this.#bounds.min.y) / this.#bounds.height;
        this.pos.x = this.#panelX + ratioX * MINIMAP_WIDTH - MARKER_SIZE / 2;
        this.pos.y = this.#panelY + ratioY * MINIMAP_HEIGHT - MARKER_SIZE / 2;
        return true;
    }

    draw(renderer) {
        renderer.setColor(MARKER_COLOR);
        renderer.fillRect(this.pos.x, this.pos.y, MARKER_SIZE, MARKER_SIZE);
    }
}

export function buildMinimap(addChild, width, player, bounds) {
    const x = width - MINIMAP_WIDTH - MARGIN;
    const y = MARGIN;

    const terrain = new Sprite(x + MINIMAP_WIDTH / 2, y + MINIMAP_HEIGHT / 2, { image: "minimap_terrain" });
    addChild(terrain, 1);

    const [, frame] = createWindowFrame(x, y, MINIMAP_WIDTH, MINIMAP_HEIGHT);
    addChild(frame, 2);

    if (player && bounds) {
        addChild(new MinimapMarker(player, bounds, x, y), 3);
    } else {

        addChild(
            new Text(x + MINIMAP_WIDTH / 2, y + MINIMAP_HEIGHT / 2, {
                font: "sans-serif",
                size: 12,
                fillStyle: "#666666",
                textAlign: "center",
                textBaseline: "middle",
                text: "Map",
            }),
            3,
        );
    }
}
