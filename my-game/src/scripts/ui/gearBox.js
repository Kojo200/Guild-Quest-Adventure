import { Text } from "melonjs";
import { createWindowFrame } from "./windowFrame";
import { buildSlot } from "./slots";
import { buildInventoryView } from "./inventory";
import actionButton from "./actionButton";
import { getItem } from "../items";
import { SLOT_ICON } from "../equipment";

const MARGIN = 20;
const GOLD = "#c9a86a";

const EQUIP_WIDTH = 180;
const INVENTORY_WIDTH = 310;
const EQUIP_HEIGHT = 200;
const INVENTORY_HEIGHT = 260;
const GEAR_TITLE_AREA = 26;

const EQUIP_COLUMN_WIDTH = 150;

const GEAR_SLOT_SIZE = 32;
const GEAR_SLOT_GAP = 6;

const INVENTORY_BUTTON_WIDTH = 60;
const INVENTORY_BUTTON_HEIGHT = 22;
const INVENTORY_BUTTON_MARGIN = 6;

function gearBoxOrigin(width, height) {
    return { right: width - MARGIN, top: height - INVENTORY_HEIGHT - MARGIN };
}

export function buildGearBoxChrome(addChild, width, height, onToggleInventory) {
    const { right, top } = gearBoxOrigin(width, height);

    const titleText = new Text(right - INVENTORY_WIDTH + GEAR_SLOT_GAP, top + GEAR_SLOT_GAP, {
        font: "sans-serif",
        size: 12,
        fillStyle: GOLD,
        textAlign: "left",
        textBaseline: "top",
        text: "Gear",
    });
    addChild(titleText, 3);

    const invButton = new actionButton(
        right - INVENTORY_BUTTON_WIDTH - INVENTORY_BUTTON_MARGIN,
        top + INVENTORY_BUTTON_MARGIN,
        INVENTORY_BUTTON_WIDTH,
        INVENTORY_BUTTON_HEIGHT,
        "Inv",
        onToggleInventory,
    );
    addChild(invButton, 5);

    return { titleText, invButton };
}

export function buildGearBoxContent(addChild, width, height, viewState, chrome) {
    const { inventoryOpen, equipped, inventoryCategory, lockedCategory } = viewState;
    const { onSlotClick, onSelectCategory, onSelectItem } = viewState;

    const { right, top } = gearBoxOrigin(width, height);
    const boxWidth = inventoryOpen ? INVENTORY_WIDTH : EQUIP_WIDTH;
    const boxHeight = inventoryOpen ? INVENTORY_HEIGHT : EQUIP_HEIGHT;
    const x = right - boxWidth;
    const y = top;

    chrome.titleText.pos.x = x + GEAR_SLOT_GAP;

    const [fill, frame] = createWindowFrame(x, y, boxWidth, boxHeight);
    addChild(fill, 1);
    addChild(frame, 2);

    if (inventoryOpen) {
        buildInventoryView(
            addChild,
            x,
            y,
            boxWidth,
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
