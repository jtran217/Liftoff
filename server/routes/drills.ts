import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import db from '../db/db'
import { Drill } from '../../src/types'

const UPLOADS_DIR = path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'server/uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.fieldname}.webm`),
})
const upload = multer({ storage })

const DRILLS: Drill[] = [
  {
    id: 'pen_drill',
    label: 'Pen Articulation Drill',
    durationSecs: 120,
    recordingMode: 'optional',
    description:
      'Hold a pen lightly between your teeth. Read the displayed paragraph aloud, exaggerating mouth movement.',
  },
  {
    id: 'paragraph_read',
    label: 'Paragraph Read',
    durationSecs: 120,
    recordingMode: 'optional',
    description:
      'Read the passage aloud at a natural conversational pace. Focus on clarity and breathing.',
  },
  {
    id: 'tongue_twister',
    label: 'Tongue Twisters',
    durationSecs: 60,
    recordingMode: 'none',
    description: 'Repeat each twister 3 times clearly. Speed up on each repetition.',
  },
  {
    id: 'pacing',
    label: 'Pacing Drill',
    durationSecs: 120,
    recordingMode: 'none',
    description:
      'A passage scrolls at a set WPM. Read along to build pace control.',
  },
  {
    id: 'projection',
    label: 'Projection Drill',
    durationSecs: 120,
    recordingMode: 'required',
    description:
      'Read aloud maintaining consistent volume. Watch the mic level bar.',
  },
]

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  res.json(DRILLS)
})

router.post(
  '/complete',
  upload.fields([{ name: 'audio', maxCount: 1 }]),
  (req: Request, res: Response) => {
    const files = req.files as Record<string, Express.Multer.File[]>
    const audioFile = files['audio']?.[0]

    const { exercise_type, duration_secs } = req.body
    if (!exercise_type) return res.status(400).json({ error: 'exercise_type is required' })

    const audioPath = audioFile ? path.relative(process.cwd(), audioFile.path) : null

    const result = db
      .prepare(
        'INSERT INTO drill_sessions (exercise_type, duration_secs, audio_path) VALUES (?, ?, ?)'
      )
      .run(exercise_type, duration_secs ?? null, audioPath)

    res.status(201).json({ id: Number(result.lastInsertRowid) })
  }
)

export default router
