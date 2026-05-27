import { Router, Request, Response } from 'express'
import db from '../db/db'

const router = Router()

interface ProgressRow {
  recorded_at: string
  type: string
  self_rating: number | null
  wpm: number | null
  clarity_score: number | null
  structure_score: number | null
  confidence_score: number | null
}

router.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare(`
    SELECT
      s.recorded_at,
      s.type,
      s.self_rating,
      r.wpm,
      r.clarity_score,
      r.structure_score,
      r.confidence_score
    FROM sessions s
    LEFT JOIN ai_reviews r ON r.session_id = s.id
      AND r.id = (SELECT id FROM ai_reviews WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1)
    WHERE s.type IN ('behavioural', 'self-improvement')
    ORDER BY s.recorded_at ASC
  `).all() as unknown as ProgressRow[]

  res.json(rows)
})

export default router
