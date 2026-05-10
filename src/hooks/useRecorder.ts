import { useState, useRef } from 'react'

export interface RecorderHandle {
  isRecording: boolean
  audioBlob: Blob | null
  durationSecs: number
  startRecording: () => Promise<void>
  stopRecording: () => void
}

export function useRecorder(): RecorderHandle {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [durationSecs, setDurationSecs] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)

  async function startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })

    mediaRecorder.addEventListener('dataavailable', (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    })

    mediaRecorder.addEventListener('stop', () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
      setAudioBlob(blob)
      setDurationSecs((Date.now() - startTimeRef.current) / 1000)
      setIsRecording(false)
      chunksRef.current = []
      stream.getTracks().forEach(t => t.stop())
    })

    mediaRecorderRef.current = mediaRecorder
    startTimeRef.current = Date.now()
    mediaRecorder.start(100)
    setIsRecording(true)
  }

  function stopRecording(): void {
    mediaRecorderRef.current?.stop()
  }

  return { isRecording, audioBlob, durationSecs, startRecording, stopRecording }
}
