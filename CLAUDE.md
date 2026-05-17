# Liftoff 🚀
**Daily interview & communication training — self-hosted, local-first**

> Your co-pilot for interview day. Every session is fuel. The interview is the launch.

---

## What is this?

Liftoff is a self-hosted daily training platform for SWE interview performance. Think Duolingo for communication — a habit-building tool that trains behavioural question answering and speech articulation through short daily sessions, voice recording, and AI-powered review.

**Core principles:**
- Habit-first: a daily loop under 10 minutes
- Self-hosted: all data stays local — recordings, transcripts, AI reviews
- Hear yourself: voice recording is mandatory; camera is optional
- Progressive: AI review and comparison features layer on top of the core habit loop

---

## Decisions already made — do not re-open these

| Decision | Choice | Reason |
|---|---|---|
| Database | SQLite via `node:sqlite` (built-in, Node 22+) | Single user, file-based, zero infra, no native build step |
| ORM | None — raw SQL only | Transparency, simplicity |
| File storage | Disk (`server/uploads/`) | Avoids browser storage limits, easy to back up |
| Transcription | OpenAI Whisper API (`whisper-1`) | whisper.cpp too slow on target hardware (2013 CPU); audio sent to OpenAI only for transcription |
| AI review input | Transcript only | Audio is never sent to the Anthropic API |
| Auth | None | Single-user self-hosted tool |
| Frontend | React + Vite (TypeScript) | Fast dev server, simple static build |
| Backend | Node.js + Express | Lightweight, easy to extend |
| Charting | Recharts | Simple React-native charts for progress dashboard |

---

## Tech Stack

```
Frontend:      React + Vite (TypeScript)
Backend:       Node.js + Express
Database:      SQLite (node:sqlite, built-in Node 22+) — raw SQL, no ORM
File storage:  Disk — server/uploads/*.webm
Transcription: OpenAI Whisper API (whisper-1) — audio sent to OpenAI for transcription only
AI review:     Anthropic Claude API — transcript only, no audio (Phase 2)
Waveform:      WaveSurfer.js v7
Styling:       Tailwind CSS
```

---

## Folder Structure

```
liftoff/
├── CLAUDE.md                        ← you are here
├── .env                             ← API keys (never commit)
├── .env.example                     ← template to commit
├── package.json
├── vite.config.ts                   ← proxies /api/* to Express in dev
├── server/
│   ├── index.ts                     ← Express entry point
│   ├── db/
│   │   ├── schema.sql               ← all CREATE TABLE statements
│   │   ├── db.ts                    ← node:sqlite singleton
│   │   └── seed.ts                  ← seeds question bank (npm run seed)
│   ├── routes/
│   │   ├── sessions.ts              ← GET/POST /api/sessions
│   │   ├── questions.ts             ← GET /api/questions
│   │   ├── drills.ts                ← GET /api/drills
│   │   ├── streak.ts                ← GET /api/streak
│   │   ├── reviews.ts               ← POST /api/reviews (Phase 2)
│   │   └── comparisons.ts           ← POST /api/comparisons (Phase 2)
│   ├── lib/
│   │   ├── whisper.ts               ← whisper.cpp wrapper (Phase 2)
│   │   └── anthropic.ts             ← Claude API wrapper (Phase 2)
│   └── uploads/                     ← audio + video .webm files on disk
├── src/
│   ├── main.tsx
│   ├── App.tsx                      ← top-level router
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── BehaviouralPrep.tsx
│   │   ├── SelfImprovement.tsx      ← spin wheel mode
│   │   ├── SpeechGym.tsx
│   │   ├── History.tsx
│   │   └── SessionDetail.tsx        ← /sessions/:id — playback, rating, feedback
│   ├── components/
│   │   ├── ModeSelector.tsx         ← landing: pick Behavioural or Self Improvement
│   │   ├── SpinWheel.tsx            ← animated CSS spin wheel (Self Improvement)
│   │   ├── Timer.tsx                ← countdown with visual ring
│   │   ├── Recorder.tsx             ← MediaRecorder + waveform visualizer
│   │   ├── Player.tsx               ← WaveSurfer.js playback + optional video
│   │   ├── FeedbackCard.tsx         ← delivery metrics + AI notes
│   │   ├── STARGuide.tsx            ← collapsible STAR prompt sidebar
│   │   ├── StreakCounter.tsx
│   │   ├── ActivityHeatmap.tsx      ← 14-day heatmap
│   │   └── ProgressDashboard.tsx    ← recharts trend graphs
│   ├── hooks/
│   │   ├── useRecorder.ts           ← MediaRecorder + AudioContext logic
│   │   ├── useTimer.ts
│   │   └── useSessions.ts           ← fetch/cache session history
│   └── types/
│       └── index.ts                 ← shared Session, Feedback, Metric types
└── data/                            ← gitignored, created at runtime
    └── liftoff.db
```

