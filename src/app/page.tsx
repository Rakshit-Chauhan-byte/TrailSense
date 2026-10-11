"use client";

import React, { useState, useEffect } from "react";
import { Quest, QuestDuration, QuestInterest, SavedQuest } from "@/types/quest";

const DURATIONS: { value: QuestDuration; label: string; sub: string }[] = [
  { value: 5, label: "5 Minutes", sub: "Quick breath" },
  { value: 10, label: "10 Minutes", sub: "Gentle stroll" },
  { value: 15, label: "15 Minutes", sub: "Deep immersion" },
];

const INTERESTS: {
  value: QuestInterest;
  icon: string;
  tagline: string;
  desc: string;
}[] = [
  {
    value: "Nature Observation",
    icon: "🌿",
    tagline: "Look Closer",
    desc: "Focus on foliage textures, bird calls, canopy patterns, and micro-details.",
  },
  {
    value: "Mindful Walking",
    icon: "🚶",
    tagline: "Ground Yourself",
    desc: "Tune into the rhythm of your strides, footfalls, breath, and open air.",
  },
  {
    value: "Discovery",
    icon: "🧭",
    tagline: "Find the Unseen",
    desc: "Discover hidden geometry, sun and shadow play, and subtle trail shifts.",
  },
];

const STORAGE_KEY = "trailsense_saved_quests_v1";

