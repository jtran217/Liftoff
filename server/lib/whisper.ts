import fs from 'fs'
import path from 'path'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function transcribe(audioPath: string): Promise<string | null> {
  if (!OPENAI_API_KEY) return null

  const absAudioPath = path.resolve(process.cwd(), audioPath)

  let audioBuffer: Buffer
  try {
    audioBuffer = fs.readFileSync(absAudioPath)
  } catch (err) {
    console.error('[whisper] failed to read audio file:', err)
    return null
  }

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
