import { Router, Request, Response } from 'express'
import db from '../db/db'
import { generateReview } from '../lib/anthropic'
import { transcribeWithTimestamps } from '../lib/whisper'
import { Session, Question } from '../../src/types'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { session_id } = req.body
  if (!session_id) return res.status(400).json({ error: 'session_id is required' })

  const session = db
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .get(session_id) as unknown as Session | undefined

  if (!session) return res.status(404).json({ error: 'Session not found' })
  if (!session.transcript) return res.status(400).json({ error: 'No transcript yet — transcription may still be running' })

  let question: Question | undefined
  if (session.question_id) {
    question = db
      .prepare('SELECT * FROM questions WHERE id = ?')
      .get(session.question_id) as unknown as Question | undefined
  }

  const [raw, fillerTimestamps] = await Promise.all([
    generateReview({
      transcript: session.transcript,
      type: session.type,
      duration_secs: session.duration_secs,
      question: question?.text ?? null,
      category: question?.category ?? null,
    }),
    transcribeWithTimestamps(session.audio_path),
  ])

  if (!raw) return res.status(500).json({ error: 'AI review failed' })

  const fillerWords = raw.filler_words
    ? {
        count: raw.filler_count ?? Object.values(raw.filler_words).reduce((a, b) => a + b, 0),
        words: Object.entries(raw.filler_words).map(([word, count]) => ({ word, count })),
        timestamps: fillerTimestamps ?? [],
      }
    : null

  const result = db.prepare(`
    INSERT INTO ai_reviews
      (session_id, star_feedback, filler_words, wpm, clarity_score, structure_score, confidence_score, ai_notes, full_response)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    session_id,
    raw.star_feedback ? JSON.stringify(raw.star_feedback) : null,
    fillerWords ? JSON.stringify(fillerWords) : null,
    raw.wpm ?? null,
    raw.clarity_score ?? null,
    raw.structure_score ?? null,
    raw.confidence_score ?? null,
    raw.ai_notes ? JSON.stringify(raw.ai_notes) : null,
    JSON.stringify(raw),
  )

  res.status(201).json({ id: Number(result.lastInsertRowid) })
})

export default router
