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

export default router
