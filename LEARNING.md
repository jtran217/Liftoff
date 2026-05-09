# LEARNING.md

Personal guidelines for staying intentional about growth while building Liftoff.  
This file is for me — not for Claude Code. Basically what 20% can I do that will give me benificial result in terms of bettering my development skill and the other 80% claude can do.

---

## The Core Rule

> Before delegating anything to Claude, ask: "If an interviewer asked me to explain this, would I be able to?"
>
> If no — build it yourself. If yes — Claude can help.

---

## Things I Build Myself

### Phase 1 — Spin wheel + recorder flow

- Pre-determine the winning topic before the animation starts
- Implement the 2.5s CSS animation that lands on the correct position
- Build the MediaRecorder pipeline (start, stop, collect .webm chunks)
- Wire the POST to `/api/sessions` with multipart audio + metadata
- Confirm I can explain every part of `useRecorder.ts` line by line

### Phase 2 — Whisper.cpp integration

- Set up the Whisper.cpp binary locally and confirm it runs
- Write the Node.js wrapper in `server/lib/whisper.ts` that invokes it
- Build the audio-to-transcript pipeline from disk file to text output
- Store the transcript back to `sessions.transcript` in SQLite
- Handle errors gracefully — what happens if transcription fails?

### Phase 2 — Anthropic API review pipeline

- Wire `POST /api/reviews` end to end
- Write and tune the Self Improvement feedback prompt
- Write and tune the Behavioural Prep feedback prompt
- Parse the JSON response and save all fields to `ai_reviews`
- Verify coaching notes are specific and reference the actual transcript — not generic

---

## Claude Code Review Checklist

Run through this before accepting any non-trivial diff:

- Can I explain what this does line by line?
- Do I understand why it made this decision?
- Does it match the architecture in CLAUDE.md?
- Did it deviate from any decisions in the decisions table?

If no to any of these — read it, understand it, rewrite the parts I don't.

**Known deviation to watch:** Claude Code swapped `better-sqlite3` for `node:sqlite`
without being asked. Always check for unannounced architectural changes.

---

## Interview Prep — Things I Need to Be Able to Explain

- Why SQLite over Postgres for this use case
- Why disk storage for .webm instead of blob columns
- Why no auth on a self-hosted tool
- How the Whisper.cpp pipeline works end to end
- Why transcripts only are sent to the Anthropic API — never audio
- How the streak query works across both `sessions` and `drill_sessions`
- The overall schema design and why each table exists

---

## What Claude Can Handle

- UI aesthetics — colors, spacing, layout, responsiveness
- Boilerplate and repetitive components
- Tedious but obvious wiring I've already proven I can do once
- History page, Speech Gym UI, and other low-craft surfaces

The distinction: offload the aesthetics, not the structure. Even when Claude writes
the CSS, I still need to understand how every component is wired.