---

## The Two Modes

### Mode 1: Self Improvement

**Goal:** Build speaking fluency and delivery. No structure required — just talk.

**Flow:**
1. User picks a topic category (currently: **Everyday life**)
2. Spin wheel animates and lands on a random topic (e.g. "your favourite movie")
3. 60-second countdown timer starts automatically after the spin lands
4. User speaks freely — no STAR guide, no prompts
5. On timer end (or manual stop), audio is saved to disk
6. Transcribed by Whisper.cpp (Phase 2) → AI delivery feedback via Claude (Phase 2)
7. Feedback card shows: wpm, filler word breakdown, silence gaps, 2–3 coaching notes on delivery only — not content
8. Session saved to SQLite

**Spin wheel topic bank (Everyday life):**
```
your favourite movie, a place you'd love to visit, the best meal you've ever had,
a skill you wish you had learned earlier, your morning routine, a book that changed
how you think, the most useful app on your phone, a hobby you'd recommend to anyone,
your favourite season and why, something you changed your mind about recently,
a piece of advice you'd give your younger self, the last thing that made you laugh,
a sport or game you enjoy watching or playing, your ideal weekend,
something you're looking forward to
```

**Spin wheel implementation note:**
- Implement as a CSS/canvas animation — no library needed
- Pick the winning topic before the animation starts, then animate to that position over ~2.5s
- Do not re-randomize mid-spin

**Delivery metrics (Phase 2 — requires transcript):**
- Words per minute — target range: 130–160 wpm
- Filler words: "um", "uh", "like", "so", "you know", "basically", "literally", "right" (as filler)
- Silence gaps > 2 seconds (count)
- Total duration

---

### Mode 2: Behavioural Prep

**Goal:** Practice structured SWE behavioural answers using the STAR method.

**Flow:**
1. User picks a competency or hits "random"
2. Question displayed with collapsible STAR guide sidebar
3. User records — soft warning at 2 minutes, hard stop at 3 minutes
4. Audio saved to disk, transcribed by Whisper.cpp (Phase 2)
5. AI feedback triggered manually from session detail (Phase 2)
6. Feedback card shows: STAR coverage score, delivery metrics, 3–5 specific AI notes
7. User can bookmark the session as a saved answer to review before interviews

---

## Database Schema

```sql
CREATE TABLE questions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT NOT NULL,        -- e.g. 'Initiative', 'Conflict'
  lp_tag      TEXT,                 -- leadership principle tag
  text        TEXT NOT NULL,
  difficulty  INTEGER DEFAULT 1,    -- 1–3
  is_custom   BOOLEAN DEFAULT 0     -- 0 = built-in, 1 = user-added
);

CREATE TABLE sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id   INTEGER REFERENCES questions(id),  -- null for drills + self-improvement
  type          TEXT NOT NULL,       -- 'behavioural' | 'self-improvement' | 'drill'
  recorded_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  audio_path    TEXT NOT NULL,       -- relative path to .webm
  video_path    TEXT,                -- nullable — only if camera was on
  transcript    TEXT,                -- nullable — populated by Whisper (Phase 2)
  duration_secs REAL,
  topic         TEXT,                -- spin wheel result (self-improvement only)
  self_rating   INTEGER,             -- 1–5, nullable
  notes         TEXT,
  bookmarked    INTEGER DEFAULT 0    -- 0 | 1
);

CREATE TABLE ai_reviews (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id       INTEGER NOT NULL REFERENCES sessions(id),
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  star_feedback    TEXT,    -- JSON: {situation, task, action, result}
  filler_words     TEXT,    -- JSON: {count, words: [{word, count}]}
  wpm              INTEGER,
  clarity_score    INTEGER, -- 1–10
  structure_score  INTEGER, -- 1–10
  confidence_score INTEGER, -- 1–10
  ai_notes         TEXT,    -- JSON array of coaching note strings
  full_response    TEXT     -- raw API response for re-parsing
);

CREATE TABLE comparisons (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  session_a        INTEGER NOT NULL REFERENCES sessions(id),  -- baseline
  session_b        INTEGER NOT NULL REFERENCES sessions(id),  -- newer
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  ai_delta_summary TEXT     -- AI narrative: what improved / regressed
);

CREATE TABLE drill_sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_type TEXT NOT NULL,   -- 'pen_drill' | 'paragraph_read' | 'tongue_twister' | 'pacing' | 'projection'
  completed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  duration_secs REAL,
  audio_path    TEXT             -- nullable
);
```

