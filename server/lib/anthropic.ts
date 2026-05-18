import Anthropic from '@anthropic-ai/sdk'
import { SessionType } from '../../src/types'

const client = new Anthropic()

export interface RawReview {
  wpm: number | null
  filler_words: Record<string, number> | null
  filler_count: number | null
  clarity_score: number | null
  structure_score: number | null
  confidence_score: number | null
  star_feedback: { situation: string; task: string; action: string; result: string } | null
  ai_notes: string[] | null
}

interface ReviewInput {
  transcript: string
  type: SessionType
  duration_secs: number | null
  question?: string | null
  category?: string | null
}

export async function generateReview(input: ReviewInput): Promise<RawReview | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null

  const prompt = input.type === 'behavioural'
    ? buildBehaviouralPrompt(input)
    : buildSelfImprovementPrompt(input)

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : null
  if (!text) return null

  try {
    return JSON.parse(text) as RawReview
  } catch {
    console.error('[anthropic] failed to parse response:', text)
    return null
  }
}

function buildSelfImprovementPrompt({ transcript, duration_secs }: ReviewInput): string {
  return `You are a speaking coach analyzing a 60-second free-form response.

Transcript:
"""
${transcript}
"""

Analyze delivery ONLY — do not comment on content or whether the answer is "good".

Return a JSON object with this exact shape:
{
  "wpm": <integer>,
  "filler_words": { "<word>": <count> },
  "filler_count": <integer>,
  "silence_count": <integer>,
  "duration_seconds": <integer>,
  "clarity_score": <integer 1-10>,
  "ai_notes": ["<specific coaching note>", "<specific coaching note>", "<specific coaching note>"]
}

Filler words to count: um, uh, like, so, you know, basically, literally, right (when used as a filler).
WPM = total word count / (duration_seconds / 60). Duration is ${duration_secs ?? 60} seconds.
AI notes must be specific and actionable — reference exact moments in the transcript. No generic advice.
Return only valid JSON. No markdown, no preamble.`
}

function buildBehaviouralPrompt({ transcript, duration_secs, question, category }: ReviewInput): string {
  return `You are an interview coach evaluating a SWE behavioural answer.

Question: ${question ?? 'Unknown'}
Competency: ${category ?? 'Unknown'}

Transcript:
"""
${transcript}
"""

Evaluate both STAR structure and delivery.

Return a JSON object with this exact shape:
{
  "wpm": <integer>,
  "filler_words": { "<word>": <count> },
  "filler_count": <integer>,
  "silence_count": <integer>,
  "duration_seconds": <integer>,
  "clarity_score": <integer 1-10>,
  "structure_score": <integer 1-10>,
  "confidence_score": <integer 1-10>,
  "star_feedback": {
    "situation": "<feedback string>",
    "task": "<feedback string>",
    "action": "<feedback string>",
    "result": "<feedback string>"
  },
  "ai_notes": ["<note 1>", "<note 2>", "<note 3>", "<note 4>", "<note 5>"]
}

AI notes should address both delivery AND content — reference actual lines from the transcript.
WPM = total word count / (duration_seconds / 60). Duration: ${duration_secs ?? 180} seconds.
Return only valid JSON. No markdown, no preamble.`
}
