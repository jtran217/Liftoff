import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import db from '../db/db'
import { Session } from '../../src/types'

const UPLOADS_DIR = path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'server/uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = file.fieldname === 'video' ? '.webm' : '.webm'
    cb(null, `${Date.now()}-${file.fieldname}${ext}`)
  },
})
const upload = multer({ storage })

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const { type, question_id } = req.query
  let sql = 'SELECT * FROM sessions WHERE 1=1'
  const params: (string | number)[] = []

  if (type) {
    sql += ' AND type = ?'
    params.push(String(type))
  }
  if (question_id) {
    sql += ' AND question_id = ?'
    params.push(Number(question_id))
  }

  sql += ' ORDER BY recorded_at DESC'
  const rows = db.prepare(sql).all(...params) as unknown as Session[]
  res.json(rows)
})

router.get('/:id', (req: Request, res: Response) => {
  const session = db
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .get(req.params.id) as unknown as Session | undefined

  if (!session) return res.status(404).json({ error: 'Session not found' })

  const review = db
    .prepare('SELECT * FROM ai_reviews WHERE session_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(session.id)

  res.json({ ...session, review: review ?? null })
})

router.post(
  '/',
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  (req: Request, res: Response) => {
    const files = req.files as Record<string, Express.Multer.File[]>
    const audioFile = files['audio']?.[0]
    const videoFile = files['video']?.[0]

    if (!audioFile) return res.status(400).json({ error: 'audio file is required' })

    let metadata: Record<string, unknown> = {}
    try {
      metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {}
    } catch {
      return res.status(400).json({ error: 'invalid metadata JSON' })
    }

    const audioPath = path.relative(process.cwd(), audioFile.path)
    const videoPath = videoFile ? path.relative(process.cwd(), videoFile.path) : null

    const qid = metadata.question_id
    const question_id =
      typeof qid === 'number' && Number.isFinite(qid) ? qid : null
    const t = metadata.type
    const type = typeof t === 'string' && t.length > 0 ? t : 'self-improvement'
    const d = metadata.duration_secs
    const duration_secs =
      typeof d === 'number' && Number.isFinite(d) ? d : null
    const top = metadata.topic
    const topic = typeof top === 'string' ? top : null
    const sr = metadata.self_rating
    const self_rating =
      typeof sr === 'number' && Number.isFinite(sr) ? sr : null
    const n = metadata.notes
    const notes = typeof n === 'string' ? n : null

    const result = db
      .prepare(
        `INSERT INTO sessions (question_id, type, audio_path, video_path, duration_secs, topic, self_rating, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        question_id,
        type,
        audioPath,
        videoPath,
        duration_secs,
        topic,
        self_rating,
        notes
      )

    res.status(201).json({ id: Number(result.lastInsertRowid) })
  }
)

router.patch('/:id', (req: Request, res: Response) => {
  const { self_rating, notes, bookmarked } = req.body
  const fields: string[] = []
  const params: (string | number | null)[] = []

  if (self_rating !== undefined) {
    fields.push('self_rating = ?')
    params.push(typeof self_rating === 'number' ? self_rating : Number(self_rating))
  }
  if (notes !== undefined) {
    fields.push('notes = ?')
    params.push(typeof notes === 'string' ? notes : String(notes))
  }
  if (bookmarked !== undefined) {
    fields.push('bookmarked = ?')
    params.push(bookmarked ? 1 : 0)
  }

  if (fields.length === 0) return res.status(400).json({ error: 'nothing to update' })

  params.push(req.params.id)
  db.prepare(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`).run(...params)
  res.json({ ok: true })
})

export default router
