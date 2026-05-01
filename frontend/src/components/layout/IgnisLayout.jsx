import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import GlobalEmbers from '../ui/GlobalEmbers'
import IgnisCursor from '../ui/IgnisCursor'
import './IgnisLayout.css'

const IgnisLayout = ({ children }) => {
  const [scrolled, setScrolled] = useState(false)
  const glowRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* ── Global cursor-following fire glow ── */
  useEffect(() => {
    const glowEl = glowRef.current
    if (!glowEl) return

    const handleMove = (e) => {
      const xPercent = (e.clientX / window.innerWidth) * 100
      const yPercent = (e.clientY / window.innerHeight) * 100
      glowEl.style.background = `radial-gradient(ellipse 600px 600px at ${xPercent}% ${yPercent}%, rgba(255,106,0,0.12) 0%, rgba(255,60,60,0.04) 35%, transparent 70%)`
      glowEl.style.opacity = '1'
    }

    const handleLeave = () => {
      glowEl.style.opacity = '0'
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div className="ignis-app">
      {/* ── Custom Fire Cursor ── */}
      <IgnisCursor />

      {/* ── Global Atmospheric Background ── */}
      <div className="ignis-atmosphere" aria-hidden="true">
        <div className="ignis-atmosphere__gradient" />
        <div className="ignis-atmosphere__gradient ignis-atmosphere__gradient--secondary" />
        <div className="ignis-atmosphere__noise" />
      </div>

      {/* ── Global Cursor-Following Fire Glow ── */}
      <div ref={glowRef} className="ignis-cursor-glow" aria-hidden="true" />

      {/* ── Global Floating Embers (with cursor interaction) ── */}
      <GlobalEmbers count={15} />

      {/* ── Navigation ── */}
      <header className={`ignis-nav ${scrolled ? 'ignis-nav--scrolled' : ''}`}>
        <div className="ignis-nav__inner">
          <a href="/" className="ignis-nav__logo">
            <span className="ignis-nav__logo-icon">🔥</span>
            <span className="ignis-fire-text" style={{ fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>IGNIS</span>
            <span className="ignis-nav__logo-text" style={{ fontWeight: 600, fontSize: '1.3rem', fontFamily: 'var(--font-display)', color: 'var(--ignis-white)', marginLeft: '6px' }}>JWAALA</span>
          </a>
          <nav className="ignis-nav__links">
            {['EVENTS', 'BATTLES', 'FACTIONS', 'POLLS', 'ARENA POINTS', 'LEADER PANEL'].map(l => (
              l === 'POLLS' ? (
                <Link key={l} to="/polls" className="ignis-nav__link">{l}</Link>
              ) : l === 'ARENA POINTS' ? (
                <Link key={l} to="/points" className="ignis-nav__link">{l}</Link>
              ) : l === 'LEADER PANEL' ? (
                <Link key={l} to="/leader-panel" className="ignis-nav__link">{l}</Link>
              ) : (
                <a key={l} href={`#${l.toLowerCase()}`} className="ignis-nav__link">{l}</a>
              )
            ))}
          </nav>
          <Link to="/login" className="ignis-btn-primary ignis-nav__cta" style={{ padding: '10px 24px', fontSize: '0.8rem', textDecoration: 'none' }}>
            IGNITE 🔥
          </Link>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer className="ignis-footer">
        <div className="ignis-container ignis-footer__inner">
          <div>
            <span className="ignis-fire-text" style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>IGNIS JWAALA</span>
            <span className="ignis-mono" style={{ marginLeft: '12px', fontSize: '0.7rem' }}>// ARENA SYSTEM V1.0</span>
          </div>
          <div className="ignis-footer__links">
            <a href="#" className="ignis-link ignis-mono" style={{ fontSize: '0.8rem' }}>Privacy</a>
            <a href="#" className="ignis-link ignis-mono" style={{ fontSize: '0.8rem' }}>Terms</a>
            <a href="#" className="ignis-link ignis-mono" style={{ fontSize: '0.8rem' }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default IgnisLayout
