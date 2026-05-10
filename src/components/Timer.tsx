interface TimerProps {
  remaining: number
  total: number
  isRunning: boolean
}

export default function Timer({ remaining, total, isRunning }: TimerProps) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const progress = remaining / total
  const dashoffset = circumference * (1 - progress)

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const isLow = remaining <= 10 && remaining > 0

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg
        className="absolute inset-0 -rotate-90"
        width="144"
        height="144"
        viewBox="0 0 144 144"
      >
        {/* Track */}
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#1f2937" strokeWidth="10" />
        {/* Progress ring */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={isLow ? '#ef4444' : '#6366f1'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{
            transition: isRunning
              ? 'stroke-dashoffset 1s linear, stroke 0.3s ease'
              : 'stroke 0.3s ease',
          }}
        />
      </svg>
      <span
        className={`text-3xl font-mono font-bold tabular-nums transition-colors ${
          isLow ? 'text-red-400' : 'text-white'
        }`}
      >
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  )
}
