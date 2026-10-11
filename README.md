# 🌲 TrailSense

> *"Less scrolling. More exploring."*  
> An open-source AI micro-quest companion built for the **Touch Grass** hackathon.

---

## 🧭 What is TrailSense?

TrailSense generates short, mindful outdoor quests designed to help people disconnect from digital feeds and re-engage with the physical world. Instead of complex maps, chatbots, or screen-heavy apps, TrailSense delivers a clean, focused 3-activity outdoor quest tailored to your available time and focus.

---

## ✨ Features

- **⏱️ Flexible Durations**: Choose **5**, **10**, or **15** minutes.
- **🌿 3 Mindful Interests**:
  - **Nature Observation**: Micro-details, foliage textures, bird calls, and canopy shifts.
  - **Mindful Walking**: Grounding footfalls, cadence, posture, and spatial awareness.
  - **Discovery**: Natural geometry, shadow transitions, and hidden textures along trails.
- **🤖 Local AI with Gemma 3 4B**: Connects directly to local Ollama at `http://127.0.0.1:11434/api/generate` with zero external cloud dependencies.
- **🛡️ Curated Offline Fallbacks**: Seamlessly serves rich, vetted fallback quests if Ollama is offline or returns unexpected data, clearly labeled as `"Fallback quest — local AI unavailable"`.
- **✅ Interactive Completion**: 3 accessible task checkboxes with live progress indicators.
- **📖 Local Field Journal**: Write and store personal field observations safely in browser `localStorage`.
- **🌿 Leave No Trace & Safety Safeguards**: Built-in prompts and guidelines strictly forbidding touching wildlife, foraging unknown flora/fungi, or leaving public paths.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Forest-green & warm-cream theme)
- **Local AI**: Gemma 3 4B via [Ollama](https://ollama.ai) (`OLLAMA_MODEL=gemma3:4b`)
- **Storage**: Client-side `localStorage` (No databases or authentication required)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org) v18+ (tested on Node v24)
- (Optional for AI generation) [Ollama](https://ollama.ai) installed with `gemma3:4b`

### 2. Setup & Installation

Clone or enter the project directory and install dependencies:
```bash
npm install
```

### 3. (Optional) Run Local Gemma 3 with Ollama

If you wish to test with local AI generation:
```bash
# Pull the Gemma 3 4B model
ollama pull gemma3:4b

# Run the Ollama server (listens on http://127.0.0.1:11434)
ollama serve
```

> **Note**: If Ollama is not running, TrailSense gracefully serves curated fallback quests without errors or broken UI states.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Instructions

1. **Verify Fallback Behavior**:
   - Ensure Ollama is not running.
   - Select **5 Minutes** and **Discovery**, then click **Generate Quest**.
   - Verify the `"⚠️ Fallback quest — local AI unavailable"` banner is clearly displayed.
2. **Complete Activities**:
   - Click each of the three activity checkboxes.
   - Verify the progress bar updates from `0%` to `100%`.
3. **Record Field Observation**:
   - When all activities are checked, the field observation form appears.
   - Type an observation and click **Save to Field Journal**.
4. **Inspect Local Storage / Field Journal**:
   - Click **Field Journal** in the top navigation bar.
   - Verify your completed quest and observation are persisted.
5. **TypeScript Check**:
   ```bash
   npx tsc --noEmit
   ```

---

## 🛡️ Safety & Ethics

TrailSense quests follow strict outdoor ethics:
- Never disturb, touch, or handle animals, birds, or nests.
- Never forage, consume, or taste unknown plants, berries, or fungi.
- Always stay on public walkways, sidewalks, and marked trails.
- Respect private property and protected wildlife conservation areas.
