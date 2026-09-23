import { buildSlot } from "./slots";
import actionButton from "./actionButton";
import { CATEGORIES, ITEMS } from "../items";

const TAB_WIDTH = 72;
const TAB_HEIGHT = 20;
const TAB_GAP = 4;
const TAB_COLS = 3;

const SLOT_SIZE = 32;
const SLOT_GAP = 4;
const COLS = 6;
const ROWS = 5;

export const ALL_CATEGORY = "all";
const TAB_CATEGORIES = [ALL_CATEGORY, ...CATEGORIES];

const CATEGORY_LABELS = {
    all: "All",
    consumables: "Consum.",
    weapons: "Weapons",
    accessories: "Access.",
    helmets: "Helmets",
    boots: "Boots",
    legs: "Legs",
    chest: "Chest",
    misc: "Misc",
};

export function buildInventoryView(
    addChild,
    boxX,
    boxY,
    boxWidth,
    topOffset,
    activeCategory,
    lockedCategory,
    onSelectCategory,
    onSelectItem,
) {
    const category = lockedCategory ?? activeCategory;
    let gridTop = topOffset;

    if (!lockedCategory) {
        const totalTabsWidth = TAB_COLS * TAB_WIDTH + (TAB_COLS - 1) * TAB_GAP;
        const tabsX = boxX + (boxWidth - totalTabsWidth) / 2;
        const tabRows = Math.ceil(TAB_CATEGORIES.length / TAB_COLS);
        TAB_CATEGORIES.forEach((cat, i) => {
            const col = i % TAB_COLS;
            const row = Math.floor(i / TAB_COLS);
            const tx = tabsX + col * (TAB_WIDTH + TAB_GAP);
            const ty = boxY + topOffset + row * (TAB_HEIGHT + TAB_GAP);
            addChild(
                new actionButton(tx, ty, TAB_WIDTH, TAB_HEIGHT, CATEGORY_LABELS[cat] ?? cat, () => onSelectCategory(cat)),
                5,
            );
        });
        gridTop = topOffset + tabRows * (TAB_HEIGHT + TAB_GAP) + 6;
    }

    const items = category === ALL_CATEGORY ? CATEGORIES.flatMap((cat) => ITEMS[cat] ?? []) : (ITEMS[category] ?? []);
    const step = SLOT_SIZE + SLOT_GAP;
    const gridWidth = COLS * SLOT_SIZE + (COLS - 1) * SLOT_GAP;
    const gridX = boxX + (boxWidth - gridWidth) / 2;
    const gridY = boxY + gridTop;

    for (let i = 0; i < COLS * ROWS; i++) {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const item = items[i];
        const sx = gridX + col * step;
        const sy = gridY + row * step;
        if (item) {
            const onClick = lockedCategory ? () => onSelectItem(item.id) : undefined;
            buildSlot(addChild, sx, sy, SLOT_SIZE, item.icon, onClick);
        } else {
            buildSlot(addChild, sx, sy, SLOT_SIZE);
        }
    }
}
