import { Quest, QuestDuration, QuestInterest } from "@/types/quest";

export interface FallbackTemplate {
  id: string;
  title: string;
  description: string;
  activities: [string, string, string];
}

export const FALLBACK_QUEST_1: FallbackTemplate = {
  id: "fallback-canopy-microworlds",
  title: "Canopy & Micro-Worlds",
  description: "A gentle sensory journey to notice the subtle layers of foliage, bark, and quiet life along your path.",
  activities: [
    "Observe three distinct leaf textures or bark patterns from the marked path without touching or plucking them.",
    "Pause for one full minute in place with eyes soft or closed, mentally identifying two distinct natural sounds.",
    "Spot a bird or pollinator in the branches above and watch its movements quietly from a respectful distance."
  ]
};

export const FALLBACK_QUEST_2: FallbackTemplate = {
  id: "fallback-rhythm-ground",
  title: "Rhythm & Ground Awareness",
  description: "Ground your awareness into the surface beneath your footsteps and the natural light filtering through the air.",
  activities: [
    "Count 40 mindful steps along the trail, paying close attention to how the ground feels beneath your shoes.",
    "Find where sunlight and shadows create contrast on the trail or tree trunks, and note the temperature difference.",
    "Locate a naturally repeating shape or symmetry—such as branch bifurcations or stone contours—without leaving the walkway."
  ]
};

export const BUNDLED_FALLBACK_QUESTS = [FALLBACK_QUEST_1, FALLBACK_QUEST_2] as const;

export function getFallbackQuest(
  duration: QuestDuration = 10,
  interest: QuestInterest = "Nature Observation",
  reason: string = "Local AI service unreachable"
): Quest {
  // Alternate or select fallback quest based on interest/duration
  const template = interest === "Mindful Walking" ? FALLBACK_QUEST_2 : FALLBACK_QUEST_1;

  return {
    id: `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: template.title,
    description: template.description,
    activities: [...template.activities],
    duration,
    interest,
    isFallback: true,
    fallbackReason: reason,
    createdAt: new Date().toISOString()
  };
}
