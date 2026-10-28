import { Text } from "melonjs";
import { createWindowFrame } from "./windowFrame";

const MARGIN = 20;

const TRACKER_WIDTH = 270;
const TRACKER_HEIGHT = 58;

const BANNER_HEIGHT = 40;
const BANNER_MAX_WIDTH = 560;

const GOLD = "#c9a86a";
const WHITE = "#ffffff";

export function buildQuestHud(addChild, width, height) {
    // --- tracker ---
    const trackerX = MARGIN;
    const trackerY = MARGIN;
    const [trackerFill, trackerFrame] = createWindowFrame(trackerX, trackerY, TRACKER_WIDTH, TRACKER_HEIGHT);
    const trackerTitle = new Text(trackerX + 12, trackerY + 19, {
        font: "sans-serif",
        size: 13,
        fillStyle: GOLD,
        textAlign: "left",
        textBaseline: "middle",
        text: " ",
    });
    const trackerLine = new Text(trackerX + 12, trackerY + 40, {
        font: "sans-serif",
        size: 12,
        fillStyle: WHITE,
        textAlign: "left",
        textBaseline: "middle",
        text: " ",
    });
    const trackerParts = [trackerFill, trackerFrame, trackerTitle, trackerLine];
    addChild(trackerFill, 6);
    addChild(trackerFrame, 7);
    addChild(trackerTitle, 8);
    addChild(trackerLine, 8);

    // --- banner ---
    const bannerWidth = Math.min(BANNER_MAX_WIDTH, width - MARGIN * 2);
    const bannerX = (width - bannerWidth) / 2;
    const bannerY = height - MARGIN - BANNER_HEIGHT;
    const [bannerFill, bannerFrame] = createWindowFrame(bannerX, bannerY, bannerWidth, BANNER_HEIGHT);
    const bannerText = new Text(bannerX + bannerWidth / 2, bannerY + BANNER_HEIGHT / 2, {
        font: "sans-serif",
        size: 14,
        fillStyle: WHITE,
        textAlign: "center",
        textBaseline: "middle",
        text: " ",
    });
    const bannerParts = [bannerFill, bannerFrame, bannerText];
    addChild(bannerFill, 6);
    addChild(bannerFrame, 7);
    addChild(bannerText, 8);

    const show = (parts, visible) => parts.forEach((part) => part.setOpacity(visible ? 1 : 0));
    show(trackerParts, false);
    show(bannerParts, false);

    // what's currently on screen
    let shownTitle = null;
    let shownLine = null;
    let shownBanner = null;

    return {
        setTracker(summary) {
            if (!summary) {
                if (shownTitle !== null) {
                    show(trackerParts, false);
                    shownTitle = shownLine = null;
                }
                return;
            }
            if (shownTitle === null) {
                show(trackerParts, true);
            }
            if (summary.title !== shownTitle) {
                trackerTitle.setText(summary.title);
                shownTitle = summary.title;
            }
            if (summary.line !== shownLine) {
                trackerLine.setText(summary.line);
                shownLine = summary.line;
            }
        },

        setBanner(text) {
            if (!text) {
                if (shownBanner !== null) {
                    show(bannerParts, false);
                    shownBanner = null;
                }
                return;
            }
            if (shownBanner === null) {
                show(bannerParts, true);
            }
            if (text !== shownBanner) {
                bannerText.setText(text);
                shownBanner = text;
            }
        },
    };
}
