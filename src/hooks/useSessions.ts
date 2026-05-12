import { SessionType } from '../types'

interface SessionMetadata {
  type: SessionType
  topic?: string
  duration_secs: number
  question_id?: number
}

export interface SessionsHandle {
  saveSession: (audioBlob: Blob, metadata: SessionMetadata) => Promise<number>
}

export function useSessions(): SessionsHandle {
  async function saveSession(audioBlob: Blob, metadata: SessionMetadata): Promise<number> {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('metadata', JSON.stringify(metadata))
    const res = await fetch('/api/sessions', { method: 'POST', body: formData })
    const data = await res.json()
    return data.id
  }

  return { saveSession }
}
