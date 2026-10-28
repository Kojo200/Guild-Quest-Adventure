import { defineQuest } from "./questData";

export const TUTORIAL_QUEST_ID = "tutorial_find_the_boat";

export const TUTORIAL_TARGETS = Object.freeze({
    SIGNPOST: "tutorial_signpost",
    DOCK: "tutorial_dock",
    BOAT: "tutorial_boat",
});

export const COMBAT_TUTORIAL_ENABLED = false;

export function buildTutorialQuest({ combat = COMBAT_TUTORIAL_ENABLED } = {}) {
    const combatSteps = [
        {
            id: "swing",
            type: "custom",
            target: "tutorial_swing",
            count: 3,
            description: "Swing your weapon",
            hint: "{attack} to attack",
        },
        {
            id: "dummy",
            type: "kill",
            target: "training_dummy",
            description: "Defeat the training dummy",
            hint: "{attack} to attack the training dummy",
        },
    ];

    return {
        id: TUTORIAL_QUEST_ID,
        title: "Find the Boat",
        description: "Learn the basics, then make your way to the small boat.",
        sequential: true,
        rewards: { xp: 50 },
        objectives: [
            {
                id: "move",
                type: "custom",
                target: "walk_tile",
                count: 6,
                description: "Walk around",
                hint: "Use {moveUp} {moveLeft} {moveDown} {moveRight} to move",
            },
            {
                id: "signpost",
                type: "interact",
                target: TUTORIAL_TARGETS.SIGNPOST,
                description: "Read the signpost",
                hint: "Walk up to the signpost and press {interact}",
            },
            ...(combat ? combatSteps : []),
            {
                id: "dock",
                type: "reach",
                target: TUTORIAL_TARGETS.DOCK,
                description: "Follow the path to the dock",
                hint: "Follow the path to the dock",
            },
            {
                id: "boat",
                type: "reach",
                target: TUTORIAL_TARGETS.BOAT,
                description: "Get to the small boat",
                hint: "Make your way to the small boat",
            },
        ],
    };
}

export default defineQuest(buildTutorialQuest());
