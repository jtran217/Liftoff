import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Session, SessionType } from '../types'
import ActivityHeatmap from '../components/ActivityHeatmap'

type Filter = 'all' | SessionType | 'bookmarked'

function uploadUrl(storedPath: string): string {
  const filename = storedPath.replace(/\\/g, '/').split('/').pop()!
  return `/uploads/${filename}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function typeLabel(type: string): string {
  if (type === 'behavioural') return 'Behavioural'
  if (type === 'self-improvement') return 'Self Improvement'
  if (type === 'drill') return 'Drill'
  return type
}

function typeBadgeColor(type: string): string {
  if (type === 'behavioural') return 'bg-indigo-900 text-indigo-300'
  if (type === 'self-improvement') return 'bg-purple-900 text-purple-300'
  return 'bg-gray-800 text-gray-400'
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'behavioural', label: 'Behavioural' },
  { key: 'self-improvement', label: 'Self Improvement' },
  { key: 'bookmarked', label: 'Bookmarked' },
]

export default function History() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then((data: Session[]) => { setSessions(data); setLoading(false) })
  }, [])

  const filtered = sessions.filter(s => {
    if (filter === 'bookmarked') return s.bookmarked === 1
    if (filter === 'all') return true
    return s.type === filter
  })

  async function toggleBookmark(session: Session) {
    setTogglingId(session.id)
    const newVal = session.bookmarked === 1 ? 0 : 1
    await fetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked: newVal }),
    })
    setSessions(prev =>
      prev.map(s => s.id === session.id ? { ...s, bookmarked: newVal } : s)
    )
    setTogglingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-8">
      <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors w-fit">
        ← Back
      </Link>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full pt-6 gap-6">

        <h1 className="text-2xl font-bold">History</h1>

        <ActivityHeatmap />

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-gray-500">No sessions yet</p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Show all
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map(session => (
              <div
                key={session.id}
                className="flex items-start gap-4 px-5 py-4 bg-gray-900 border border-gray-700 hover:border-gray-600 rounded-2xl transition-colors"
              >
                <Link to={`/sessions/${session.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadgeColor(session.type)}`}>
                      {typeLabel(session.type)}
                    </span>
                    <span className="text-xs text-gray-600">{formatDate(session.recorded_at)}</span>
                    {session.duration_secs != null && (
                      <span className="text-xs text-gray-600">{Math.round(session.duration_secs)}s</span>
                    )}
                  </div>

                  {session.topic && (
                    <p className="text-sm text-gray-200 font-medium truncate">"{session.topic}"</p>
                  )}

                  {session.self_rating != null && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <span
                          key={n}
                          className={`text-xs ${n <= session.self_rating! ? 'text-indigo-400' : 'text-gray-700'}`}
                        >
                          ●
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    {uploadUrl(session.audio_path).split('/').pop()}
                  </p>
                </Link>
                <button
                  onClick={() => toggleBookmark(session)}
                  disabled={togglingId === session.id}
                  className={`flex-shrink-0 text-lg transition-opacity ${
                    togglingId === session.id ? 'opacity-30' : 'opacity-100'
                  } ${session.bookmarked === 1 ? 'text-yellow-400' : 'text-gray-700 hover:text-gray-500'}`}
                  aria-label={session.bookmarked === 1 ? 'Remove bookmark' : 'Bookmark'}
                >
                  {session.bookmarked === 1 ? '★' : '☆'}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <p className="text-xs text-gray-700 text-center pb-4">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
          </p>
        )}

      </div>
    </div>
  )
}
