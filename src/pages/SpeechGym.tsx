import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Drill } from '../types'
import Timer from '../components/Timer'
import Recorder from '../components/Recorder'
import { useTimer } from '../hooks/useTimer'
import { useRecorder } from '../hooks/useRecorder'


const PEN_PARAGRAPHS = [
  "The thirty-three thieves thought that they thrilled the throne throughout Thursday. Around the rough and rugged rocks the ragged rascal ran. Red leather, yellow leather, red leather, yellow leather. Whether the weather is fine or whether the weather is not.",
  "She sells seashells by the seashore. The shells she sells are surely seashells. So if she sells seashells on the seashore, I'm sure she sells seashore shells. Truly rural. Unique New York, unique New York, you know you need unique New York.",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood? A woodchuck would chuck as much wood as a woodchuck could if a woodchuck could chuck wood. Rubber baby buggy bumpers. Specific Pacific specifics.",
  "Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked. If Peter Piper picked a peck of pickled peppers, where's the peck of pickled peppers Peter Piper picked? A proper copper coffee pot.",
  "Betty Botter had some butter but she said the butter's bitter. If I put it in my batter it will make my batter bitter. But a bit of better butter will make my batter better. So 'twas better Betty Botter bought a bit of better butter.",
  "I slit the sheet, the sheet I slit, and on the slitted sheet I sit. Fred fed Ted bread and Ted fed Fred bread. Cooks cook cupcakes quickly. Six slippery snails slid slowly seaward. The big black bug bit the big black bear.",
]

const PARAGRAPH_PASSAGES = [
  `The morning light filtered through the tall windows, casting long shadows across the wooden floor. Outside, the city was already busy — the sound of buses and footsteps drifting up from the street below. She poured her coffee slowly, watching the steam rise in lazy spirals. There was something about these quiet moments before the day truly began that she treasured. No emails, no meetings, no decisions. Just the warmth of the mug in her hands and the gradual brightening of the sky. She had learned, over the years, that the pace you set in the first hour tends to carry forward. Rushed mornings led to rushed decisions. Calm mornings led to clearer thinking. It was a simple truth, but one that had taken time to actually live by.`,
  `Every great engineering decision starts with the same question: what problem are we actually solving? It sounds obvious, but the answer is rarely the one you first reach for. Symptoms are easy to spot. Root causes take patience. The best engineers share one trait — they stay curious longer than feels comfortable. When something breaks in production, the instinct is to patch it and move on. The discipline is to ask why it broke, and then why that happened, and then why again. Three whys is often enough. The point is not to assign blame but to build a mental model that prevents the same class of failure from recurring. That model is the real product of an incident.`,
  `There is a particular kind of silence that falls on a library in the early afternoon. Not the tense silence of an exam room, or the hollow silence of an empty house, but something warmer — a shared quiet, inhabited by many people at once. Everyone present has chosen, in some small way, to slow down. To sit with a thought long enough for it to become something. This is rarer than it sounds. Most of our waking hours are spent in motion — physical, digital, conversational. The library is one of the few places that quietly resists this. No one is performing anything here. They are just reading, or trying to, and that is enough.`,
  `The hardest part of any difficult conversation is usually the opening. Once you've said the thing — the actual thing, not the softened version — something shifts. The air changes. You've acknowledged that something real is happening. From that point, you're dealing with reality, and reality, however uncomfortable, is at least workable. Most conflict drags on not because people disagree, but because neither side has said clearly what they actually think. The polite thing and the honest thing have diverged, and everyone is navigating the gap between them. Closing that gap takes courage, but it takes less energy than maintaining the performance indefinitely.`,
  `Learning to code taught me more about thinking than about technology. The machine is ruthlessly literal. It does exactly what you tell it to do, which is almost never what you intended. That gap — between what you meant and what you said — is where most of the learning happens. Over time, you get better at predicting how your instructions will be interpreted. You develop a second mind that reads your own code like a stranger would, looking for assumptions you forgot to state, edge cases you glossed over. That second mind turns out to be useful everywhere, not just in front of a screen. It is, in the end, just precision.`,
]

