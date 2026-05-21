import { Router, Request, Response } from 'express'
import db from '../db/db'
import { generateComparison } from '../lib/anthropic'
import { Session, Question } from '../../src/types'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { session_a, session_b } = req.body
  if (!session_a || !session_b) return res.status(400).json({ error: 'session_a and session_b are required' })
  if (session_a === session_b) return res.status(400).json({ error: 'sessions must be different' })

  const a = db.prepare('SELECT * FROM sessions WHERE id = ?').get(session_a) as unknown as Session | undefined
  const b = db.prepare('SELECT * FROM sessions WHERE id = ?').get(session_b) as unknown as Session | undefined

  if (!a || !b) return res.status(404).json({ error: 'One or both sessions not found' })
  if (!a.transcript) return res.status(400).json({ error: 'Session A has no transcript yet' })
  if (!b.transcript) return res.status(400).json({ error: 'Session B has no transcript yet' })
  if (!a.question_id || a.question_id !== b.question_id) {
    return res.status(400).json({ error: 'Both sessions must be for the same question' })
  }

  const question = db
    .prepare('SELECT * FROM questions WHERE id = ?')
    .get(a.question_id) as unknown as Question | undefined

  const raw = await generateComparison(
    question?.text ?? 'Unknown question',
    a.transcript,
    b.transcript,
  )

  if (!raw) return res.status(500).json({ error: 'AI comparison failed' })

  const result = db.prepare(`
    INSERT INTO comparisons (session_a, session_b, ai_delta_summary)
    VALUES (?, ?, ?)
  `).run(session_a, session_b, JSON.stringify(raw))

  res.status(201).json({ id: Number(result.lastInsertRowid), ...raw })
})

export default router
