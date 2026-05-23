export type SessionType = 'behavioural' | 'self-improvement' | 'drill'

export interface Question {
  id: number
  category: string
  lp_tag: string | null
  text: string
  difficulty: number
  is_custom: number
}

export interface Session {
  id: number
  question_id: number | null
  type: SessionType
  recorded_at: string
  audio_path: string
  video_path: string | null
  transcript: string | null
  duration_secs: number | null
  topic: string | null
  self_rating: number | null
  notes: string | null
  bookmarked: number
  review?: AiReview
}

export interface AiReview {
  id: number
  session_id: number
  created_at: string
  star_feedback: StarFeedback | null
  filler_words: FillerWords | null
  wpm: number | null
  clarity_score: number | null
  structure_score: number | null
  confidence_score: number | null
  ai_notes: string[] | null
}

export interface StarFeedback {
  situation: string
  task: string
  action: string
  result: string
}

export interface FillerWords {
  count: number
  words: { word: string; count: number }[]
  timestamps?: { word: string; start: number }[]
}

export interface Streak {
  current: number
  completedToday: boolean
}

export interface Comparison {
  id: number
  improvements: string[]
  regressions: string[]
  unchanged: string[]
  summary: string
}

export type DrillType =
  | 'pen_drill'
  | 'paragraph_read'
  | 'tongue_twister'
  | 'pacing'
  | 'projection'

export interface Drill {
  id: DrillType
  label: string
  durationSecs: number
  recordingMode: 'none' | 'optional' | 'required'
  description: string
}