const TONGUE_TWISTERS = [
  { text: "She sells seashells by the seashore", difficulty: 1 },
  { text: "Red lorry, yellow lorry, red lorry, yellow lorry", difficulty: 1 },
  { text: "Toy boat, toy boat, toy boat", difficulty: 1 },
  { text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood?", difficulty: 2 },
  { text: "Peter Piper picked a peck of pickled peppers", difficulty: 2 },
  { text: "Whether the weather is fine or whether the weather is not, whether the weather be cold or whether the weather be hot", difficulty: 2 },
  { text: "Betty Botter bought some butter but she said the butter's bitter", difficulty: 2 },
  { text: "The sixth sick sheikh's sixth sheep's sick", difficulty: 3 },
  { text: "Unique New York, you know you need unique New York", difficulty: 3 },
  { text: "I saw Susie sitting in a shoeshine shop. Where she sits she shines, and where she shines she sits", difficulty: 3 },
]

const PACING_WORDS = `Effective communication is the difference between an idea that changes something and an idea that disappears. The words you choose matter, but so does the pace you deliver them. Speak too fast and your listener spends their energy keeping up rather than thinking about what you have said. Speak too slowly and their attention wanders before you have made your point. The target is somewhere in the middle, roughly one hundred and thirty to one hundred and sixty words per minute for most conversational contexts. That pace feels slightly slower than natural speech when you first practice it. That discomfort is worth sitting with. It means you are building the habit of leaving space for emphasis, for breath, for the listener to catch up. The best speakers sound unhurried even when they have a lot to say. That quality is not a gift. It is a practice.`.split(' ')

const PROJECTION_PASSAGE = `Speak clearly and at a consistent volume. Imagine projecting your voice to the back of the room — not shouting, but filling the space. Focus on keeping your energy level steady throughout. Watch the level meter below. The goal is to stay in the green zone and hold it there.`

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}


type Stage = 'list' | 'running' | 'done'

interface DrillResult { elapsedSecs: number; audioBlob: Blob | null }

