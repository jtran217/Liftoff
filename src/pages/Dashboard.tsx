import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Liftoff 🚀</h1>
      <p className="text-gray-400 text-lg">Daily interview & communication training</p>
      <nav className="flex flex-col gap-4 w-full max-w-xs">
        <Link to="/behavioural" className="btn-primary">Behavioural Prep</Link>
        <Link to="/self-improvement" className="btn-primary">Self Improvement</Link>
        <Link to="/speech-gym" className="btn-primary">Speech Gym</Link>
        <Link to="/history" className="btn-secondary">History</Link>
      </nav>
    </div>
  )
}