export default function HomePage() {
  const [selectedDuration, setSelectedDuration] = useState<QuestDuration>(10);
  const [selectedInterest, setSelectedInterest] =
    useState<QuestInterest>("Nature Observation");

  const [isLoading, setIsLoading] = useState(false);
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [completedActivities, setCompletedActivities] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [userObservation, setUserObservation] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [savedJournal, setSavedJournal] = useState<SavedQuest[]>([]);
  const [showJournal, setShowJournal] = useState(false);

  // Load past observations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedJournal(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load saved quests from localStorage", e);
    }
  }, []);

  const handleGenerateQuest = async () => {
    setIsLoading(true);
    setSaveSuccess(false);
    setUserObservation("");
    setCompletedActivities([false, false, false]);

    try {
      const res = await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: selectedDuration,
          interest: selectedInterest,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const questData: Quest = await res.json();
      setCurrentQuest(questData);
    } catch (err) {
      console.error("Failed to generate quest:", err);
      // Fallback in client if network fails
      setCurrentQuest({
        id: `client-fallback-${Date.now()}`,
        title: "Canopy & Micro-Worlds",
        description:
          "A gentle sensory journey to notice the subtle layers of life along your path without disturbing them.",
        activities: [
          "Observe three distinct leaf textures or patterns from the path without touching them.",
          "Pause for one full minute with eyes closed, identifying two distinct natural sounds.",
          "Spot a small creature or bird at a respectful distance and observe its movement.",
        ],
        duration: selectedDuration,
        interest: selectedInterest,
        isFallback: true,
        fallbackReason: "Network request failed to reach local API",
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivity = (index: number) => {
    setCompletedActivities((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const completedCount = completedActivities.filter(Boolean).length;
  const isQuestFullyCompleted = completedCount === 3;

  const handleSaveObservation = () => {
    if (!currentQuest) return;

    const newSavedQuest: SavedQuest = {
      ...currentQuest,
      completedAt: new Date().toISOString(),
      userObservation: userObservation.trim() || "No written observation recorded.",
    };

    const updatedJournal = [newSavedQuest, ...savedJournal];
    setSavedJournal(updatedJournal);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJournal));
      setSaveSuccess(true);
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  };

  const handleClearJournal = () => {
    if (confirm("Are you sure you want to clear your saved observations?")) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        setSavedJournal([]);
      } catch (e) {
        console.error("Failed to clear localStorage", e);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navigation / Brand */}
      <header className="border-b border-[#e2ddd1] bg-[#fbf9f4]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#173826] flex items-center justify-center text-cream-50 shadow-sm text-lg">
              🌲
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#173826] block leading-none">
                TrailSense
              </span>
              <span className="text-xs text-[#52796f] font-medium tracking-wide">
                Touch Grass Hackathon MVP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJournal(!showJournal)}
              className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full border border-[#d4ccc0] bg-white hover:bg-[#f4eee3] transition-colors text-[#24583b] flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              📖 Field Journal ({savedJournal.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f3ed] text-[#173826] text-xs font-semibold uppercase tracking-wider border border-[#b7dfc7]">
            <span>🌱</span> Step Outside • Unplug Your Mind
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0f2619] font-serif">
            TrailSense
          </h1>
          <p className="text-xl sm:text-2xl text-[#24583b] font-medium italic">
            &ldquo;Less scrolling. More exploring.&rdquo;
          </p>
          <p className="text-sm sm:text-base text-[#4a5d53] max-w-xl mx-auto leading-relaxed">
            Generate a personalized mindful micro-quest for your walk. Powered by local
            AI through Ollama, built entirely for sensory presence.
          </p>
        </div>

        {/* Quest Generator Form */}
        <section className="bg-white rounded-2xl border border-[#e2ddd1] p-5 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-[#f0ebe0] pb-3">
            <h2 className="text-lg font-bold text-[#173826] flex items-center gap-2">
              <span>🎯</span> Configure Your Micro-Quest
            </h2>
            <p className="text-xs sm:text-sm text-[#5c6e64]">
              Select how much time you have and what kind of awareness you wish to practice.
            </p>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#355344]">
              1. Choose Duration
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {DURATIONS.map((d) => {
                const isSelected = selectedDuration === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setSelectedDuration(d.value)}
                    className={`p-3 sm:p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-[#173826] border-[#173826] text-white shadow-md ring-2 ring-[#24583b]/30"
                        : "bg-[#fbf9f4] border-[#e2ddd1] text-[#2c4035] hover:bg-[#f4eee3] hover:border-[#cfc6b5]"
                    }`}
                  >
                    <span className="text-sm sm:text-base font-bold">
                      {d.label}
                    </span>
                    <span
                      className={`text-xs mt-0.5 ${
                        isSelected ? "text-[#bfe3cb]" : "text-[#6b7d73]"
                      }`}
                    >
                      {d.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#355344]">
              2. Choose Your Focus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INTERESTS.map((item) => {
                const isSelected = selectedInterest === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedInterest(item.value)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#f1f8f4] border-[#24583b] shadow-sm ring-2 ring-[#24583b]/20"
                        : "bg-[#fbf9f4] border-[#e2ddd1] hover:bg-[#f4eee3] hover:border-[#cfc6b5]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{item.icon}</span>
                        {isSelected && (
                          <span className="text-xs bg-[#24583b] text-white px-2 py-0.5 rounded-full font-semibold">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-sm sm:text-base text-[#173826]">
                        {item.value}
                      </div>
                      <div className="text-xs font-medium text-[#2d6a4f] mt-0.5">
                        {item.tagline}
                      </div>
                      <p className="text-xs text-[#52655b] mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#52796f] flex items-center gap-1.5">
              <span>🤖</span> Target Model:{" "}
              <code className="bg-[#f0ebe0] px-1.5 py-0.5 rounded text-[#173826] font-mono">
                gemma3:4b
              </code>{" "}
              (local Ollama)
            </div>

            <button
              type="button"
              onClick={handleGenerateQuest}
              disabled={isLoading}
              className={`w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading
                  ? "bg-[#52796f] text-white cursor-not-allowed opacity-80"
                  : "bg-[#173826] hover:bg-[#0f2619] text-white hover:shadow-lg active:scale-98"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Summoning Quest...</span>
                </>
              ) : (
                <>
                  <span>✨ Generate Quest</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Active Quest Presentation */}
        {currentQuest && (
          <section className="bg-white rounded-2xl border-2 border-[#24583b] p-6 sm:p-8 shadow-lg animate-fade-in space-y-6">
            {/* Header Badge & Fallback Warning */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0ebe0] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#173826] text-white">
                  ⏱️ {currentQuest.duration} Min
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f3ed] text-[#173826] border border-[#b7dfc7]">
                  🔍 {currentQuest.interest}
                </span>
              </div>

              {currentQuest.isFallback ? (
                <div className="bg-[#fef3c7] border border-[#f59e0b] text-[#92400e] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
                  <span>⚠️</span> Fallback quest — local AI unavailable
                </div>
              ) : (
                <div className="bg-[#dcfce7] border border-[#86efac] text-[#166534] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span>✨</span> Gemma 3 4B Generated
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2619] font-serif">
                {currentQuest.title}
              </h2>
              <p className="text-sm sm:text-base text-[#3d5347] leading-relaxed italic bg-[#fbf9f4] p-3.5 rounded-xl border border-[#ece4d6]">
                &ldquo;{currentQuest.description}&rdquo;
              </p>
            </div>

            {/* Completion Indicator */}
            <div className="space-y-2 bg-[#f4eee3] p-4 rounded-xl border border-[#e2ddd1]">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#173826]">
                <span>Progress: {completedCount} of 3 Activities</span>
                <span className="text-[#24583b]">
                  {Math.round((completedCount / 3) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-[#e3dcce] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#24583b] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(completedCount / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 3 Activities Checkboxes */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a5d53]">
                Your Three Trail Activities
              </h3>
              <div className="space-y-3">
                {currentQuest.activities.map((activity, idx) => {
                  const isChecked = completedActivities[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleActivity(idx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                        isChecked
                          ? "bg-[#f1f8f4] border-[#24583b] text-[#33463c]"
                          : "bg-[#fdfcf9] border-[#e2ddd1] hover:bg-[#f8f5ed] text-[#1c2a22]"
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Toggle activity ${idx + 1}`}
                        className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center border font-bold text-sm shrink-0 transition-all ${
                          isChecked
                            ? "bg-[#24583b] border-[#24583b] text-white animate-check"
                            : "bg-white border-[#cfc6b5]"
                        }`}
                      >
                        {isChecked ? "✓" : ""}
                      </button>
                      <div className="flex-1 text-sm sm:text-base leading-relaxed">
                        <span className="font-semibold text-[#173826] mr-1.5">
                          #{idx + 1}:
                        </span>
                        <span
                          className={isChecked ? "line-through opacity-85" : ""}
                        >
                          {activity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completion & Field Observation Form */}
            {isQuestFullyCompleted && (
              <div className="bg-[#f1f8f4] border-2 border-[#24583b] p-5 sm:p-6 rounded-xl space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-[#173826]">
                  <span className="text-2xl">🌿</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold">
                      Quest Completed! Take a deep breath.
                    </h3>
                    <p className="text-xs sm:text-sm text-[#3b5e4c]">
                      Record one observation before stepping back into your digital life.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="observation-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[#173826]"
                  >
                    Your Field Observation (Saved locally)
                  </label>
                  <textarea
                    id="observation-input"
                    rows={3}
                    value={userObservation}
                    onChange={(e) => setUserObservation(e.target.value)}
                    placeholder="e.g. I heard dry leaves swirling across the stones; the air smelled like damp moss after rain."
                    className="w-full p-3 rounded-lg border border-[#b7dfc7] bg-white text-sm text-[#1c2a22] focus:outline-none focus:ring-2 focus:ring-[#24583b] focus:border-transparent placeholder-[#8ca195]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveObservation}
                    className="px-5 py-2.5 rounded-lg bg-[#24583b] hover:bg-[#173826] text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>💾 Save to Field Journal</span>
                  </button>

                  {saveSuccess && (
                    <span className="text-xs font-bold text-[#166534] bg-[#dcfce7] px-3 py-1.5 rounded-md border border-[#86efac] flex items-center gap-1 animate-fade-in">
                      <span>✓</span> Saved to localStorage!
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Saved Field Journal Drawer / View */}
        {showJournal && (
          <section className="bg-white rounded-2xl border border-[#e2ddd1] p-5 sm:p-7 shadow-sm space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#f0ebe0] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#173826] flex items-center gap-2">
                  <span>📖</span> Your Field Journal
                </h2>
                <p className="text-xs text-[#5c6e64]">
                  Stored locally in your browser. No cloud, no tracking.
                </p>
              </div>

              {savedJournal.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearJournal}
                  className="text-xs text-[#dc2626] hover:underline font-medium cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {savedJournal.length === 0 ? (
              <div className="text-center py-8 text-[#6b7d73] space-y-2">
                <span className="text-3xl block">🍂</span>
                <p className="text-sm font-medium">Your journal is empty yet.</p>
                <p className="text-xs text-[#8ca195]">
                  Complete a quest and write your first observation to record it here!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedJournal.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#e2ddd1] bg-[#fbf9f4] space-y-2 text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-[#173826]">
                        {item.title}
                      </span>
                      <span className="text-[#6b7d73]">
                        {new Date(item.completedAt).toLocaleDateString()}{" "}
                        {new Date(item.completedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#52796f]">
                      <span>⏱️ {item.duration} min</span>
                      <span>•</span>
                      <span>{item.interest}</span>
                      {item.isFallback && <span>• (Curated Fallback)</span>}
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#e8e0d1] text-xs sm:text-sm text-[#2c4035] italic">
                      &ldquo;{item.userObservation}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Safety Guidelines Card */}
        <section className="bg-[#f7f4ec] rounded-2xl border border-[#e2ddd1] p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#173826]">
            <span className="text-xl">🛡️</span>
            <h2 className="text-base font-bold">TrailSense Safety Directives</h2>
          </div>
          <p className="text-xs text-[#52655b] leading-relaxed">
            Every quest is strictly filtered to preserve both your personal safety and
            natural habitats:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-[#2c4035]">
            <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-[#e5dfd4]">
              <span className="text-sm">🚫</span>
              <div>
                <strong>Hands Off Wildlife:</strong> Never touch, handle, or disturb
                animals, insects, or nesting areas.
              </div>
            </div>
            <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-[#e5dfd4]">
              <span className="text-sm">🚫</span>
              <div>
                <strong>No Foraging or Eating:</strong> Never consume unknown plants,
                wild berries, or mushrooms.
              </div>
            </div>
            <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-[#e5dfd4]">
              <span className="text-sm">🥾</span>
              <div>
                <strong>Stay on Established Paths:</strong> Remain on public sidewalks
                or marked trails. Avoid cliffs and loose terrain.
              </div>
            </div>
            <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-[#e5dfd4]">
              <span className="text-sm">🛑</span>
              <div>
                <strong>Respect Boundaries:</strong> Never trespass on private property
                or enter closed ecological sanctuaries.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2ddd1] bg-[#fbf9f4] py-6 px-4 text-center text-xs text-[#6b7d73] space-y-1">
        <p className="font-medium text-[#24583b]">
          TrailSense • Touch Grass Open Source AI Hackathon MVP
        </p>
        <p>
          Local AI Model: <span className="font-mono">gemma3:4b</span> via Ollama (127.0.0.1:11434). Zero external trackers.
        </p>
      </footer>
    </div>
  );
}
