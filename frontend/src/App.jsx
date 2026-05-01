import React, { lazy, Suspense, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import IgnisLayout from './components/layout/IgnisLayout'
import ProtectedRoute from './components/routing/ProtectedRoute'

// ── Lazy-loaded pages (Code Splitting) ──
// Each page is now a separate JS chunk that loads on demand
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Polls = lazy(() => import('./pages/Polls'))
const Points = lazy(() => import('./pages/Points'))
const LeaderPanel = lazy(() => import('./pages/LeaderPanel'))

// ── Stylized loading fallback ──
const EmberLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, #FF6A00 0%, #FF3C3C 60%, transparent 70%)',
      animation: 'pulse 1.2s ease-in-out infinite',
      boxShadow: '0 0 30px rgba(255, 106, 0, 0.5)',
    }} />
    <span style={{
      fontFamily: "'Rajdhani', sans-serif",
      color: '#FF6A00',
      fontSize: '0.9rem',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
    }}>Loading...</span>
    <style>{`
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0.6; }
      }
    `}</style>
  </div>
)

const INITIAL_SCORES = [
  { id: 'ignis', name: 'IGNIS', color: '#FF6A00', score: 85, icon: '🔥' },
  { id: 'aqua', name: 'AQUA', color: '#00B4D8', score: 72, icon: '🌊' },
  { id: 'terra', name: 'TERRA', color: '#2D9F2D', score: 64, icon: '🌱' },
  { id: 'aero', name: 'AERO', color: '#9B5DE5', score: 58, icon: '🌪️' },
]

function App() {
  const [factionScores, setFactionScores] = useState(INITIAL_SCORES)

  return (
    <Suspense fallback={<EmberLoader />}>
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
            <ProtectedRoute requireRole="grandmaster">
              <IgnisLayout>
                <LeaderPanel />
              </IgnisLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default App
