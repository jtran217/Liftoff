import { Link } from 'react-router-dom'
import StreakCounter from '../components/StreakCounter'
import ActivityHeatmap from '../components/ActivityHeatmap'
import ProgressDashboard from '../components/ProgressDashboard'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-8">
      <div className="max-w-md mx-auto w-full flex flex-col gap-8 pt-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Liftoff</h1>
          <p className="text-gray-500 text-sm mt-1">Daily interview & communication training</p>
        </div>
        <StreakCounter />
        <ActivityHeatmap />
        <ProgressDashboard />
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Today's session</p>
          <Link to="/behavioural" className="btn-primary">
            Behavioural Prep
          </Link>
          <Link to="/self-improvement" className="btn-primary">
            Self Improvement
          </Link>
          <Link to="/speech-gym" className="btn-secondary">
            Speech Gym
          </Link>
        </div>
        <Link
          to="/history"
          className="text-sm text-gray-600 hover:text-gray-400 text-center transition-colors"
        >
          View history →
        </Link>
      </div>
    </div>
  )
}
