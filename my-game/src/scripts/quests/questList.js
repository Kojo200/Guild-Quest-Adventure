import { registerQuest, questRegistry } from "./questData";
import tutorialQuest from "./tutorialQuest";

const QUEST_DEFINITIONS = [tutorialQuest];

QUEST_DEFINITIONS.forEach(registerQuest);

questRegistry.validate();
