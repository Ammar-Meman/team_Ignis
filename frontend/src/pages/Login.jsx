import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [grNo, setGrNo] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('embers')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  /* Generate random ember particles once */
  const embers = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 3,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 6,
      opacity: 0.3 + Math.random() * 0.5,
    })), []
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setErrorMsg('')
    
    const result = await login(grNo, password)
    
    setIsLoggingIn(false)
    if (result.success) {
      navigate('/')
    } else {
      setErrorMsg(result.message)
    }
  }

  return (
    <div className="login-page">
      {/* ── Atmospheric Background ── */}
      <div className="login-page__bg" aria-hidden="true">
        <div className="login-page__bg-orb login-page__bg-orb--1" />
        <div className="login-page__bg-orb login-page__bg-orb--2" />
      </div>

      {/* ── Floating Embers ── */}
      <div className="login-embers" aria-hidden="true">
        {embers.map(e => (
          <div
            key={e.id}
            className="login-ember"
            style={{
              left: e.left,
              width: `${e.size}px`,
              height: `${e.size}px`,
              animationDuration: `${e.duration}s`,
              animationDelay: `${e.delay}s`,
              opacity: e.opacity,
            }}
          />
        ))}
      </div>

      {/* ── Login Card ── */}
      <div className="login-card">
        <div className="login-card__header">
          <span className="login-card__flame">🔥</span>
          <h1 className="login-card__title">
            <span className="ignis-fire-text">IGNIS</span>{' '}
            <span style={{ color: 'var(--ignis-white)' }}>JWAALA</span>
          </h1>
          <p className="login-card__subtitle">// ACCESS THE ARENA</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {errorMsg && <div className="login-error-msg" style={{ color: 'var(--ignis-red)', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMsg}</div>}
          
          {/* Role Field */}
          <div className="login-field">
            <label className="login-field__label">Select Identity</label>
            <div className="login-role-toggle">
              <button 
                type="button" 
                className={`login-role-btn ${role === 'embers' ? 'active' : ''}`}
                onClick={() => setRole('embers')}
              >
                Embers
              </button>
              <button 
                type="button" 
                className={`login-role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                Grand Master
              </button>
            </div>
          </div>

          {/* GR No. Field */}
          <div className="login-field">
            <label className="login-field__label" htmlFor="login-grno">
              GR No.
            </label>
            <input
              id="login-grno"
              className="login-field__input"
              type="text"
              placeholder="Enter your GR Number"
              value={grNo}
              onChange={(e) => setGrNo(e.target.value)}
              autoComplete="off"
              required
            />
            <span className="login-field__icon">⚡</span>
          </div>

          {/* Password Field */}
          <div className="login-field">
            <label className="login-field__label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="login-field__input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="login-field__icon">🔒</span>
          </div>

          {/* Submit Button */}
          <button type="submit" className="login-submit" id="login-submit-btn" disabled={isLoggingIn}>
            <span className="login-submit__text">
              {isLoggingIn ? 'IGNITING SESSION...' : 'IGNITE SESSION 🔥'}
            </span>
          </button>
        </form>

        {/* Security Badge */}
        <div className="login-security">
          <span className="login-security__icon">🛡️</span>
          SECURED BY IGNIS PROTOCOL V1.0
        </div>
      </div>
    </div>
  )
}

export default Login
