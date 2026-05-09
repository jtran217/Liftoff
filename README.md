# Liftoff 🚀

**Daily interview & communication training — self-hosted, local-first**

> Your co-pilot for interview day. Every session is fuel. The interview is the launch.

Liftoff is a self-hosted web app for SWE interview preparation. Think Duolingo for communication — a daily habit-building tool that trains behavioural question answering and speech articulation through short sessions, voice recording, and AI-powered review. All your data stays on your machine.

---

## Features

### Two practice modes

**Self Improvement** — build speaking fluency without structure
- Spin a randomizer wheel to land on an everyday topic
- Speak freely for 60 seconds — no prompts, no STAR framework
- Get delivery feedback: words per minute, filler words, silence gaps

**Behavioural Prep** — structured SWE interview practice
- 30+ questions across 6 competency categories
- Record your answer with a collapsible STAR guide alongside
- AI feedback on both answer structure and delivery

### Speech Gym
Five guided articulation exercises to build speaking habits on top of interview prep: pen drill, paragraph read, tongue twisters, pacing drill, and projection drill. Each takes 1–2 minutes and counts toward your daily streak.

### Progress tracking
- Daily streak counter — one behavioural session + one gym exercise = a complete day
- 14-day activity heatmap
- Session history with playback, self-rating, and notes
- Trend charts for WPM and filler word reduction over time (Phase 2)

### AI review (Phase 2)
- Transcription via **Whisper.cpp** — runs entirely on your machine, nothing leaves your device
- STAR coverage scoring per answer (present / thin / missing)
- Clarity, structure, and confidence scores (1–10)
- Specific coaching notes referencing your actual transcript
- Session comparison — AI delta summary between two attempts at the same question

---

## Screenshots

> Coming soon

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite (TypeScript) |
| Backend | Node.js + Express |
| Database | SQLite via `better-sqlite3` |
| Transcription | Whisper.cpp (local, Phase 2) |
| AI review | Anthropic Claude API (Phase 2) |
| Waveform | WaveSurfer.js v7 |
| Styling | Tailwind CSS |

No cloud database. No auth. No telemetry. Just a local server and two API keys (Phase 2 only).

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/yourusername/liftoff.git
cd liftoff
npm install
```

### Run (Phase 1 — no API keys needed)

```bash
npm run dev
```

This starts the Express server on `localhost:3001` and the Vite dev server on `localhost:5173`. Open [http://localhost:5173](http://localhost:5173).

Phase 1 works with no `.env` file — recording, playback, the speech gym, and session history all run without any external services.

### Setup for AI features (Phase 2)

```bash
cp .env.example .env
```

Fill in `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...   # for AI review and coaching notes
PORT=3001
UPLOADS_DIR=./server/uploads
```

You'll also need **Whisper.cpp** built locally for transcription. See the [Whisper.cpp setup guide](https://github.com/ggerganov/whisper.cpp) — the `base.en` model is recommended for speed on most machines.

---

## How it works

```
Record answer
      │
      ▼
Save .webm to disk          ← nothing leaves your machine in Phase 1
      │
      ▼
Transcribe with Whisper.cpp ← local model, still nothing leaves (Phase 2)
      │
      ▼
Send transcript to Claude   ← only text, never audio (Phase 2)
      │
      ▼
Store review in SQLite      ← all local
```

Audio files are saved to `server/uploads/` and never sent anywhere. The Anthropic API only ever receives the text transcript.

---

## Project Structure

```
liftoff/
├── server/
│   ├── db/
│   │   ├── schema.sql        # all table definitions
│   │   └── db.ts             # better-sqlite3 singleton
│   ├── routes/               # Express API routes
│   ├── lib/
│   │   ├── whisper.ts        # whisper.cpp wrapper (Phase 2)
│   │   └── anthropic.ts      # Claude API wrapper (Phase 2)
│   └── uploads/              # recorded .webm files (gitignored)
├── src/
│   ├── pages/                # Dashboard, BehaviouralPrep, SelfImprovement, SpeechGym, History
│   ├── components/           # Recorder, SpinWheel, Timer, FeedbackCard, STARGuide, ...
│   ├── hooks/                # useRecorder, useTimer, useSessions
│   └── types/
└── CLAUDE.md                 # full technical spec for contributors / Claude Code
```

---

## Build Phases

### Phase 1 — Core habit loop ✅
Record, save, and play back sessions. Speech gym. Daily streak. Session history. No API keys required.

### Phase 2 — Transcription + AI review 🔄
Whisper.cpp transcription. Claude-powered feedback on delivery and STAR structure. Session comparison.

### Phase 3 — Polish 🗓️
Custom question editor. CSV export. Speech gym expansion. Progress analytics.

---

## Behavioural Question Bank

30 questions across 6 categories:

- **Initiative** — proactivity, going beyond scope
- **Conflict & disagreement** — pushback, difficult conversations
- **Delivery under pressure** — deadlines, scope creep, trade-offs
- **Mentorship & collaboration** — growing others, working across teams
- **Debugging & problem solving** — hard bugs, ambiguous situations
- **Throughput & ownership** — end-to-end ownership, technical debt

All questions follow the STAR format. You can add your own from the settings page (Phase 3).

---

## Data & Privacy

Liftoff is designed to keep everything local:

- Audio recordings are stored on disk in `server/uploads/` — never uploaded anywhere
- Transcripts are generated by Whisper.cpp running on your own machine
- The Anthropic API receives **text only** — your transcript, never your audio
- SQLite database lives in your project folder — easy to back up or delete
- No accounts, no cloud sync, no analytics

---

## Contributing

This is a personal project built for self-directed interview prep, but PRs and issues are welcome.

```bash
# Install dependencies
npm install

# Start dev servers (Express + Vite concurrently)
npm run dev

# Build for production
npm run build
```

The full technical spec — schema, API routes, prompt templates, and implementation notes — lives in [`CLAUDE.md`](./CLAUDE.md).

---

## License

MIT