---

## API Routes

| Method | Path | Description | Phase |
|---|---|---|---|
| GET | `/api/questions` | Question bank. Supports `?category=` and `?difficulty=` | P1 |
| GET | `/api/questions/categories` | Distinct category list | P1 |
| GET | `/api/questions/random` | Random question, optional `?category=` | P1 |
| POST | `/api/sessions` | Save session (multipart: audio blob + metadata JSON) | P1 |
| GET | `/api/sessions` | List sessions. Supports `?type=` and `?question_id=` | P1 |
| GET | `/api/sessions/:id` | Single session with linked review if present | P1 |
| PATCH | `/api/sessions/:id` | Update `self_rating`, `notes`, and/or `bookmarked` | P1 |
| GET | `/api/drills` | Exercise library | P1 |
| POST | `/api/drills/complete` | Save drill completion (multipart: optional audio + metadata) | P1 |
| GET | `/api/streak` | Current streak + today's completion state | P1 |
| POST | `/api/reviews` | Trigger AI review for a session (requires transcript) | P2 |
| POST | `/api/comparisons` | AI delta between two session IDs | P2 |

---

## Claude Prompt Templates (Phase 2)

### Self Improvement feedback prompt
```
You are a speaking coach analyzing a 60-second free-form response.

Transcript:
"""
{transcript}
"""

Analyze delivery ONLY — do not comment on content or whether the answer is "good".

Return a JSON object with this exact shape:
{
  "wpm": <integer>,
  "filler_words": { "<word>": <count> },
  "filler_count": <integer>,
  "silence_count": <integer>,
  "duration_seconds": <integer>,
  "clarity_score": <integer 1-10>,
  "ai_notes": ["<specific coaching note>", "<specific coaching note>", "<specific coaching note>"]
}

Filler words to count: um, uh, like, so, you know, basically, literally, right (when used as a filler).
WPM = total word count / (duration_seconds / 60). Duration is {duration_seconds} seconds.
AI notes must be specific and actionable — reference exact moments in the transcript. No generic advice.
Return only valid JSON. No markdown, no preamble.
```

### Behavioural Prep feedback prompt
```
You are an interview coach evaluating a SWE behavioural answer.

Question: {question}
Competency: {competency}

Transcript:
"""
{transcript}
"""

Evaluate both STAR structure and delivery.

Return a JSON object with this exact shape:
{
  "wpm": <integer>,
  "filler_words": { "<word>": <count> },
  "filler_count": <integer>,
  "silence_count": <integer>,
  "duration_seconds": <integer>,
  "clarity_score": <integer 1-10>,
  "structure_score": <integer 1-10>,
  "confidence_score": <integer 1-10>,
  "star_feedback": {
    "situation": "<feedback string>",
    "task": "<feedback string>",
    "action": "<feedback string>",
    "result": "<feedback string>"
  },
  "star_coverage": {
    "situation": "present" | "thin" | "missing",
    "task": "present" | "thin" | "missing",
    "action": "present" | "thin" | "missing",
    "result": "present" | "thin" | "missing"
  },
  "ai_notes": ["<note 1>", "<note 2>", "<note 3>", "<note 4>", "<note 5>"]
}

AI notes should address both delivery AND content — reference actual lines from the transcript.
STAR coverage: "present" = clearly covered, "thin" = present but underdeveloped, "missing" = not addressed.
WPM = total word count / (duration_seconds / 60). Duration: {duration_seconds} seconds.
Return only valid JSON. No markdown, no preamble.
```

---

## Seed Data — Question Bank

### Initiative
1. Tell me about a time you identified a problem no one else had noticed and took initiative to fix it.
2. Describe a situation where you went above and beyond what was expected of you.
3. Give an example of a time you proactively improved a process without being asked.
4. Tell me about a time you took on a project outside your core responsibilities.
5. Describe a time you saw an opportunity and acted on it without waiting for direction.

