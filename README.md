# Liftoff

Self-hosted daily interview training app. Practice behavioural questions with voice and camera recording, build speech skills with guided exercises, and get AI-powered review. Track your streak, compare past recordings, and launch ready. Built with React, Express, and SQLite.

---

## Features

- **Behavioural practice** — record audio (+ optional camera) answers to a curated question bank, rate yourself, and save every session permanently
- **Speech gym** — daily guided exercises: pen articulation drill, paragraph reads, tongue twisters, pacing and projection drills
- **AI review** *(Phase 2)* — local Whisper transcription + Anthropic API feedback on STAR structure, filler words, clarity, and confidence
- **Session comparison** *(Phase 2)* — pick any two recordings of the same question and get an AI delta summary of what improved
- **Streaks & heatmap** — daily habit loop with a 14-day activity heatmap and streak counter
- **Local-first** — all recordings, transcripts, and AI reviews stay on your machine

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | SQLite (`better-sqlite3`) |
| File storage | Disk — `server/uploads/` |
| Transcription | Whisper.cpp *(Phase 2)* |
| AI review | Anthropic API — transcript only, audio never leaves device *(Phase 2)* |
| Waveform | WaveSurfer.js v7 |

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & run

```bash
# Clone the repo
git clone https://github.com/your-username/liftoff.git
cd liftoff

# Install dependencies
npm install

# Start the dev server (Express + Vite concurrently)
npm run dev
```

The app will be available at `http://localhost:5173`. The Express API runs on port `3001`.

### Environment variables

Create a `.env` file in the root:

```env
PORT=3001
UPLOADS_DIR=./server/uploads
ANTHROPIC_API_KEY=sk-ant-...   # only needed for Phase 2 AI review
```

Phase 1 works fully without an API key set.

---

## Project structure

```
liftoff/
├── server/
│   ├── db/
│   │   ├── schema.sql        # database schema
│   │   └── db.js             # better-sqlite3 singleton
│   ├── routes/
│   │   ├── sessions.js
│   │   ├── questions.js
│   │   ├── reviews.js        # Phase 2
│   │   ├── comparisons.js    # Phase 2
│   │   └── drills.js
│   ├── uploads/              # audio + video files (git-ignored)
│   └── index.js
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── main.jsx
│   └── vite.config.js
├── CLAUDE.md                 # Claude Code context file
├── .env                      # local config (git-ignored)
└── package.json
```

---

## Roadmap

- [x] Project planning & PRD
- [ ] Phase 1 — Core habit loop: recording, playback, speech gym, streaks
- [ ] Phase 2 — Whisper transcription + AI review + session comparison
- [ ] Phase 3 — Custom question editor, export, progress analytics

---

## Contributing

This is a personal project but PRs and issues are welcome.

---

## License

MIT
