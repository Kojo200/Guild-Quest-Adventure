import { Text } from "melonjs";
import { createWindowFrame } from "./windowFrame";
import { buildSlot } from "./slots";
import { buildInventoryView } from "./inventory";
import actionButton from "./actionButton";
import { getItem } from "../items";
import { SLOT_ICON } from "../equipment";

const MARGIN = 20;
const GOLD = "#c9a86a";

const GEAR_WIDTH = 310;
const GEAR_HEIGHT = 300;
const GEAR_TITLE_AREA = 26;

const EQUIP_COLUMN_WIDTH = 150;

const GEAR_SLOT_SIZE = 36;
const GEAR_SLOT_GAP = 6;

const INVENTORY_BUTTON_WIDTH = 60;
const INVENTORY_BUTTON_HEIGHT = 22;
const INVENTORY_BUTTON_MARGIN = 6;

export function buildGearBox(addChild, width, height, viewState) {
    const { inventoryOpen, equipped, inventoryCategory, lockedCategory } = viewState;
    const { onToggleInventory, onSlotClick, onSelectCategory, onSelectItem } = viewState;

    const x = width - GEAR_WIDTH - MARGIN;
    const y = height - GEAR_HEIGHT - MARGIN;

    const [fill, frame] = createWindowFrame(x, y, GEAR_WIDTH, GEAR_HEIGHT);
    addChild(fill, 1);
    addChild(frame, 2);

    addChild(
        new Text(x + GEAR_SLOT_GAP, y + GEAR_SLOT_GAP, {
            font: "sans-serif",
            size: 12,
            fillStyle: GOLD,
            textAlign: "left",
            textBaseline: "top",
            text: inventoryOpen ? "Inventory" : "Gear",
        }),
        3,
    );

    addChild(
        new actionButton(
            x + GEAR_WIDTH - INVENTORY_BUTTON_WIDTH - INVENTORY_BUTTON_MARGIN,
            y + INVENTORY_BUTTON_MARGIN,
            INVENTORY_BUTTON_WIDTH,
            INVENTORY_BUTTON_HEIGHT,
            inventoryOpen ? "Back" : "Inv",
            onToggleInventory,
        ),
        5,
    );

    if (inventoryOpen) {
        buildInventoryView(
            addChild,
            x,
            y,
            GEAR_WIDTH,
            GEAR_TITLE_AREA,
            inventoryCategory,
            lockedCategory,
            onSelectCategory,
            onSelectItem,
        );
    } else {
        buildEquipmentSlots(addChild, x, y, equipped, onSlotClick);
    }
}

function buildEquipmentSlots(addChild, x, y, equipped, onSlotClick) {
    const step = GEAR_SLOT_SIZE + GEAR_SLOT_GAP;
    const rowY = y + GEAR_TITLE_AREA;
    const centerSlotX = x + (EQUIP_COLUMN_WIDTH - GEAR_SLOT_SIZE) / 2;
    const tripleRowStartX = x + (EQUIP_COLUMN_WIDTH - (GEAR_SLOT_SIZE * 3 + GEAR_SLOT_GAP * 2)) / 2;

    const slot = (slotKey, sx, sy) => {
        const item = getItem(equipped[slotKey]);
        const icon = item ? item.icon : SLOT_ICON[slotKey];
        buildSlot(addChild, sx, sy, GEAR_SLOT_SIZE, icon, () => onSlotClick(slotKey), item ?? undefined);
    };

    slot("helmet", centerSlotX, rowY);
    slot("accessory1", tripleRowStartX, rowY + step);
    slot("chest", tripleRowStartX + step, rowY + step);
    slot("weapon", tripleRowStartX + step * 2, rowY + step);
    slot("accessory2", tripleRowStartX, rowY + step * 2);
    slot("legs", centerSlotX, rowY + step * 2);
    slot("boots", centerSlotX, rowY + step * 3);
}
