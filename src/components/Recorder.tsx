// Fixed heights so bars don't jump on every render
const BAR_HEIGHTS = [10, 22, 30, 18, 34, 26, 20, 32, 14, 28, 34, 22, 18, 30, 26, 20, 34, 16, 28, 22]

interface RecorderProps {
  isRecording: boolean
  audioBlob: Blob | null
  durationSecs: number
  onStart: () => void
  onStop: () => void
}

export default function Recorder({ isRecording, audioBlob, durationSecs, onStart, onStop }: RecorderProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Waveform visualiser placeholder */}
      <div className="flex items-center gap-[3px] h-10">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-indigo-400"
            style={
              isRecording
                ? {
                    height: h,
                    animation: `bar-pulse ${0.4 + (i % 5) * 0.08}s ease-in-out infinite alternate`,
                  }
                : { height: 4, opacity: 0.3 }
            }
          />
        ))}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-sm text-gray-400 h-5">
        {isRecording && (
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        )}
        <span>
          {isRecording
            ? 'Recording…'
            : audioBlob
            ? `Recorded · ${Math.round(durationSecs)}s`
            : 'Ready'}
        </span>
      </div>

      {/* Record / Stop button */}
      <button
        onClick={isRecording ? onStop : onStart}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          isRecording
            ? 'bg-red-600 hover:bg-red-500 scale-110'
            : 'bg-indigo-600 hover:bg-indigo-500'
        }`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <span className="w-5 h-5 rounded-sm bg-white" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
            <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
            <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
          </svg>
        )}
      </button>
    </div>
  )
}
