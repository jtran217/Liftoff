# Liftoff 🚀
**Daily interview & communication training — self-hosted, local-first**

> Astro's co-pilot for interview day. Every session is fuel. The interview is the launch.

---

## What is this?

Liftoff is a self-hosted daily training platform for improving interview performance. Think LeetCode for communication — a habit-building tool that trains behavioural question answering, speech articulation, and on-camera comfort through short daily sessions, voice recording, and AI-powered review.

**Core principles:**
- Habit-first: a daily loop under 10 minutes, like Duolingo for interviews
- Self-hosted: all data stays local — recordings, transcripts, AI reviews
- Hear yourself: voice recording is mandatory; camera is optional but encouraged
- Progressive: AI review and comparison features layer on top of the core habit loop

---

## Decisions already made — do not re-open these

| Decision | Choice | Reason |
|---|---|---|
| Database | SQLite via `better-sqlite3` | Single user, file-based, zero infra, easy backup |
| ORM | None — raw SQL only | Transparency, simplicity |
| File storage | Disk (`server/uploads/`) | Avoids browser storage limits, easy to back up |
| Transcription | Whisper.cpp (local) | Nothing leaves the device |
| AI review input | Transcript only | Audio is never sent to the Anthropic API |
| Auth | None | Single-user self-hosted tool |
| Frontend | React + Vite | Fast dev server, simple static build |
| Backend | Node.js + Express | Lightweight, easy to extend |

---

## Tech stack

```
Frontend:      React + Vite
Backend:       Node.js + Express
Database:      SQLite (better-sqlite3)
File storage:  Disk — server/uploads/*.webm
Transcription: Whisper.cpp (Phase 2)
AI review:     Anthropic API — transcript only, no audio (Phase 2)
Waveform:      WaveSurfer.js
```

---

## Folder structure

```
liftoff/
├── server/
│   ├── db/
│   │   ├── schema.sql            # all CREATE TABLE statements
│   │   └── db.js                 # better-sqlite3 singleton
│   ├── routes/
│   │   ├── sessions.js           # GET/POST /api/sessions
│   │   ├── questions.js          # GET /api/questions
│   │   ├── reviews.js            # POST /api/reviews  (Phase 2)
│   │   ├── comparisons.js        # POST /api/comparisons  (Phase 2)
│   │   └── drills.js             # GET /api/drills
│   ├── uploads/                  # audio + video .webm files on disk
│   └── index.js                  # Express entry point
├── client/
│   ├── src/
│   │   ├── pages/                # Dashboard, Behavioural, Gym, History
│   │   ├── components/           # Recorder, Player, QuestionCard, etc.
│   │   └── main.jsx
│   └── vite.config.js
├── .env                          # ANTHROPIC_API_KEY
├── CLAUDE.md                     # this file
└── package.json
```

---

## Database schema

### QUESTIONS
```sql
CREATE TABLE questions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT NOT NULL,       -- e.g. 'Initiative', 'Conflict'
  lp_tag      TEXT,                -- leadership principle tag
  text        TEXT NOT NULL,
  difficulty  INTEGER DEFAULT 1,   -- 1-3
  is_custom   BOOLEAN DEFAULT 0    -- 0 = built-in, 1 = user-added
);
```

### SESSIONS
```sql
CREATE TABLE sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id   INTEGER REFERENCES questions(id),  -- null for drills
  type          TEXT NOT NULL,      -- 'behavioural' | 'drill'
  recorded_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  audio_path    TEXT NOT NULL,      -- relative path to .webm
  video_path    TEXT,               -- nullable — only if camera was on
  transcript    TEXT,               -- nullable — populated by Whisper (Phase 2)
  duration_secs REAL,
  self_rating   INTEGER,            -- 1-5, nullable
  notes         TEXT
);
```

### AI_REVIEWS
```sql
CREATE TABLE ai_reviews (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id       INTEGER NOT NULL REFERENCES sessions(id),
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  star_feedback    TEXT,   -- JSON: {situation, task, action, result}
  filler_words     TEXT,   -- JSON: {count, words: [{word, position}]}
  clarity_score    INTEGER,    -- 1-10
  structure_score  INTEGER,    -- 1-10
  confidence_score INTEGER,    -- 1-10
  full_response    TEXT        -- raw API response for re-parsing
);
```

### COMPARISONS
```sql
CREATE TABLE comparisons (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  session_a        INTEGER NOT NULL REFERENCES sessions(id),  -- baseline
  session_b        INTEGER NOT NULL REFERENCES sessions(id),  -- newer
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  ai_delta_summary TEXT    -- AI narrative of what improved / regressed
);
```

### DRILL_SESSIONS
```sql
CREATE TABLE drill_sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_type TEXT NOT NULL,   -- 'pen_drill' | 'paragraph_read' | 'tongue_twister' | 'pacing' | 'projection'
  completed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  duration_secs REAL,
  audio_path    TEXT             -- nullable
);
```

---

## API routes

| Method | Path | Description | Phase |
|---|---|---|---|
| GET | `/api/questions` | Question bank. Supports `?category=` and `?difficulty=` | P1 |
| POST | `/api/sessions` | Save session (multipart: audio blob + metadata JSON) | P1 |
| GET | `/api/sessions` | List sessions. Supports `?type=` and `?question_id=` | P1 |
| GET | `/api/sessions/:id` | Single session with linked review if present | P1 |
| GET | `/api/drills` | Exercise library | P1 |
| GET | `/api/streak` | Current streak + today's completion state | P1 |
| POST | `/api/reviews` | Trigger AI review for a session (requires transcript) | P2 |
| POST | `/api/comparisons` | AI delta between two session IDs | P2 |

