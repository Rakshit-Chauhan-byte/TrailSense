import { NextRequest, NextResponse } from "next/server";
import { Quest, QuestDuration, QuestInterest } from "@/types/quest";
import { getFallbackQuest } from "@/lib/fallbacks";

const VALID_DURATIONS: QuestDuration[] = [5, 10, 15];
const VALID_INTERESTS: QuestInterest[] = [
  "Nature Observation",
  "Mindful Walking",
  "Discovery"
];

export async function POST(request: NextRequest) {
  let duration: QuestDuration = 10;
  let interest: QuestInterest = "Nature Observation";

  try {
    const body = await request.json().catch(() => ({}));
    if (VALID_DURATIONS.includes(body.duration)) {
      duration = body.duration;
    }
    if (VALID_INTERESTS.includes(body.interest)) {
      interest = body.interest;
    }
  } catch {
    // defaults are kept
  }

  const model = process.env.OLLAMA_MODEL || "gemma3:4b";
  const ollamaEndpoint = "http://127.0.0.1:11434/api/generate";

  const prompt = `You are TrailSense, an outdoor mindfulness and nature exploration guide for the Touch Grass hackathon.
Generate an engaging outdoor micro-quest for a user taking a ${duration}-minute walk focused on "${interest}".

STRICT SAFETY MANDATES:
1. Never suggest touching, capturing, or handling any wildlife, animals, or nests.
2. Never suggest eating, tasting, or foraging wild plants, berries, or mushrooms.
3. Never suggest leaving established public paths or walking into hazardous or restricted areas.
4. Keep all tasks safe, gentle, and observational.

You MUST reply with ONLY valid raw JSON adhering to this exact schema (no prose outside JSON):
{
  "title": "A short, evocative quest title (3-6 words)",
  "description": "An inspiring 1-2 sentence description setting an open, mindful tone.",
  "activities": [
    "First safe observational action (1-2 sentences)",
    "Second safe mindfulness or sensory action (1-2 sentences)",
    "Third safe reflection or natural detail discovery action (1-2 sentences)"
  ]
}`;

  try {
    // 8-second timeout to prevent blocking if Ollama is unresponsive
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const ollamaResponse = await fetch(ollamaEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: "json"
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama responded with HTTP ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    const rawText = data.response;

    if (!rawText || typeof rawText !== "string") {
      throw new Error("Empty response received from Ollama");
    }

    // Clean potential markdown fencing if present
    const cleanedText = rawText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    if (
      typeof parsed.title === "string" &&
      parsed.title.trim().length > 0 &&
      typeof parsed.description === "string" &&
      parsed.description.trim().length > 0 &&
      Array.isArray(parsed.activities) &&
      parsed.activities.length === 3 &&
      parsed.activities.every((a: unknown) => typeof a === "string" && a.trim().length > 0)
    ) {
      const generatedQuest: Quest = {
        id: `quest-${Date.now()}`,
        title: parsed.title.trim(),
        description: parsed.description.trim(),
        activities: parsed.activities.map((a: string) => a.trim()),
        duration,
        interest,
        isFallback: false,
        createdAt: new Date().toISOString()
      };

      return NextResponse.json(generatedQuest);
    } else {
      throw new Error("Model output did not match expected schema with 3 safe activities");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Service unavailable";
    console.warn(`[TrailSense] Using fallback quest: ${message}`);
    const fallbackQuest = getFallbackQuest(duration, interest, message);
    return NextResponse.json(fallbackQuest);
  }
}
