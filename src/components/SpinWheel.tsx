import { useState, useRef } from 'react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOPICS: string[] = [
  'your favourite movie',
  "a place you'd love to visit",
  "the best meal you've ever had",
  "a skill you wish you'd learned earlier",
  'your morning routine',
  'a book that changed how you think',
  'the most useful app on your phone',
  "a hobby you'd recommend to anyone",
  'your favourite season and why',
  'something you changed your mind about',
  "advice you'd give your younger self",
  'the last thing that made you laugh',
  'a sport or game you enjoy',
  'your ideal weekend',
  "something you're looking forward to",
]

const CATEGORIES = [
  { id: 'everyday-life', label: 'Everyday Life', emoji: '🌅', active: true },
  { id: 'work-career',   label: 'Work & Career',  emoji: '💼', active: false },
  { id: 'technology',    label: 'Technology',      emoji: '💻', active: false },
  { id: 'culture',       label: 'Culture & Arts',  emoji: '🎨', active: false },
]

// ─── Reel constants — used in getTargetX ──────────────────────────────────────

export const CARD_WIDTH = 176
export const CARD_GAP   = 10
export const ITEM_WIDTH = CARD_WIDTH + CARD_GAP  // 186px per slot

// Winner card lives at this repetition of the list in the strip
export const WINNER_REP = 3

const REPS = 6

const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
]

// Build the full strip: REPS copies of the topic list
const STRIP_ITEMS = Array.from({ length: REPS }, (_, rep) =>
  TOPICS.map((topic, i) => ({
    topic,
    color: ACCENT_COLORS[i % ACCENT_COLORS.length],
    key: `${rep}-${i}`,
  }))
).flat()

// ─── Component ────────────────────────────────────────────────────────────────

interface SpinWheelProps {
  onTopicSelected: (topic: string) => void
  disabled?: boolean
}

type Phase = 'category' | 'reel'

export default function SpinWheel({ onTopicSelected, disabled }: SpinWheelProps) {
  const [phase, setPhase]         = useState<Phase>('category')
  const [spinning, setSpinning]   = useState(false)
  const [resetting, setResetting] = useState(false)
  const [translateX, setTranslateX] = useState(0)
  const [winner, setWinner]       = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ─── IMPLEMENT THIS ─────────────────────────────────────────────────────────
  // Pick the winning topic index BEFORE the animation starts.
  // Return an integer between 0 and TOPICS.length - 1.
  // The winner must be locked in here — never re-roll mid-spin.
  function selectWinner(): number {
    return Math.floor(Math.random() * TOPICS.length)
  }

  function getTargetX(winnerIndex: number, containerWidth: number): number {
    const winnerGlobalIndex = WINNER_REP * TOPICS.length + winnerIndex
    const winnerCenter = winnerGlobalIndex * ITEM_WIDTH + ITEM_WIDTH / 2
    return containerWidth / 2 - winnerCenter
  }
  // ────────────────────────────────────────────────────────────────────────────

  function handleOpen() {
    if (spinning || disabled) return

    const winnerIndex = selectWinner()
    const containerWidth = containerRef.current?.offsetWidth ?? 640

    // Reset strip position without animation, then start the spin on the next paint
    setWinner(null)
    setTranslateX(0)
    setResetting(true)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = getTargetX(winnerIndex, containerWidth)
        setTranslateX(target)
        setResetting(false)
        setSpinning(true)

        setTimeout(() => {
          setSpinning(false)
          const topic = TOPICS[winnerIndex]
          setWinner(topic)
        }, 4300)
      })
    })
  }

  // ─── Category picker ────────────────────────────────────────────────────────

  if (phase === 'category') {
    return (
      <div className="flex flex-col items-center gap-5 w-full max-w-sm">
        <p className="text-gray-400 text-sm tracking-wide uppercase text-xs">Pick a category</p>
        <div className="grid grid-cols-2 gap-3 w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => cat.active && setPhase('reel')}
              disabled={!cat.active}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all text-left ${
                cat.active
                  ? 'border-indigo-500/60 bg-indigo-950/40 hover:bg-indigo-900/40 hover:border-indigo-400 cursor-pointer'
                  : 'border-gray-800 bg-gray-900/20 opacity-35 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{cat.label}</p>
                {!cat.active && (
                  <p className="text-xs text-gray-600 mt-0.5">Coming soon</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Reel ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-5 w-full">

      {/* Reel window */}
      <div className="relative w-full overflow-hidden select-none" ref={containerRef}>

        {/* Top + bottom pointer indicators */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
          style={{
            width: 0, height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '15px solid #f59e0b',
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20"
          style={{
            width: 0, height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderBottom: '15px solid #f59e0b',
          }}
        />

        {/* Center line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-px w-px bg-amber-400/25 z-10 pointer-events-none" />

        {/* Edge vignette — left */}
        <div
          className="absolute inset-y-0 left-0 w-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #030712 10%, transparent)' }}
        />
        {/* Edge vignette — right */}
        <div
          className="absolute inset-y-0 right-0 w-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #030712 10%, transparent)' }}
        />

        {/* Scrolling strip */}
        <div
          className="flex py-5"
          style={{
            transform: `translateX(${resetting ? 0 : translateX}px)`,
            transition: spinning && !resetting
              ? 'transform 4.3s cubic-bezier(0.07, 0.85, 0.15, 1)'
              : 'none',
            willChange: 'transform',
          }}
        >
          {STRIP_ITEMS.map(({ topic, color, key }) => (
            <div
              key={key}
              className="flex-shrink-0 flex flex-col rounded-xl overflow-hidden bg-gray-900 border border-gray-800/80"
              style={{ width: CARD_WIDTH, marginRight: CARD_GAP, height: 110 }}
            >
              <div className="flex-1 flex items-center justify-center p-3">
                <p className="text-white text-xs font-medium text-center leading-snug">
                  {topic}
                </p>
              </div>
              {/* CSGO-style rarity stripe at the bottom */}
              <div style={{ height: 4, background: color, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Post-spin: topic confirm card */}
      {winner && !spinning ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <div className="w-full bg-gray-900 border border-indigo-500/40 rounded-2xl px-6 py-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your topic</p>
            <p className="text-white font-semibold text-lg leading-snug">"{winner}"</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={handleOpen}
              className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-semibold transition-colors"
            >
              Reroll
            </button>
            <button
              onClick={() => onTopicSelected(winner)}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors"
            >
              Let's go →
            </button>
          </div>
          <button
            onClick={() => { setPhase('category'); setWinner(null); setTranslateX(0) }}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← Change category
          </button>
        </div>
      ) : (
        /* Pre-spin controls */
        <div className="flex items-center gap-5">
          <button
            onClick={() => { setPhase('category'); setWinner(null); setTranslateX(0) }}
            disabled={spinning}
            className="text-sm text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-30"
          >
            ← Category
          </button>
          <button
            onClick={handleOpen}
            disabled={spinning || !!disabled}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {spinning ? 'choosing...' : 'get your topic'}
          </button>
        </div>
      )}
    </div>
  )
}
