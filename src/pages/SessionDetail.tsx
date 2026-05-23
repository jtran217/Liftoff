import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Session, Comparison } from '../types'
import Player from '../components/Player'
import FeedbackCard from '../components/FeedbackCard'

function uploadUrl(storedPath: string): string {
  const filename = storedPath.replace(/\\/g, '/').split('/').pop()!
  return `/uploads/${filename}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
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

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [otherSessions, setOtherSessions] = useState<Session[]>([])
  const [compareId, setCompareId] = useState<string>('')
  const [comparing, setComparing] = useState(false)
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [compareError, setCompareError] = useState<string | null>(null)

  function fetchSession() {
    if (!id) return
    return fetch(`/api/sessions/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then(data => { setSession(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }

  useEffect(() => { fetchSession() }, [id])

  useEffect(() => {
    if (!session?.question_id) return
    fetch(`/api/sessions?type=behavioural&question_id=${session.question_id}`)
      .then(r => r.json())
      .then((rows: Session[]) => setOtherSessions(rows.filter(s => s.id !== session.id)))
      .catch(() => {})
  }, [session?.id, session?.question_id])

  async function handleCompare() {
    if (!session || !compareId) return
    setComparing(true)
    setCompareError(null)
    const res = await fetch('/api/comparisons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_a: Number(compareId), session_b: session.id }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      setCompareError(body.error ?? 'Comparison failed')
      setComparing(false)
      return
    }
    const data = await res.json() as Comparison
    setComparison(data)
    setComparing(false)
  }

  async function handleGenerateFeedback() {
    if (!session) return
    setGenerating(true)
    setGenerateError(null)
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      setGenerateError(body.error ?? 'Failed to generate feedback')
      setGenerating(false)
      return
    }
    await fetchSession()
    setGenerating(false)
  }

  const backPath = session?.type === 'behavioural' ? '/behavioural'
    : session?.type === 'self-improvement' ? '/self-improvement'
    : '/history'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Session not found</p>
        <Link to="/history" className="text-indigo-400 hover:text-indigo-300 text-sm">
          ← Back to history
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-8">
      <Link to={backPath} className="text-gray-500 hover:text-gray-300 text-sm transition-colors w-fit">
        ← Back
      </Link>

      <div className="flex-1 flex flex-col items-center pt-8 gap-6 max-w-lg mx-auto w-full">

        <div className="w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              {typeLabel(session.type)}
            </span>
            <span className="text-xs text-gray-600">{formatDate(session.recorded_at)}</span>
            {session.duration_secs != null && (
              <span className="text-xs text-gray-600">{Math.round(session.duration_secs)}s</span>
            )}
            {session.bookmarked === 1 && (
              <span className="text-xs text-yellow-500">Bookmarked</span>
            )}
          </div>

          {session.topic && (
            <h1 className="text-xl font-semibold leading-snug">"{session.topic}"</h1>
          )}
        </div>

        <Player
          audioUrl={uploadUrl(session.audio_path)}
          videoUrl={session.video_path ? uploadUrl(session.video_path) : null}
          sessionId={session.id}
          initialRating={session.self_rating}
          initialNotes={session.notes}
          fillerTimestamps={session.review?.filler_words?.timestamps}
        />

        <div className="w-full">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">AI Feedback</p>

          {session.review ? (
            <FeedbackCard review={session.review} />
          ) : session.transcript ? (
            <div className="flex flex-col gap-3">
              {generateError && (
                <p className="text-xs text-red-400">{generateError}</p>
              )}
              <button
                onClick={handleGenerateFeedback}
                disabled={generating}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {generating ? 'Generating…' : 'Generate AI feedback'}
              </button>
            </div>
          ) : (
            <div className="px-5 py-5 bg-gray-900 border border-gray-700 rounded-2xl text-center">
              <p className="text-sm text-gray-500">Transcription in progress…</p>
              <p className="text-xs text-gray-600 mt-1">Check back in a few seconds</p>
            </div>
          )}
        </div>

        {session.type === 'behavioural' && otherSessions.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Compare with earlier attempt</p>

            {comparison ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-300">{comparison.summary}</p>
                {comparison.improvements.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-green-400 uppercase">Improved</p>
                    {comparison.improvements.map((item, i) => (
                      <div key={i} className="flex gap-2 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl">
                        <span className="text-green-500 flex-shrink-0">↑</span>
                        <p className="text-sm text-gray-300">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
                {comparison.regressions.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-red-400 uppercase">Regressed</p>
                    {comparison.regressions.map((item, i) => (
                      <div key={i} className="flex gap-2 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl">
                        <span className="text-red-500 flex-shrink-0">↓</span>
                        <p className="text-sm text-gray-300">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
                {comparison.unchanged.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Unchanged</p>
                    {comparison.unchanged.map((item, i) => (
                      <div key={i} className="flex gap-2 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl">
                        <span className="text-gray-500 flex-shrink-0">→</span>
                        <p className="text-sm text-gray-300">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setComparison(null)}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Compare with a different attempt
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <select
                  value={compareId}
                  onChange={e => setCompareId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select an earlier attempt…</option>
                  {otherSessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {s.duration_secs ? ` — ${Math.round(s.duration_secs)}s` : ''}
                      {s.self_rating ? ` — ${s.self_rating}/5` : ''}
                    </option>
                  ))}
                </select>
                {compareError && <p className="text-xs text-red-400">{compareError}</p>}
                <button
                  onClick={handleCompare}
                  disabled={!compareId || comparing}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {comparing ? 'Comparing…' : 'Compare'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