### Conflict & disagreement
1. Tell me about a time you disagreed with a team member's approach. How did you handle it?
2. Describe a situation where you had to push back on a decision made by someone senior to you.
3. Give an example of a conflict within your team and how you helped resolve it.
4. Tell me about a time you had to deliver feedback that was hard to hear for the other person.
5. Describe a time a stakeholder pushed for something you believed was the wrong approach.

### Delivery under pressure
1. Describe a time you had to deliver a project under a very tight deadline. What trade-offs did you make?
2. Tell me about a situation where scope expanded unexpectedly mid-project. What did you do?
3. Give an example of a time you had to prioritise ruthlessly to hit a deadline.
4. Describe a time a key dependency fell through close to a deadline. How did you recover?
5. Tell me about the most stressful project you've worked on and how you managed it.

### Mentorship & collaboration
1. Tell me about a time you helped a teammate grow or improve their skills.
2. Describe a situation where you had to onboard someone new and get them productive quickly.
3. Give an example of a time you learned something significant from a peer or junior colleague.
4. Tell me about a time you had to adapt your communication style to work effectively with someone very different from you.
5. Describe a time you built consensus across a team with conflicting priorities.

### Debugging & problem solving
1. Tell me about the hardest bug you've ever had to track down. How did you approach it?
2. Describe a situation where you had to diagnose a production issue under time pressure.
3. Give an example of a time you had to make a decision with incomplete information.
4. Tell me about a time a system behaved in a way that completely surprised you.
5. Describe a time you had to quickly learn a new technology or domain to solve a problem.

### Throughput & ownership
1. Tell me about a time you significantly improved the performance or reliability of a system.
2. Describe a project where you owned the outcome end-to-end. What did that look like?
3. Give an example of a time you identified and eliminated a bottleneck in your team's workflow.
4. Tell me about a time you had to maintain quality while moving very fast.
5. Describe a situation where you saw technical debt causing real problems and took steps to address it.

---

## Speech Gym — Exercise Specs

### Pen articulation drill
- **Duration:** 2 minutes · **Recording:** optional audio
- **Prompt:** Hold a pen lightly between your teeth. Read the displayed paragraph aloud, exaggerating mouth movement.
- **Content:** Rotate through 5–8 moderate-difficulty paragraphs. Advance on button press.

### Paragraph read
- **Duration:** 2 minutes · **Recording:** optional audio (recommended for playback)
- **Prompt:** Read the passage aloud at a natural conversational pace. Focus on clarity and breathing.
- **Content:** Random ~150–200 word paragraph from a curated diverse set.

### Tongue twisters
- **Duration:** 1 minute · **Recording:** none
- **Prompt:** Repeat each twister 3 times clearly. Speed up on each repetition.
- **Content:** Rotating set of 10 twisters across 3 difficulty levels.

### Pacing drill
- **Duration:** 2 minutes · **Recording:** none
- **Prompt:** A passage scrolls at a set WPM. Read along to build pace control.
- **Content:** Adjustable WPM slider (100 / 130 / 160 WPM).

### Projection drill
- **Duration:** 2 minutes · **Recording:** audio required (mic level visualised)
- **Prompt:** Read aloud maintaining consistent volume. Watch the mic level bar.
- **Content:** Short paragraph. Live mic level indicator in the UI.

---

## Build Phases

### Phase 1 — Core habit loop (no AI dependencies) ✅ COMPLETE

1. ✅ Monorepo scaffold: `server/` + `src/` as above
2. ✅ `schema.sql` with all 5 tables + seed script (30 questions — `npm run seed`)
3. ✅ Express setup with all P1 routes
4. ✅ Mode selector landing screen (Dashboard with StreakCounter + ActivityHeatmap)
5. ✅ **Self Improvement:** spin wheel → 60s brainstorm timer → recorder → save to disk + DB → link to session detail
6. ✅ **Behavioural Prep:** competency picker + random → question display + STAR guide → recorder (2 min warn / 3 min hard stop) → save to disk + DB → link to session detail
7. ✅ Playback screen (`SessionDetail.tsx`): WaveSurfer.js waveform, optional video, self-rating + notes form, FeedbackCard placeholder
8. ✅ Speech gym: exercise library, guided timer per drill, completion tracking — 5 drills (pen, paragraph, tongue twister, pacing, projection)
9. ✅ Dashboard: streak counter, 14-day heatmap, nav links to all modes
10. ✅ History: 14-day heatmap, filterable session log (All / Behavioural / Self Improvement / Bookmarked), bookmark toggle

