import { AiReview } from '../types'

interface FeedbackCardProps {
  review?: AiReview | null
}

export default function FeedbackCard({ review }: FeedbackCardProps) {
  if (!review) {
    return (
      <div className="w-full px-5 py-5 bg-gray-900 border border-gray-700 rounded-2xl text-center">
        <p className="text-sm text-gray-500">AI feedback not available</p>
        <p className="text-xs text-gray-600 mt-1">Requires Whisper transcription — Phase 2</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {review.clarity_score != null && (
          <ScoreCell label="Clarity" value={review.clarity_score} />
        )}
        {review.structure_score != null && (
          <ScoreCell label="Structure" value={review.structure_score} />
        )}
        {review.confidence_score != null && (
          <ScoreCell label="Confidence" value={review.confidence_score} />
        )}
      </div>


      {review.wpm != null && (
        <div className="px-5 py-3 bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-between">
          <span className="text-sm text-gray-400">Words per minute</span>
          <span className={`font-bold ${review.wpm >= 130 && review.wpm <= 160 ? 'text-green-400' : 'text-yellow-400'}`}>
            {review.wpm} wpm
          </span>
        </div>
      )}

      {review.star_feedback && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">STAR feedback</p>
          {Object.entries(review.star_feedback).map(([key, val]) => (
            <div key={key} className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl">
              <p className="text-xs font-semibold text-indigo-400 uppercase mb-1">{key}</p>
              <p className="text-sm text-gray-300">{val}</p>
            </div>
          ))}
        </div>
      )}

      {review.ai_notes && review.ai_notes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Coaching notes</p>
          {review.ai_notes.map((note, i) => (
            <div key={i} className="flex gap-3 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl">
              <span className="text-indigo-500 text-sm font-bold flex-shrink-0">{i + 1}.</span>
              <p className="text-sm text-gray-300">{note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? 'text-green-400' : value >= 4 ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-3 bg-gray-900 border border-gray-700 rounded-xl">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
