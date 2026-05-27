import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

import questionsRouter from './routes/questions'
import sessionsRouter from './routes/sessions'
import drillsRouter from './routes/drills'
import streakRouter from './routes/streak'
import reviewsRouter from './routes/reviews'
import comparisonsRouter from './routes/comparisons'
import progressRouter from './routes/progress'
import exportRouter from './routes/export'

const PORT = Number(process.env.PORT ?? 3001)
const UPLOADS_DIR = path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'server/uploads')

fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const app = express()
app.use(cors())
app.use(express.json())

app.use('/uploads', express.static(UPLOADS_DIR))

app.use('/api/questions', questionsRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/drills', drillsRouter)
app.use('/api/streak', streakRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/comparisons', comparisonsRouter)
app.use('/api/progress', progressRouter)
app.use('/api/export', exportRouter)

app.listen(PORT, () => {
  console.log(`Liftoff server running on http://localhost:${PORT}`)
})