> Phase 1 works with no `.env` set — zero AI dependencies.

### Phase 2 — Transcription + AI review

> Implement everything in code. Whisper binary path and model path come from `WHISPER_BIN` / `WHISPER_MODEL` env vars — if unset, transcription is skipped gracefully. Do not gate implementation on manual setup being done first.

1. `server/lib/whisper.ts` — call OpenAI Whisper API (`whisper-1`), return transcript string; skip silently if `OPENAI_API_KEY` is not set ✅
2. Hook transcription into `POST /api/sessions` — runs in background after audio is saved, writes result to `sessions.transcript` ✅
3. `server/lib/anthropic.ts` — Claude API wrapper using prompt templates below
4. `POST /api/reviews` — call Claude with transcript, save results to `ai_reviews`
5. Review UI on session detail — wire `FeedbackCard` (already built) to real data: STAR breakdown, scores, coaching notes
6. Self Improvement feedback card — delivery metrics + coaching notes
7. Comparison feature — select two sessions answering the same question, AI delta summary
8. Filler word timestamps highlighted on WaveSurfer waveform

### Phase 3 — Polish
1. Custom question editor (add/edit/delete from UI)
2. Export: CSV history, raw audio download
3. Speech gym expansion: user-uploadable passage text
4. Progress analytics: recharts trend graphs for self-rating and AI scores over time

---

## Environment Variables

```env
# .env.example
ANTHROPIC_API_KEY=sk-ant-...   # required for Phase 2 AI review
OPENAI_API_KEY=sk-...          # required for Phase 2 transcription (Whisper API)
PORT=3001
UPLOADS_DIR=./server/uploads
NODE_ENV=development
```

---

## Notes for Claude Code

- Always implement the schema exactly as written — do not add an ORM layer
- Database uses `node:sqlite` (built into Node 22+, no install needed). Import with `import { DatabaseSync } from 'node:sqlite'`. There is no `.transaction()` helper — use `db.exec('BEGIN')` / `db.exec('COMMIT')` instead. `lastInsertRowid` is a `bigint`; wrap in `Number()` before serialising to JSON.
- Phase 1 has zero AI dependencies — it must work with no `.env` set
- The `uploads/` directory must be created on server start if it doesn't exist: `fs.mkdirSync(path, { recursive: true })`
- Use `audio/webm;codecs=opus` for `MediaRecorder` — good browser support, small file size, accepted by Whisper
- WaveSurfer.js v7 API — use `WaveSurfer.create()` not the deprecated `new WaveSurfer()`
- Streak logic: query both `sessions` and `drill_sessions` for entries where date = today (local time). Streak = consecutive days with at least one entry in either table.
- Spin wheel: pick the winning topic before the animation starts, animate to that position over ~2.5s. Do not randomize mid-spin.
- Vite proxies `/api/*` to `localhost:3001` in dev — configure in `vite.config.ts`
- Audio is never sent to the Anthropic API — transcripts only

### Implementation gotchas discovered in Phase 1

**Audio URL helper (Windows path issue):** `audio_path` stored in the DB uses OS path separators (backslashes on Windows). Do not use the stored path directly as a URL. Extract only the filename: `const filename = storedPath.replace(/\\/g, '/').split('/').pop()!; return '/uploads/' + filename`

**MediaRecorder blob race condition:** `stopRecording()` calls `mediaRecorder.stop()` — the blob is set asynchronously in the `onstop` event, not synchronously. Do not read `recorder.audioBlob` immediately after calling `stopRecording()`. Instead, use an `awaitingBlob` state flag and a `useEffect` that fires when `recorder.isRecording` becomes false:
```tsx
useEffect(() => {
  if (!awaitingBlob || recorder.isRecording) return
  onFinish({ audioBlob: recorder.audioBlob })
}, [awaitingBlob, recorder.isRecording, recorder.audioBlob])
```

**Per-drill timer:** `useTimer` must be instantiated inside the per-drill component (e.g. `DrillRunner`), not at the parent level. The parent doesn't know the drill duration at mount time, and `reset()` always resets to the initial total — if initialized with 0 it will immediately complete.

**`useTimer` callback stability:** The completion callback passed to `useTimer` is captured in a ref inside the hook — it is safe to pass an inline function without memoization.