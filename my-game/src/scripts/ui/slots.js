import { UIBaseElement, Sprite, Text } from "melonjs";
import { createWindowFrame } from "./windowFrame";
import { getIconAtlas } from "./atlas";

const GOLD = "#c9a86a";

const TOOLTIP_GAP = 6;
const TOOLTIP_WIDTH = 140;
const TOOLTIP_PADDING = 8;
const TOOLTIP_TITLE_SIZE = 13;
const TOOLTIP_STAT_SIZE = 11;
const TOOLTIP_STAT_GAP = 16;
const TOOLTIP_TITLE_GAP = 20;

let openTooltipSlot = null;

class slotButton extends UIBaseElement {
    #onClickCallback;
    #tooltipItem;
    #size;
    #tooltipChildren = [];

    constructor(x, y, size, iconRegion, onClick, tooltipItem) {
        super(x, y, size, size);
        this.#onClickCallback = onClick;
        this.#tooltipItem = tooltipItem ?? null;
        this.#size = size;
        this.isClickable = !!onClick;

        const [fill, frame] = createWindowFrame(0, 0, size, size);
        this.addChild(fill, 0);
        this.addChild(frame, 1);

        if (!iconRegion) {
            return;
        }

        const atlas = getIconAtlas();
        const { width: iw, height: ih } = atlas.getRegion(iconRegion);
        const scale = (size * 0.6) / Math.max(iw, ih);

        const icon = new Sprite(size / 2, size / 2, {
            image: atlas,
            region: iconRegion,
        });
        icon.scale(scale);
        icon.floating = false;
        this.addChild(icon, 2);
    }

    onOver(event) {
        if (this.#tooltipItem) {
            if (openTooltipSlot && openTooltipSlot !== this) {
                openTooltipSlot.#closeTooltip();
            }
            if (this.#tooltipChildren.length === 0) {
                this.#tooltipChildren = this.#buildTooltipChildren();
                this.#tooltipChildren.forEach((child, i) => this.addChild(child, 10 + i));
            }
            openTooltipSlot = this;
        }
        return super.onOver(event);
    }

    onOut(event) {
        this.#closeTooltip();
        if (openTooltipSlot === this) {
            openTooltipSlot = null;
        }
        return super.onOut(event);
    }

    onClick(event) {
        this.#onClickCallback?.();
        return false;
    }

    #closeTooltip() {
        this.#tooltipChildren.forEach((child) => this.removeChild(child));
        this.#tooltipChildren = [];
    }

    #buildTooltipChildren() {
        const children = [];
        const statCount = Object.keys(this.#tooltipItem.stats).length;
        const panelHeight = TOOLTIP_PADDING * 2 + TOOLTIP_TITLE_GAP + statCount * TOOLTIP_STAT_GAP;
        const panelX = this.#size + TOOLTIP_GAP;
        const panelY = 0;

        const [fill, frame] = createWindowFrame(panelX, panelY, TOOLTIP_WIDTH, panelHeight);
        children.push(fill, frame);

        const textX = panelX + TOOLTIP_PADDING;
        let lineY = panelY + TOOLTIP_PADDING;

        const title = new Text(textX, lineY, {
            font: "sans-serif",
            size: TOOLTIP_TITLE_SIZE,
            fillStyle: GOLD,
            textAlign: "left",
            textBaseline: "top",
            text: this.#tooltipItem.name,
        });
        title.floating = false;
        children.push(title);
        lineY += TOOLTIP_TITLE_GAP;

        for (const [stat, value] of Object.entries(this.#tooltipItem.stats)) {
            const line = new Text(textX, lineY, {
                font: "sans-serif",
                size: TOOLTIP_STAT_SIZE,
                fillStyle: "#dddddd",
                textAlign: "left",
                textBaseline: "top",
                text: `${stat}: ${value > 0 ? "+" : ""}${value}`,
            });
            line.floating = false;
            children.push(line);
            lineY += TOOLTIP_STAT_GAP;
        }

        return children;
    }
}

export function buildSlot(addChild, x, y, size, iconRegion, onClick, tooltipItem) {
    addChild(new slotButton(x, y, size, iconRegion, onClick, tooltipItem), 3);
}
