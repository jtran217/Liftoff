import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Question } from '../types'

interface EditState {
  id: number
  category: string
  text: string
  difficulty: number
}

export default function QuestionEditor() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [editState, setEditState] = useState<EditState | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [newCategory, setNewCategory] = useState('')
  const [newText, setNewText] = useState('')
  const [newDifficulty, setNewDifficulty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function fetchQuestions() {
    return fetch('/api/questions')
      .then(r => r.json())
      .then((rows: Question[]) => setQuestions(rows))
  }

  useEffect(() => {
    fetchQuestions()
    fetch('/api/questions/categories')
      .then(r => r.json())
      .then(setCategories)
  }, [])

  const customQuestions = questions.filter(q => q.is_custom)

  const grouped = customQuestions.reduce<Record<string, Question[]>>((acc, q) => {
    if (!acc[q.category]) acc[q.category] = []
    acc[q.category].push(q)
    return acc
  }, {})

  async function handleAdd() {
    const cat = newCategory.trim()
    const txt = newText.trim()
    if (!cat || !txt) { setError('Category and question text are required'); return }
    setSaving(true)
    setError(null)
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, text: txt, difficulty: newDifficulty }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      setError(body.error ?? 'Failed to add question')
      setSaving(false)
      return
    }
    await fetchQuestions()
    setNewCategory('')
    setNewText('')
    setNewDifficulty(1)
    setAdding(false)
    setSaving(false)
  }

  async function handleSaveEdit() {
    if (!editState) return
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/questions/${editState.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: editState.category.trim(),
        text: editState.text.trim(),
        difficulty: editState.difficulty,
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      setError(body.error ?? 'Failed to save')
      setSaving(false)
      return
    }
    await fetchQuestions()
    setEditState(null)
    setSaving(false)
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      setError(body.error ?? 'Failed to delete')
      return
    }
    setDeleteConfirm(null)
    await fetchQuestions()
  }

  const allCategories = Array.from(new Set([...categories, newCategory.trim()].filter(Boolean))).sort()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-8">
      <Link to="/behavioural" className="text-gray-500 hover:text-gray-300 text-sm transition-colors w-fit">
        ← Back
      </Link>

      <div className="flex-1 flex flex-col gap-8 max-w-lg mx-auto w-full pt-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Custom questions</h1>
            <p className="text-gray-500 text-sm mt-0.5">{customQuestions.length} question{customQuestions.length !== 1 ? 's' : ''}</p>
          </div>
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="btn-primary"
            >
              + Add question
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 -mt-4">{error}</p>
        )}

        {adding && (
          <div className="flex flex-col gap-3 p-5 bg-gray-900 border border-indigo-700 rounded-2xl">
            <p className="text-sm font-semibold text-indigo-300">New question</p>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Category</label>
              <input
                list="category-list"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="e.g. Initiative"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <datalist id="category-list">
                {allCategories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Question</label>
              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="Tell me about a time you…"
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Difficulty</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(d => (
                  <button
                    key={d}
                    onClick={() => setNewDifficulty(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      newDifficulty === d
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {d === 1 ? 'Easy' : d === 2 ? 'Medium' : 'Hard'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex-1"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setAdding(false); setError(null) }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {customQuestions.length === 0 && !adding ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-gray-500">No custom questions yet</p>
            <p className="text-gray-600 text-sm">Add your own to practice company-specific or role-specific questions</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, qs]) => (
              <div key={cat} className="flex flex-col gap-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest">{cat}</p>
                {qs.map(q => (
                  <div key={q.id}>
                    {editState?.id === q.id ? (
                      <div className="flex flex-col gap-3 p-4 bg-gray-900 border border-indigo-700 rounded-2xl">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">Category</label>
                          <input
                            list="category-list"
                            value={editState.category}
                            onChange={e => setEditState(s => s && ({ ...s, category: e.target.value }))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">Question</label>
                          <textarea
                            value={editState.text}
                            onChange={e => setEditState(s => s && ({ ...s, text: e.target.value }))}
                            rows={3}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3].map(d => (
                            <button
                              key={d}
                              onClick={() => setEditState(s => s && ({ ...s, difficulty: d }))}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                editState.difficulty === d
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                              }`}
                            >
                              {d === 1 ? 'Easy' : d === 2 ? 'Medium' : 'Hard'}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex-1"
                          >
                            {saving ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            onClick={() => { setEditState(null); setError(null) }}
                            className="btn-secondary flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 px-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-200 leading-relaxed">{q.text}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {q.difficulty === 1 ? 'Easy' : q.difficulty === 2 ? 'Medium' : 'Hard'}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 pt-0.5">
                          <button
                            onClick={() => setEditState({ id: q.id, category: q.category, text: q.text, difficulty: q.difficulty })}
                            className="text-gray-600 hover:text-gray-300 transition-colors text-sm"
                            aria-label="Edit"
                          >
                            Edit
                          </button>
                          {deleteConfirm === q.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDelete(q.id)}
                                className="text-red-400 hover:text-red-300 transition-colors text-sm"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-600 hover:text-gray-400 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(q.id)}
                              className="text-gray-600 hover:text-red-400 transition-colors text-sm"
                              aria-label="Delete"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
