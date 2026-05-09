import { Router, Request, Response } from 'express'
import db from '../db/db'
import { Streak } from '../../src/types'

const router = Router()

function toLocalDateStr(isoDatetime: string): string {
  return new Date(isoDatetime).toLocaleDateString('en-CA') // YYYY-MM-DD
}

function todayStr(): string {
  return new Date().toLocaleDateString('en-CA')
}

router.get('/', (_req: Request, res: Response) => {
  // Collect all distinct days that had at least one session or drill
  const sessionDates = (
    db.prepare('SELECT recorded_at FROM sessions ORDER BY recorded_at DESC').all() as {
      recorded_at: string
    }[]
  ).map((r) => toLocalDateStr(r.recorded_at))

  const drillDates = (
    db.prepare('SELECT completed_at FROM drill_sessions ORDER BY completed_at DESC').all() as {
      completed_at: string
    }[]
  ).map((r) => toLocalDateStr(r.completed_at))

  const allDays = [...new Set([...sessionDates, ...drillDates])].sort((a, b) =>
    b.localeCompare(a)
  )

  const today = todayStr()
  const completedToday = allDays[0] === today

  // Walk backwards from today counting consecutive days
  let streak = 0
  const cursor = new Date()
  for (let i = 0; i < allDays.length; i++) {
    const expected = cursor.toLocaleDateString('en-CA')
    if (allDays[i] === expected) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (i === 0 && !completedToday) {
      // Today missed — start streak check from yesterday
      cursor.setDate(cursor.getDate() - 1)
      if (allDays[0] === cursor.toLocaleDateString('en-CA')) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    } else {
      break
    }
  }

  const result: Streak = { current: streak, completedToday }
  res.json(result)
})

export default router
