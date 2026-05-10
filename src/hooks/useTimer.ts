import { useState, useRef, useEffect } from 'react'

export interface TimerHandle {
  remaining: number
  isRunning: boolean
  progress: number  
  start: () => void
  stop: () => void
  reset: () => void
}

export function useTimer(totalSecs: number, onComplete?: () => void): TimerHandle {
  const [remaining, setRemaining] = useState(totalSecs)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function start(): void {
    if (intervalRef.current) return
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          setIsRunning(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function stop(): void {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }

  function reset(): void {
    stop()
    setRemaining(totalSecs)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const progress = (totalSecs - remaining) / totalSecs

  return { remaining, isRunning, progress, start, stop, reset }
}
