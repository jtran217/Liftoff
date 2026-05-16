import { useEffect, useState } from 'react'
import { Session } from '../types'

function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA')
}

function buildLast14Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d.toLocaleDateString('en-CA')
  })
}

function shortLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)
}

export default function ActivityHeatmap() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/sessions').then(r => r.json()).then((sessions: Session[]) => {
      const map: Record<string, number> = {}
      sessions.forEach(s => {
        const day = toLocalDate(s.recorded_at)
        map[day] = (map[day] ?? 0) + 1
      })
      setCounts(map)
    })
  }, [])

  const days = buildLast14Days()

  function cellColor(count: number): string {
    if (count === 0) return 'bg-gray-800'
    if (count === 1) return 'bg-indigo-900'
    if (count <= 3) return 'bg-indigo-700'
    return 'bg-indigo-500'
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500 uppercase tracking-widest">Last 14 days</p>
      <div className="flex gap-1.5">
        {days.map(day => {
          const count = counts[day] ?? 0
          return (
            <div key={day} className="flex flex-col items-center gap-1 flex-1">
              <div
                title={`${day}: ${count} session${count !== 1 ? 's' : ''}`}
                className={`w-full aspect-square rounded-sm transition-colors ${cellColor(count)}`}
              />
              <span className="text-[9px] text-gray-600">{shortLabel(day)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
