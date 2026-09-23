export const CATEGORIES = [
    "consumables",
    "weapons",
    "accessories",
    "helmets",
    "boots",
    "legs",
    "chest",
    "misc",
];

export const SLOT_CATEGORY = {
    helmet: "helmets",
    chest: "chest",
    weapon: "weapons",
    accessory1: "accessories",
    accessory2: "accessories",
    legs: "legs",
    boots: "boots",
};

export const ITEMS = {
    helmets: [
        { id: "helmet_iron", name: "Iron Helm", icon: "icon_helmet", stats: { Defense: 4 } },
        { id: "helmet_steel", name: "Steel Helm", icon: "icon_helmet", stats: { Defense: 7, Weight: -1 } },
    ],
    chest: [
        { id: "chest_leather", name: "Leather Vest", icon: "icon_chest", stats: { Defense: 5 } },
        { id: "chest_chain", name: "Chainmail", icon: "icon_chest", stats: { Defense: 9, Weight: -2 } },
    ],
    weapons: [
        { id: "weapon_dagger", name: "Rusty Dagger", icon: "icon_weapon", stats: { Attack: 3, Speed: 1 } },
        { id: "weapon_sword", name: "Steel Sword", icon: "icon_weapon", stats: { Attack: 8 } },
    ],
    accessories: [
        { id: "acc_ring", name: "Copper Ring", icon: "icon_ring", stats: { Magic: 2 } },
        { id: "acc_gloves", name: "Leather Gloves", icon: "icon_gloves", stats: { Speed: 2 } },
    ],
    legs: [
        { id: "legs_cloth", name: "Cloth Pants", icon: "icon_legs", stats: { Defense: 2 } },
        { id: "legs_plate", name: "Plate Greaves", icon: "icon_legs", stats: { Defense: 6, Speed: -1 } },
    ],
    boots: [
        { id: "boots_worn", name: "Worn Boots", icon: "icon_boots", stats: { Speed: 3 } },
        { id: "boots_steel", name: "Steel Boots", icon: "icon_boots", stats: { Defense: 3, Speed: -1 } },
    ],
    consumables: [
        { id: "potion_health", name: "Health Potion", icon: null, stats: { Heal: 20 } },
        { id: "potion_mana", name: "Mana Potion", icon: null, stats: { Restore: 15 } },
    ],
    misc: [
        { id: "misc_key", name: "Old Key", icon: null, stats: {} },
    ],
};

export function getItem(id) {
    if (!id) {
        return null;
    }
    for (const category of CATEGORIES) {
        const found = ITEMS[category]?.find((item) => item.id === id);
        if (found) {
            return found;
        }
    }
    return null;
}
