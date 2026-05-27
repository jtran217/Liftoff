import { Router, Request, Response } from 'express'
import db from '../db/db'

const router = Router()

interface ExportRow {
  id: number
  recorded_at: string
  type: string
  topic: string | null
  question_text: string | null
  category: string | null
  duration_secs: number | null
  self_rating: number | null
  notes: string | null
  bookmarked: number
  wpm: number | null
  clarity_score: number | null
  structure_score: number | null
  confidence_score: number | null
  transcript: string | null
}

function escapeCsv(val: string | number | null | undefined): string {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

router.get('/sessions.csv', (_req: Request, res: Response) => {
  const rows = db.prepare(`
    SELECT
      s.id,
      s.recorded_at,
      s.type,
      s.topic,
      q.text   AS question_text,
      q.category,
      s.duration_secs,
      s.self_rating,
      s.notes,
      s.bookmarked,
      s.transcript,
      r.wpm,
      r.clarity_score,
      r.structure_score,
      r.confidence_score
    FROM sessions s
    LEFT JOIN questions q ON q.id = s.question_id
    LEFT JOIN ai_reviews r ON r.session_id = s.id
      AND r.id = (SELECT id FROM ai_reviews WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1)
    ORDER BY s.recorded_at DESC
  `).all() as unknown as ExportRow[]

  const headers = [
    'id', 'date', 'type', 'topic', 'question', 'category',
    'duration_secs', 'self_rating', 'wpm', 'clarity', 'structure', 'confidence',
    'bookmarked', 'notes', 'transcript',
  ]

  const lines = [
    headers.join(','),
    ...rows.map(r => [
      r.id,
      escapeCsv(r.recorded_at),
      escapeCsv(r.type),
      escapeCsv(r.topic),
      escapeCsv(r.question_text),
      escapeCsv(r.category),
      r.duration_secs ?? '',
      r.self_rating ?? '',
      r.wpm ?? '',
      r.clarity_score ?? '',
      r.structure_score ?? '',
      r.confidence_score ?? '',
      r.bookmarked,
      escapeCsv(r.notes),
      escapeCsv(r.transcript),
    ].join(',')),
  ]

  const filename = `liftoff-sessions-${new Date().toISOString().slice(0, 10)}.csv`
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(lines.join('\n'))
})

export default router
