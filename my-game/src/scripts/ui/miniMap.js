import { Text } from "melonjs";
import { createWindowFrame } from "./windowFrame";

const MARGIN = 20;
const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 140;

export function buildMinimap(addChild, width) {
    const x = width - MINIMAP_WIDTH - MARGIN;
    const y = MARGIN;

    const [fill, frame] = createWindowFrame(x, y, MINIMAP_WIDTH, MINIMAP_HEIGHT);
    addChild(fill, 1);
    addChild(frame, 2);

    // TODO: replace with a real rendered map once the world exists
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
