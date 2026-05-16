import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface PlayerProps {
  audioUrl: string
  videoUrl?: string | null
  sessionId: number
  initialRating?: number | null
  initialNotes?: string | null
  onSaved?: () => void
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function Player({
  audioUrl,
  videoUrl,
  sessionId,
  initialRating,
  initialNotes,
  onSaved,
}: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [rating, setRating] = useState(initialRating ?? 0)
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#374151',
      progressColor: '#4f46e5',
      cursorColor: '#818cf8',
      height: 72,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
    })

    ws.load(audioUrl)
    ws.on('ready', () => setDuration(ws.getDuration()))
    ws.on('audioprocess', () => setCurrentTime(ws.getCurrentTime()))
    ws.on('seeking', () => setCurrentTime(ws.getCurrentTime()))
    ws.on('finish', () => setPlaying(false))

    wsRef.current = ws
    return () => { ws.destroy() }
  }, [audioUrl])

  function togglePlay() {
    if (!wsRef.current) return
    wsRef.current.playPause()
    setPlaying(p => !p)
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ self_rating: rating || null, notes: notes || null }),
    })
    setSaving(false)
    setSaved(true)
    onSaved?.()
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Waveform */}
      <div className="bg-gray-900 rounded-xl px-4 pt-4 pb-3 border border-gray-700">
        <div ref={containerRef} />
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center flex-shrink-0 transition-colors"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <span className="flex gap-[3px]">
                <span className="w-[3px] h-4 bg-white rounded-full" />
                <span className="w-[3px] h-4 bg-white rounded-full" />
              </span>
            ) : (
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <span className="text-xs text-gray-400 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {videoUrl && (
        <video
          src={videoUrl}
          controls
          className="w-full rounded-xl border border-gray-700 bg-black"
        />
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-400">Self rating</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
                rating === n
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
              }`}
            >
              {n}
            </button>
          ))}
          {rating > 0 && (
            <button
              onClick={() => setRating(0)}
              className="px-3 h-10 rounded-xl text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              clear
            </button>
          )}
        </div>
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={3}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
      />

      <button
        onClick={handleSave}
        disabled={saving || saved}
        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saved ? 'Saved' : saving ? 'Saving…' : 'Save notes'}
      </button>
    </div>
  )
}
