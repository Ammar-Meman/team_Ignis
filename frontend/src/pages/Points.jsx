import React from 'react'
import { Helmet } from 'react-helmet-async'
import './Points.css'

const Points = ({ factionScores, setFactionScores }) => {
  const handleScoreChange = (id, newScore) => {
    const parsedScore = parseInt(newScore, 10) || 0
    const boundedScore = Math.min(Math.max(parsedScore, 0), 100)

    setFactionScores(prevScores =>
      prevScores.map(faction =>
        faction.id === id ? { ...faction, score: boundedScore } : faction
      )
    )
  }

  return (
    <div className="ignis-container points-page">
      <Helmet>
        <title>Arena Points — IGNIS JWAALA</title>
        <meta name="description" content="Track live faction standings and observe the balance of power across Ignis, Aqua, Terra, and Aero." />
      </Helmet>
      <div className="section-header">
        <h1 className="ignis-title"><span className="ignis-fire-text">ARENA</span> POINTS</h1>
        <p className="section-subtitle">Manage faction dominance. Updates sync instantly to the global standings.</p>
      </div>

      <div className="points-dashboard ignis-panel">
        <div className="points-dashboard__header">
          <h2 className="ignis-heading" style={{ fontSize: '1.2rem' }}>FACTION SCOREBOARD</h2>
          <span className="ignis-mono" style={{ color: 'var(--ignis-orange)' }}>// LIVE SYNC ACTIVE</span>
        </div>

        <div className="points-grid">
          {factionScores.map(faction => (
            <div key={faction.id} className="points-card" style={{ '--card-accent': faction.color }}>
              <div className="points-card__header">
                <span className="points-card__icon">{faction.icon}</span>
                <h3 className="points-card__name" style={{ color: faction.color }}>{faction.name}</h3>
              </div>

              <div className="points-card__control">
                <label className="login-field__label">Dominance Score (0-100)</label>
                <div className="points-input-wrapper">
                  <input
                    type="number"
                    className="ignis-input points-input"
                    value={faction.score}
                    onChange={(e) => handleScoreChange(faction.id, e.target.value)}
                    min="0"
                    max="100"
                  />
                  <span className="points-unit">pts</span>
                </div>
              </div>

              {/* Visual preview of the bar */}
              <div className="points-preview">
                <div className="standings-bar__track">
                  <div
                    className="standings-bar__fill"
                    style={{ width: `${faction.score}%`, background: faction.color, transition: 'width 0.4s var(--ease-spring)' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Points
