export type QuestDuration = 5 | 10 | 15;

export type QuestInterest = "Nature Observation" | "Mindful Walking" | "Discovery";

export interface Quest {
  id: string;
  title: string;
  description: string;
  activities: string[];
  duration: QuestDuration;
  interest: QuestInterest;
  isFallback: boolean;
  fallbackReason?: string;
  createdAt: string;
}

export interface SavedQuest extends Quest {
  completedAt: string;
  userObservation: string;
}
