import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import BehaviouralPrep from './pages/BehaviouralPrep'
import SelfImprovement from './pages/SelfImprovement'
import SpeechGym from './pages/SpeechGym'
import History from './pages/History'
import SessionDetail from './pages/SessionDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/behavioural" element={<BehaviouralPrep />} />
        <Route path="/self-improvement" element={<SelfImprovement />} />
        <Route path="/speech-gym" element={<SpeechGym />} />
        <Route path="/history" element={<History />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
