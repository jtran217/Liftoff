import { useState } from 'react'

const PROMPTS = [
  { key: 'S', label: 'Situation', text: 'Set the scene. Where were you, what was the context, what was at stake?' },
  { key: 'T', label: 'Task', text: 'What was your specific responsibility? What were you asked to do?' },
  { key: 'A', label: 'Action', text: 'What did YOU do? Use "I" not "we". Be specific about your choices and reasoning.' },
  { key: 'R', label: 'Result', text: 'What happened? Quantify impact if possible. What did you learn?' },
]

export default function STARGuide() {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium"
      >
        <span>STAR Guide</span>
        <span className="text-gray-400 text-xs">{open ? '▲ hide' : '▼ show'}</span>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {PROMPTS.map(({ key, label, text }) => (
            <div key={key} className="px-4 py-3 bg-gray-900 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-indigo-700 text-xs font-bold text-white flex items-center justify-center flex-shrink-0">
                  {key}
                </span>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
