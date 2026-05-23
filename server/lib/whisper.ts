import fs from 'fs'
import path from 'path'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const FILLER_WORDS = new Set(['um', 'uh', 'like', 'so', 'basically', 'literally', 'right'])

function readAudio(audioPath: string): Buffer | null {
  try {
    return fs.readFileSync(path.resolve(process.cwd(), audioPath))
  } catch (err) {
    console.error('[whisper] failed to read audio file:', err)
    return null
  }
}

export async function transcribe(audioPath: string): Promise<string | null> {
  if (!OPENAI_API_KEY) return null
  const audioBuffer = readAudio(audioPath)
  if (!audioBuffer) return null

  try {
    const form = new FormData()
    form.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm')
    form.append('model', 'whisper-1')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    })

    if (!response.ok) {
      console.error(`[whisper] API error ${response.status}:`, await response.text())
      return null
    }

    const data = await response.json() as { text?: string }
    return data.text?.trim() || null
  } catch (err) {
    console.error('[whisper] request failed:', err)
    return null
  }
}

export async function transcribeWithTimestamps(
  audioPath: string,
): Promise<{ word: string; start: number }[] | null> {
  if (!OPENAI_API_KEY) return null
  const audioBuffer = readAudio(audioPath)
  if (!audioBuffer) return null

  try {
    const form = new FormData()
    form.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm')
    form.append('model', 'whisper-1')
    form.append('response_format', 'verbose_json')
    form.append('timestamp_granularities[]', 'word')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    })

    if (!response.ok) {
      console.error(`[whisper] timestamps API error ${response.status}:`, await response.text())
      return null
    }

    const data = await response.json() as { words?: { word: string; start: number }[] }
    return (data.words ?? [])
      .filter(w => FILLER_WORDS.has(w.word.toLowerCase().replace(/[^a-z]/g, '')))
      .map(w => ({ word: w.word.trim(), start: w.start }))
  } catch (err) {
    console.error('[whisper] timestamps request failed:', err)
    return null
  }
}
