import { useState } from 'react'
import { Link } from 'react-router-dom'
import SpinWheel from '../components/SpinWheel'
import Timer from '../components/Timer'
import Recorder from '../components/Recorder'
import { useTimer } from '../hooks/useTimer'
import { useRecorder } from '../hooks/useRecorder'
import { useSessions } from '../hooks/useSessions'

type Stage = 'spin' | 'prep' | 'brainstorm' | 'recording' | 'done'

const BRAINSTORM_SECS = 60
const RECORDING_SECS  = 60

export default function SelfImprovement() {
  const [stage, setStage]   = useState<Stage>('spin')
  const [topic, setTopic]   = useState<string | null>(null)
  const [saved, setSaved]   = useState(false)
  const [saving, setSaving] = useState(false)

  const brainstormTimer = useTimer(BRAINSTORM_SECS, handleBrainstormComplete)
  const recordingTimer  = useTimer(RECORDING_SECS, handleRecordingComplete)
  const recorder        = useRecorder()
  const { saveSession } = useSessions()


  function handleTopicSelected(selectedTopic: string) {
    setTopic(selectedTopic)
    setStage('prep')
  }

  function handleStartBrainstorm() {
    setStage('brainstorm')
    brainstormTimer.start()
  }

  async function handleStartRecording() {
    brainstormTimer.stop()
    setStage('recording')
    await recorder.startRecording()
    recordingTimer.start()
  }

  function handleBrainstormComplete() {
    handleStartRecording()
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
    if (!recorder.audioBlob || !topic) return
    setSaving(true)
    await saveSession(recorder.audioBlob, {
      type: 'self-improvement',
      topic,
      duration_secs: recorder.durationSecs,
    })
    setSaving(false)
    setSaved(true)
  }

  function handleReset() {
    brainstormTimer.reset()
    recordingTimer.reset()
    setStage('spin')
    setTopic(null)
    setSaved(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-8">
      <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors w-fit">
        ← Back
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        {/* ── Spin ── */}
        {stage === 'spin' && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Self Improvement</h1>
              <p className="text-gray-400 text-sm mt-1">Pick a category, then open your topic</p>
            </div>
            <SpinWheel onTopicSelected={handleTopicSelected} />
          </>
        )}

        {/* ── Prep: brainstorm or go straight in ── */}
        {stage === 'prep' && topic && (
          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Ready?</h1>
              <p className="text-gray-400 text-sm mt-1">You've got your topic</p>
            </div>

            {/* Topic card */}
            <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-6 py-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Topic</p>
              <p className="text-white font-semibold text-lg leading-snug">"{topic}"</p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleStartBrainstorm}
                className="w-full py-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-left px-5 group"
              >
                <p className="font-semibold text-white">1 min brainstorm</p>
                <p className="text-xs text-gray-500 mt-0.5">Gather your thoughts, then recording starts</p>
              </button>
              <button
                onClick={handleStartRecording}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-left px-5"
              >
                <p className="font-semibold text-white">Start recording</p>
                <p className="text-xs text-indigo-300 mt-0.5">Jump straight in — 60 second response</p>
              </button>
            </div>

            <button
              onClick={() => setStage('spin')}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              ← Pick another topic
            </button>
          </div>
        )}

        {/* ── Brainstorm countdown ── */}
        {stage === 'brainstorm' && topic && (
          <div className="flex flex-col items-center gap-8 w-full max-w-sm">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Brainstorm</h1>
              <p className="text-gray-400 text-sm mt-1">Organise your thoughts — recording starts after</p>
            </div>

            {/* Topic reminder */}
            <p className="text-gray-300 text-sm text-center">
              "{topic}"
            </p>

            <Timer
              remaining={brainstormTimer.remaining}
              total={BRAINSTORM_SECS}
              isRunning={brainstormTimer.isRunning}
            />

            <button
              onClick={handleStartRecording}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors"
            >
              Start recording →
            </button>
          </div>
        )}

        {/* ── Recording ── */}
        {stage === 'recording' && topic && (
          <div className="flex flex-col items-center gap-8 w-full max-w-sm">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Recording</h1>
              <p className="text-gray-300 text-sm mt-1">"{topic}"</p>
            </div>

            <Timer
              remaining={recordingTimer.remaining}
              total={RECORDING_SECS}
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

        {/* ── Done ── */}
        {stage === 'done' && (
          <div className="flex flex-col items-center gap-6 w-full max-w-xs">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Done</h1>
              <p className="text-gray-400 text-sm mt-1">Great work</p>
            </div>
            {saved ? (
              <p className="text-green-400 font-medium">Session saved ✓</p>
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
              Try another topic
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
