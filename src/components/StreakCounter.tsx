import { useEffect, useState } from 'react'
import { Streak } from '../types'

export default function StreakCounter() {
  const [streak, setStreak] = useState<Streak | null>(null)

  useEffect(() => {
    fetch('/api/streak').then(r => r.json()).then(setStreak)
  }, [])

  if (!streak) return (
    <div className="flex items-center gap-3 px-5 py-4 bg-gray-900 border border-gray-700 rounded-2xl animate-pulse">
      <div className="w-8 h-8 bg-gray-800 rounded-full" />
      <div className="w-20 h-6 bg-gray-800 rounded" />
    </div>
  )

  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-gray-900 border border-gray-700 rounded-2xl">
      <div className="text-3xl select-none">
        {streak.current > 0 ? '🔥' : '○'}
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{streak.current}</p>
        <p className="text-xs text-gray-500 mt-0.5">day streak</p>
      </div>
      {streak.completedToday && (
        <span className="ml-auto text-xs text-green-400 font-medium">Done today</span>
      )}
      {!streak.completedToday && (
        <span className="ml-auto text-xs text-gray-600">Not done yet</span>
      )}
    </div>
  )
}
