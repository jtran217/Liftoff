import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Session } from '../types'
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

  useEffect(() => {
    if (!id) return
    fetch(`/api/sessions/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then(data => { setSession(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [id])

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
        />

        <div className="w-full">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">AI Feedback</p>
          <FeedbackCard review={session.review} />
        </div>

      </div>
    </div>
  )
}
