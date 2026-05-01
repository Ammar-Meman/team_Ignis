import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import IgnisLayout from './components/layout/IgnisLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Polls from './pages/Polls'
import Points from './pages/Points'
import LeaderPanel from './pages/LeaderPanel'

const INITIAL_SCORES = [
  { id: 'ignis', name: 'IGNIS', color: '#FF6A00', score: 85, icon: '🔥' },
  { id: 'aqua', name: 'AQUA', color: '#00B4D8', score: 72, icon: '🌊' },
  { id: 'terra', name: 'TERRA', color: '#2D9F2D', score: 64, icon: '🌱' },
  { id: 'aero', name: 'AERO', color: '#9B5DE5', score: 58, icon: '🌪️' },
]

function App() {
  const [factionScores, setFactionScores] = useState(INITIAL_SCORES)

  return (
    <Routes>
      <Route
        path="/"
        element={
          <IgnisLayout>
            <Home factionScores={factionScores} />
          </IgnisLayout>
        }
      />
      <Route
        path="/login"
        element={
          <IgnisLayout>
            <Login />
          </IgnisLayout>
        }
      />
      <Route
        path="/polls"
        element={
          <IgnisLayout>
            <Polls />
          </IgnisLayout>
        }
      />
      <Route
        path="/points"
        element={
          <IgnisLayout>
            <Points factionScores={factionScores} setFactionScores={setFactionScores} />
          </IgnisLayout>
        }
      />
      <Route
        path="/leader-panel"
        element={
          <IgnisLayout>
            <LeaderPanel />
          </IgnisLayout>
        }
      />
    </Routes>
  )
}

export default App
