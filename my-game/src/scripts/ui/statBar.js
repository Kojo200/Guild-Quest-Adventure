import { UIBaseElement, NineSliceSprite } from "melonjs";
import { getBarAtlas } from "./atlas";

const FRAME_INSET_X = 3;
const FRAME_INSET_Y = 2;
const FILL_INSET_X = 3;
const FILL_INSET_Y = 1;
const FILL_PADDING = 2;

class statBar extends UIBaseElement {
    #width;
    #height;
    #fillRegion;
    #fill;

    constructor(x, y, width, height, fillRegion) {
        super(x, y, width, height);
        this.isClickable = false;
        this.#width = width;
        this.#height = height;
        this.#fillRegion = fillRegion;

        this.#rebuildFill(1);

        const frame = new NineSliceSprite(width / 2, height / 2, {
            image: getBarAtlas(),
            region: "bar_frame",
            width,
            height,
            insetx: FRAME_INSET_X,
            insety: FRAME_INSET_Y,
        });
        frame.floating = false;
        this.addChild(frame, 1);
    }

    setRatio(ratio) {
        this.#rebuildFill(Math.min(1, Math.max(0, ratio)));
    }

    #rebuildFill(ratio) {
        if (this.#fill) {
            this.removeChild(this.#fill);
        }
        const innerWidth = this.#width - FILL_PADDING * 2;
        const innerHeight = this.#height - FILL_PADDING * 2;
        const fillWidth = Math.max(1, innerWidth * ratio);

        this.#fill = new NineSliceSprite(FILL_PADDING + fillWidth / 2, this.#height / 2, {
            image: getBarAtlas(),
            region: this.#fillRegion,
            width: fillWidth,
            height: innerHeight,
            insetx: FILL_INSET_X,
            insety: FILL_INSET_Y,
        });
        this.#fill.floating = false;
        this.addChild(this.#fill, 0);
    }
}

export default statBar;