export default function SpeechGym() {
  const [drills, setDrills] = useState<Drill[]>([])
  const [stage, setStage] = useState<Stage>('list')
  const [activeDrill, setActiveDrill] = useState<Drill | null>(null)
  const [result, setResult] = useState<DrillResult | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/drills').then(r => r.json()).then(setDrills)
  }, [])

  function handleStart(drill: Drill) {
    setActiveDrill(drill)
    setResult(null)
    setStage('running')
  }

  function handleFinish(res: DrillResult) {
    setResult(res)
    setStage('done')
  }

  async function handleSaveAndFinish() {
    if (!activeDrill) return
    setSaving(true)
    const formData = new FormData()
    formData.append('exercise_type', activeDrill.id)
    formData.append('duration_secs', String(result?.elapsedSecs ?? activeDrill.durationSecs))
    if (result?.audioBlob) {
      formData.append('audio', result.audioBlob, 'drill.webm')
    }
    await fetch('/api/drills/complete', { method: 'POST', body: formData })
    setSaving(false)
    setStage('list')
    setActiveDrill(null)
  }

  function handleBack() {
    setStage('list')
    setActiveDrill(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-8">
      <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors w-fit">
        ← Back
      </Link>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full pt-6 gap-6">

        {stage === 'list' && (
          <>
            <div>
              <h1 className="text-2xl font-bold">Speech Gym</h1>
              <p className="text-gray-400 text-sm mt-1">Short exercises to sharpen delivery</p>
            </div>
            <div className="flex flex-col gap-3">
              {drills.map(drill => (
                <div key={drill.id} className="flex items-center justify-between px-5 py-4 bg-gray-900 border border-gray-700 rounded-2xl">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-white">{drill.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{drill.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-600">{drill.durationSecs / 60} min</span>
                      {drill.recordingMode !== 'none' && (
                        <span className="text-xs text-gray-600">
                          {drill.recordingMode === 'required' ? 'Mic required' : 'Mic optional'}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleStart(drill)}
                    className="flex-shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-colors"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {stage === 'running' && activeDrill && (
          <DrillRunner
            key={activeDrill.id}
            drill={activeDrill}
            onFinish={handleFinish}
          />
        )}

        {stage === 'done' && activeDrill && (
          <div className="flex flex-col items-center gap-5 max-w-xs mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Nice work</h1>
              <p className="text-gray-400 text-sm mt-1">{activeDrill.label} complete</p>
            </div>
            <button
              onClick={handleSaveAndFinish}
              disabled={saving}
              className="btn-primary disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save & finish'}
            </button>
            <button onClick={handleBack} className="btn-secondary">
              Back without saving
            </button>
          </div>
        )}

      </div>
    </div>
  )
}


interface DrillRunnerProps {
  drill: Drill
  onFinish: (result: DrillResult) => void
}

function DrillRunner({ drill, onFinish }: DrillRunnerProps) {
  const startRef = useRef(Date.now())
  const recorder = useRecorder()
  const timer = useTimer(drill.durationSecs, handleComplete)

  const [twisterIndex, setTwisterIndex] = useState(0)
  const [pacingWpm, setPacingWpm] = useState(130)
  const [pacingWordIndex, setPacingWordIndex] = useState(0)
  const [micLevel, setMicLevel] = useState(0)
  const elapsedRef = useRef(0)
  const [awaitingBlob, setAwaitingBlob] = useState(false)


  useEffect(() => {
    if (!awaitingBlob || recorder.isRecording) return
    onFinish({ elapsedSecs: elapsedRef.current, audioBlob: recorder.audioBlob })
  }, [awaitingBlob, recorder.isRecording, recorder.audioBlob])


  const contentRef = useRef({
    penParagraph: randomFrom(PEN_PARAGRAPHS),
    passage: randomFrom(PARAGRAPH_PASSAGES),
  })

  useEffect(() => {
    timer.start()
    if (drill.recordingMode === 'required') {
      recorder.startRecording()
    }
  }, [])

  useEffect(() => {
    if (drill.id !== 'pacing') return
    const msPerWord = (60 / pacingWpm) * 1000
    const id = setInterval(() => {
      setPacingWordIndex(i => {
        if (i >= PACING_WORDS.length - 1) { clearInterval(id); return i }
        return i + 1
      })
    }, msPerWord)
    setPacingWordIndex(0)
    return () => clearInterval(id)
  }, [drill.id, pacingWpm])

  useEffect(() => {
    if (drill.id !== 'projection') return
    let cancelled = false
    let animId = 0
    let stream: MediaStream | null = null

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(s => {
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return }
        stream = s
        const ctx = new AudioContext()
        const source = ctx.createMediaStreamSource(s)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        const data = new Uint8Array(analyser.frequencyBinCount)
        const measure = () => {
          if (cancelled) return
          analyser.getByteFrequencyData(data)
          const avg = data.reduce((a, b) => a + b, 0) / data.length
          setMicLevel(avg / 128)
          animId = requestAnimationFrame(measure)
        }
        measure()
      })
      .catch(() => {})

    return () => {
      cancelled = true
      cancelAnimationFrame(animId)
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [drill.id])

  function handleComplete() {
    elapsedRef.current = Math.round((Date.now() - startRef.current) / 1000)
    if (recorder.isRecording) {
      recorder.stopRecording()
      setAwaitingBlob(true)
    } else {
      onFinish({ elapsedSecs: elapsedRef.current, audioBlob: null })
    }
  }

  function handleStopEarly() {
    timer.stop()
    handleComplete()
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <h2 className="text-xl font-bold">{drill.label}</h2>
      </div>

      <Timer remaining={timer.remaining} total={drill.durationSecs} isRunning={timer.isRunning} />

      {drill.id === 'pen_drill' && (
        <PenDrillContent
          paragraph={contentRef.current.penParagraph}
          recorder={recorder}
        />
      )}
      {drill.id === 'paragraph_read' && (
        <ParagraphReadContent
          passage={contentRef.current.passage}
          recorder={recorder}
        />
      )}
      {drill.id === 'tongue_twister' && (
        <TongueTwisterContent
          twisters={TONGUE_TWISTERS}
          currentIndex={twisterIndex}
          onNext={() => setTwisterIndex(i => Math.min(i + 1, TONGUE_TWISTERS.length - 1))}
        />
      )}
      {drill.id === 'pacing' && (
        <PacingContent
          words={PACING_WORDS}
          currentIndex={pacingWordIndex}
          wpm={pacingWpm}
          onWpmChange={wpm => { setPacingWpm(wpm); setPacingWordIndex(0) }}
        />
      )}
      {drill.id === 'projection' && (
        <ProjectionContent
          passage={PROJECTION_PASSAGE}
          micLevel={micLevel}
          recorder={recorder}
        />
      )}

      <button
        onClick={handleStopEarly}
        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        Stop early
      </button>
    </div>
  )
}

function PenDrillContent({ paragraph, recorder }: {
  paragraph: string
  recorder: ReturnType<typeof useRecorder>
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="px-4 py-3 bg-amber-950 border border-amber-800 rounded-xl text-xs text-amber-300 text-center">
        Hold a pen lightly between your teeth. Exaggerate mouth movement.
      </div>
      <div className="px-5 py-4 bg-gray-900 border border-gray-700 rounded-xl">
        <p className="text-sm text-gray-200 leading-relaxed">{paragraph}</p>
      </div>
      <div className="flex justify-center">
        <Recorder
          isRecording={recorder.isRecording}
          audioBlob={recorder.audioBlob}
          durationSecs={recorder.durationSecs}
          onStart={recorder.startRecording}
          onStop={recorder.stopRecording}
        />
      </div>
    </div>
  )
}

function ParagraphReadContent({ passage, recorder }: {
  passage: string
  recorder: ReturnType<typeof useRecorder>
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="px-4 py-3 bg-indigo-950 border border-indigo-800 rounded-xl text-xs text-indigo-300 text-center">
        Read aloud at a natural conversational pace. Focus on clarity and breathing.
      </div>
      <div className="px-5 py-4 bg-gray-900 border border-gray-700 rounded-xl">
        <p className="text-sm text-gray-200 leading-relaxed">{passage}</p>
      </div>
      <div className="flex justify-center">
        <Recorder
          isRecording={recorder.isRecording}
          audioBlob={recorder.audioBlob}
          durationSecs={recorder.durationSecs}
          onStart={recorder.startRecording}
          onStop={recorder.stopRecording}
        />
      </div>
    </div>
  )
}

function TongueTwisterContent({ twisters, currentIndex, onNext }: {
  twisters: { text: string; difficulty: number }[]
  currentIndex: number
  onNext: () => void
}) {
  const twister = twisters[currentIndex]
  const diffLabel = ['', 'Easy', 'Medium', 'Hard'][twister.difficulty]
  const diffColor = ['', 'text-green-400', 'text-yellow-400', 'text-red-400'][twister.difficulty]
  return (
    <div className="flex flex-col gap-4 w-full items-center">
      <div className="px-5 py-4 bg-gray-900 border border-gray-700 rounded-xl text-center w-full">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium ${diffColor}`}>{diffLabel}</span>
          <span className="text-xs text-gray-600">{currentIndex + 1} / {twisters.length}</span>
        </div>
        <p className="text-lg font-semibold text-white leading-relaxed">{twister.text}</p>
        <p className="text-xs text-gray-500 mt-3">Repeat 3 times clearly. Speed up each time.</p>
      </div>
      {currentIndex < twisters.length - 1 && (
        <button onClick={onNext} className="btn-secondary">
          Next →
        </button>
      )}
    </div>
  )
}

function PacingContent({ words, currentIndex, wpm, onWpmChange }: {
  words: string[]
  currentIndex: number
  wpm: number
  onWpmChange: (wpm: number) => void
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs text-gray-500 uppercase tracking-widest">WPM</span>
        {[100, 130, 160].map(w => (
          <button
            key={w}
            onClick={() => onWpmChange(w)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              wpm === w ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
            }`}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="px-5 py-4 bg-gray-900 border border-gray-700 rounded-xl min-h-32">
        <p className="text-sm leading-relaxed">
          {words.map((word, i) => (
            <span
              key={i}
              className={
                i === currentIndex
                  ? 'text-white font-semibold bg-indigo-700 rounded px-0.5'
                  : i < currentIndex
                  ? 'text-gray-600'
                  : 'text-gray-400'
              }
            >
              {word}{' '}
            </span>
          ))}
        </p>
      </div>
      <p className="text-xs text-gray-600 text-center">Read along with the highlighted word</p>
    </div>
  )
}

function ProjectionContent({ passage, micLevel, recorder }: {
  passage: string
  micLevel: number
  recorder: ReturnType<typeof useRecorder>
}) {
  const pct = Math.min(micLevel, 1)
  const barColor = pct < 0.15 ? 'bg-gray-600' : pct < 0.7 ? 'bg-green-500' : 'bg-yellow-500'
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="px-5 py-4 bg-gray-900 border border-gray-700 rounded-xl">
        <p className="text-sm text-gray-200 leading-relaxed">{passage}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-gray-500 text-center">Mic level</p>
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-75 ${barColor}`}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-600 px-0.5">
          <span>too quiet</span>
          <span>good</span>
          <span>too loud</span>
        </div>
      </div>
      <div className="flex justify-center">
        <Recorder
          isRecording={recorder.isRecording}
          audioBlob={recorder.audioBlob}
          durationSecs={recorder.durationSecs}
          onStart={recorder.startRecording}
          onStop={recorder.stopRecording}
        />
      </div>
    </div>
  )
}
