import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

interface ProgressPoint {
  recorded_at: string
  type: string
  self_rating: number | null
  wpm: number | null
  clarity_score: number | null
  structure_score: number | null
  confidence_score: number | null
}

interface ChartPoint {
  date: string
  self_rating?: number
  clarity?: number
  structure?: number
  confidence?: number
  wpm?: number
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CHART_STYLE = {
  fontSize: 11,
  fill: '#9ca3af',
}

export default function ProgressDashboard() {
  const [data, setData] = useState<ProgressPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.json())
      .then((rows: ProgressPoint[]) => { setData(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  const ratingPoints: ChartPoint[] = data
    .filter(d => d.self_rating != null)
    .map(d => ({ date: shortDate(d.recorded_at), self_rating: d.self_rating! }))

  const aiPoints: ChartPoint[] = data
    .filter(d => d.clarity_score != null || d.structure_score != null || d.confidence_score != null)
    .map(d => ({
      date: shortDate(d.recorded_at),
      ...(d.clarity_score != null && { clarity: d.clarity_score }),
      ...(d.structure_score != null && { structure: d.structure_score }),
      ...(d.confidence_score != null && { confidence: d.confidence_score }),
    }))

  const wpmPoints: ChartPoint[] = data
    .filter(d => d.wpm != null)
    .map(d => ({ date: shortDate(d.recorded_at), wpm: d.wpm! }))

  const hasRating = ratingPoints.length > 0
  const hasAi = aiPoints.length > 0
  const hasWpm = wpmPoints.length > 0
  const hasAny = hasRating || hasAi || hasWpm

  if (!hasAny) {
    return (
      <div className="w-full px-5 py-5 bg-gray-900 border border-gray-700 rounded-2xl text-center">
        <p className="text-sm text-gray-500">No data yet</p>
        <p className="text-xs text-gray-600 mt-1">Complete sessions and rate them to see trends here</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {hasRating && (
        <ChartCard title="Self-rating">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={ratingPoints} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={CHART_STYLE} tickLine={false} axisLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={CHART_STYLE} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Line type="monotone" dataKey="self_rating" name="Rating" stroke="#818cf8" strokeWidth={2} dot={{ r: 3, fill: '#818cf8' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {hasAi && (
        <ChartCard title="AI scores">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={aiPoints} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={CHART_STYLE} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={CHART_STYLE} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
              <Line type="monotone" dataKey="clarity" name="Clarity" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#34d399' }} activeDot={{ r: 5 }} connectNulls />
              <Line type="monotone" dataKey="structure" name="Structure" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: '#60a5fa' }} activeDot={{ r: 5 }} connectNulls />
              <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#f472b6" strokeWidth={2} dot={{ r: 3, fill: '#f472b6' }} activeDot={{ r: 5 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {hasWpm && (
        <ChartCard title="Words per minute">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={wpmPoints} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={CHART_STYLE} tickLine={false} axisLine={false} />
              <YAxis tick={CHART_STYLE} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#fbbf24' }}
              />
              {/* target band: 130–160 wpm */}
              <Line type="monotone" dataKey="wpm" name="WPM" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3, fill: '#fbbf24' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full px-4 py-4 bg-gray-900 border border-gray-700 rounded-2xl">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  )
}
