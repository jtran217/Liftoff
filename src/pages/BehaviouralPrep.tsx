import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Question } from '../types'
import Timer from '../components/Timer'
import Recorder from '../components/Recorder'
import STARGuide from '../components/STARGuide'
import { useTimer } from '../hooks/useTimer'
import { useRecorder } from '../hooks/useRecorder'
import { useSessions } from '../hooks/useSessions'

type Stage = 'select' | 'question' | 'recording' | 'done'

const MAX_SECS = 180
const WARN_SECS = 120

export default function BehaviouralPrep() {
  const [stage, setStage] = useState<Stage>('select')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [question, setQuestion] = useState<Question | null>(null)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [warned, setWarned] = useState(false)

  const recordingTimer = useTimer(MAX_SECS, handleRecordingComplete)
  const recorder = useRecorder()
  const { saveSession } = useSessions()

  useEffect(() => {
    fetch('/api/questions/categories')
      .then(r => r.json())
      .then(setCategories)
  }, [])

  useEffect(() => {
    if (!selectedCategory) { setQuestions([]); return }
    fetch(`/api/questions?category=${encodeURIComponent(selectedCategory)}`)
      .then(r => r.json())
      .then(setQuestions)
  }, [selectedCategory])

  useEffect(() => {
    if (stage === 'recording' && !warned && recordingTimer.remaining <= MAX_SECS - WARN_SECS) {
      setWarned(true)
    }
  }, [recordingTimer.remaining, stage, warned])

  function handleQuestionSelect(q: Question) {
    setQuestion(q)
    setStage('question')
  }

  async function handleRandomQuestion() {
    const url = selectedCategory
      ? `/api/questions/random?category=${encodeURIComponent(selectedCategory)}`
      : '/api/questions/random'
    const r = await fetch(url)
    const q: Question = await r.json()
    handleQuestionSelect(q)
  }

  async function handleStartRecording() {
    setStage('recording')
    await recorder.startRecording()
    recordingTimer.start()
  }

  function handleRecordingComplete() {
    recorder.stopRecording()
    setStage('done')
  }

  function handleStopEarly() {
    recordingTimer.stop()
    recorder.stopRecording()
    setStage('done')
  }

  async function handleSave() {
    if (!recorder.audioBlob || !question) return
    setSaving(true)
    const id = await saveSession(recorder.audioBlob, {
      type: 'behavioural',
      question_id: question.id,
      duration_secs: recorder.durationSecs,
    })
    setSavedId(id)
    setSaving(false)
  }

  function handleReset() {
    recordingTimer.reset()
    setStage('select')
    setSelectedCategory(null)
    setQuestion(null)
    setSavedId(null)
    setWarned(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-8">
      <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors w-fit">
        ← Back
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-lg mx-auto w-full">

        {stage === 'select' && (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Behavioural Prep</h1>
              <p className="text-gray-400 text-sm mt-1">Pick a competency to practice</p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(c => c === cat ? null : cat)}
                  className={`w-full py-3 px-5 rounded-xl text-left font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-700 border border-indigo-500 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 border border-transparent text-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button onClick={handleRandomQuestion} className="btn-primary">
              Random question
            </button>

            {selectedCategory && questions.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                <p className="text-xs text-gray-500 uppercase tracking-widest">{selectedCategory}</p>
                {questions.map(q => (
                  <button
                    key={q.id}
                    onClick={() => handleQuestionSelect(q)}
                    className="w-full py-3 px-5 rounded-xl text-left bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <span className="text-sm text-gray-200 leading-relaxed">{q.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {stage === 'question' && question && (
          <div className="flex flex-col gap-5 w-full">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{question.category}</p>
              <h1 className="text-lg font-semibold leading-snug text-white">{question.text}</h1>
            </div>

            <STARGuide />

            <button onClick={handleStartRecording} className="btn-primary">
              Start recording →
            </button>
            <button onClick={() => setStage('select')} className="btn-secondary">
              ← Pick another question
            </button>
          </div>
        )}

        {stage === 'recording' && question && (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="text-center max-w-sm">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{question.category}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{question.text}</p>
            </div>

            {warned && (
              <div className="w-full max-w-sm px-4 py-2 bg-yellow-950 border border-yellow-800 rounded-xl text-xs text-yellow-400 text-center">
                2 minutes — start wrapping up
              </div>
            )}

            <Timer
              remaining={recordingTimer.remaining}
              total={MAX_SECS}
              isRunning={recordingTimer.isRunning}
            />

            <Recorder
              isRecording={recorder.isRecording}
              audioBlob={recorder.audioBlob}
              durationSecs={recorder.durationSecs}
              onStart={recorder.startRecording}
              onStop={handleStopEarly}
            />

            <button
              onClick={handleStopEarly}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Stop early
            </button>
          </div>
        )}

        {stage === 'done' && (
          <div className="flex flex-col items-center gap-5 w-full max-w-xs">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Done</h1>
              <p className="text-gray-400 text-sm mt-1">Good work</p>
            </div>

            {savedId !== null ? (
              <>
                <p className="text-green-400 text-sm font-medium">Session saved</p>
                <Link to={`/sessions/${savedId}`} className="btn-secondary">
                  Play back & rate
                </Link>
              </>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving || !recorder.audioBlob}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save session'}
              </button>
            )}

            <button onClick={handleReset} className="btn-secondary">
              Try another question
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
