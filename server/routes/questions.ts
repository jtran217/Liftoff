import { Router, Request, Response } from 'express'
import db from '../db/db'
import { Question } from '../../src/types'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const { category, difficulty } = req.query
  let sql = 'SELECT * FROM questions WHERE 1=1'
  const params: (string | number)[] = []

  if (category) {
    sql += ' AND category = ?'
    params.push(String(category))
  }
  if (difficulty) {
    sql += ' AND difficulty = ?'
    params.push(Number(difficulty))
  }

  sql += ' ORDER BY category, id'
  const rows = db.prepare(sql).all(...params) as unknown as Question[]
  res.json(rows)
})

router.get('/categories', (_req: Request, res: Response) => {
  const rows = db
    .prepare('SELECT DISTINCT category FROM questions ORDER BY category')
    .all() as unknown as { category: string }[]
  res.json(rows.map((r) => r.category))
})

router.get('/random', (req: Request, res: Response) => {
  const { category } = req.query
  let sql = 'SELECT * FROM questions WHERE 1=1'
  const params: string[] = []

  if (category) {
    sql += ' AND category = ?'
    params.push(String(category))
  }

  sql += ' ORDER BY RANDOM() LIMIT 1'
  const row = db.prepare(sql).get(...params) as unknown as Question | undefined
  if (!row) return res.status(404).json({ error: 'No questions found' })
  res.json(row)
})

router.post('/', (req: Request, res: Response) => {
  const { category, text, difficulty, lp_tag } = req.body as {
    category?: string
    text?: string
    difficulty?: number
    lp_tag?: string
  }
  if (!category || !text) return res.status(400).json({ error: 'category and text are required' })

  const diff = typeof difficulty === 'number' ? Math.min(3, Math.max(1, Math.round(difficulty))) : 1

  const result = db.prepare(
    `INSERT INTO questions (category, text, difficulty, lp_tag, is_custom) VALUES (?, ?, ?, ?, 1)`
  ).run(category.trim(), text.trim(), diff, lp_tag?.trim() ?? null)

  res.status(201).json({ id: Number(result.lastInsertRowid) })
})

router.patch('/:id', (req: Request, res: Response) => {
  const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id) as unknown as Question | undefined
  if (!q) return res.status(404).json({ error: 'Question not found' })
  if (!q.is_custom) return res.status(403).json({ error: 'Cannot edit built-in questions' })

  const { category, text, difficulty, lp_tag } = req.body as {
    category?: string
    text?: string
    difficulty?: number
    lp_tag?: string
  }

  const fields: string[] = []
  const params: (string | number | null)[] = []

  if (category !== undefined) { fields.push('category = ?'); params.push(category.trim()) }
  if (text !== undefined) { fields.push('text = ?'); params.push(text.trim()) }
  if (difficulty !== undefined) { fields.push('difficulty = ?'); params.push(Math.min(3, Math.max(1, Math.round(difficulty)))) }
  if (lp_tag !== undefined) { fields.push('lp_tag = ?'); params.push(lp_tag.trim() || null) }

  if (fields.length === 0) return res.status(400).json({ error: 'nothing to update' })

  params.push(req.params.id)
  db.prepare(`UPDATE questions SET ${fields.join(', ')} WHERE id = ?`).run(...params)
  res.json({ ok: true })
})

router.delete('/:id', (req: Request, res: Response) => {
  const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id) as unknown as Question | undefined
  if (!q) return res.status(404).json({ error: 'Question not found' })
  if (!q.is_custom) return res.status(403).json({ error: 'Cannot delete built-in questions' })

  db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