---

## Feature breakdown

### Behavioural practice (P1)
- Question bank seeded with 30+ questions across 6 categories (see seed data below)
- Random question picker with optional `?category=` filter
- `MediaRecorder` API — mic required, camera optional toggle
- Recordings saved as `.webm` to `server/uploads/`
- Playback: WaveSurfer.js waveform + optional video side-by-side
- Self-rating 1–5 stars + free-text notes per session
- Optional STAR overlay reminder (Situation / Task / Action / Result)

### Speech gym (P1)
- Guided timer-based exercises (see exercise specs below)
- Completion tracked per day for streak purposes
- Optional audio recording on select exercises

### Dashboard (P1)
- Current streak counter
- Today's plan: one speech exercise + one behavioural question = complete day
- 14-day activity heatmap
- Summary metrics: total sessions, average self-rating, questions covered
- Quick-start button for random question

### History (P1)
- Calendar heatmap
- Filterable session log (by type, category, date)
- Link to session detail / playback

### AI review (P2)
- Triggered manually per session after transcript is available
- Calls Anthropic API with: question text + transcript
- Stores result in `ai_reviews` table
- Scores: clarity (1–10), structure (1–10), confidence (1–10)
- STAR breakdown: per-component feedback string
- Filler word detection: count + positions from transcript
- Overall 2–3 sentence summary

### Session comparison (P2)
- Select any two sessions answering the same question
- AI delta summary: what improved, what regressed, what to focus on
- Stored in `comparisons` table, browsable from session detail

---

## Build phases

### Phase 1 — Core habit loop (MVP)
1. Monorepo scaffold: `server/` + `client/` as above
2. `schema.sql` with all 5 tables + seed script
3. Express setup with all P1 routes
4. Question bank seeded (30 questions, 6 categories)
5. Record screen: `MediaRecorder`, mic required, camera toggle, upload to API
6. Playback screen: WaveSurfer.js, optional video, self-rating form
7. Speech gym: exercise library, guided timer, completion tracking
8. Dashboard: streak, today's plan, heatmap, metrics
9. History: calendar heatmap, session log

### Phase 2 — Transcription + AI review
1. Whisper.cpp integration — run on session save, store in `sessions.transcript`
2. `POST /api/reviews` — Anthropic API call, parse response, save to `ai_reviews`
3. Review UI on session detail — STAR breakdown, scores, filler highlights
4. Comparison feature — select two sessions, AI delta, display summary
5. Filler word timestamps highlighted on WaveSurfer waveform

### Phase 3 — Polish
1. Custom question editor (add/edit/delete from UI)
2. Export: CSV history, raw audio download
3. Speech gym expansion: user-uploadable passage text
4. Progress analytics: trend graphs for self-rating and AI scores over time

---

## Seed data — question bank

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

## Speech gym — exercise specs

### Pen articulation drill
- **Duration:** 2 minutes
- **Recording:** optional audio
- **Prompt:** Hold a pen lightly between your teeth (not biting). Read the displayed paragraph aloud, exaggerating mouth movement.
- **Content:** Rotate through 5–8 moderate-difficulty paragraphs. Advance on button press.

### Paragraph read
- **Duration:** 2 minutes
- **Recording:** optional audio (recommended for playback)
- **Prompt:** Read the passage aloud at a natural conversational pace. Focus on clarity and breathing.
- **Content:** Random ~150–200 word paragraph from a curated diverse set.

### Tongue twisters
- **Duration:** 1 minute
- **Recording:** none
- **Prompt:** Repeat each twister 3 times clearly. Speed up on each repetition.
- **Content:** Rotating set of 10 twisters across 3 difficulty levels.

### Pacing drill
- **Duration:** 2 minutes
- **Recording:** none
- **Prompt:** A passage scrolls at a set WPM. Read along to build pace control.
- **Content:** Adjustable WPM slider (100 / 130 / 160 WPM).

### Projection drill
- **Duration:** 2 minutes
- **Recording:** audio required (mic level visualised)
- **Prompt:** Read aloud maintaining consistent volume. Watch the mic level bar.
- **Content:** Short paragraph. Live mic level indicator in the UI.

---

## Environment variables

```
# .env
ANTHROPIC_API_KEY=sk-ant-...   # required for Phase 2 AI review only
PORT=3001                       # Express server port
UPLOADS_DIR=./server/uploads    # where audio/video files are stored
```

---

## Notes for Claude Code

- `CLAUDE.md` lives at the repo root — Claude Code reads it automatically on startup
- Always implement the schema exactly as written above — do not add an ORM layer
- Phase 1 has zero AI dependencies — it must work with no `.env` set
- The `uploads/` directory should be created on server start if it doesn't exist (`fs.mkdirSync`)
- Streak logic: query `sessions` and `drill_sessions` for entries where `recorded_at` date = today (local time). Streak = consecutive days with at least one entry.
- For the `MediaRecorder` implementation, prefer `audio/webm;codecs=opus` where supported
- WaveSurfer.js v7 API — use `WaveSurfer.create()` not the deprecated `new WaveSurfer()`
