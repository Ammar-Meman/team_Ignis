import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import './Home.css'

/* ── Utility: Animated Counter ── */
const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()
          const animate = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref} className="stat-counter">
      {count}<span className="stat-suffix">{suffix}</span>
    </span>
  )
}

/* ── Utility: Section Reveal on Scroll ── */
const RevealSection = ({ children, className = '', animation = 'fade-up', delay = 0 }) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal reveal--${animation} ${visible ? 'reveal--visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

/* ── Reusable: Floating Ember Particles with cursor interaction ── */
const SECTION_INTERACTION_RADIUS = 140
const SECTION_PUSH_STRENGTH = 60

const SectionEmbers = ({ count = 15 }) => {
  const embers = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 6}s`,
    })),
    [count]
  )

  const wrappersRef = useRef([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const pushRef = useRef([])
  const rafRef = useRef(null)

  // Init push offsets
  useEffect(() => {
    pushRef.current = Array.from({ length: count }, () => ({ x: 0, y: 0 }))
  }, [count])

  // Mouse tracking
  useEffect(() => {
    const handleMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    const handleLeave = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  // Animation loop — push embers away from cursor
  useEffect(() => {
    const animate = () => {
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < wrappersRef.current.length; i++) {
        const wrapper = wrappersRef.current[i]
        if (!wrapper) continue
        const ember = wrapper.firstChild
        if (!ember) continue

        const rect = ember.getBoundingClientRect()
        const ex = rect.left + rect.width / 2
        const ey = rect.top + rect.height / 2
        const dx = ex - mx
        const dy = ey - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const push = pushRef.current[i]

        if (dist < SECTION_INTERACTION_RADIUS && dist > 0) {
          const force = (1 - dist / SECTION_INTERACTION_RADIUS) * SECTION_PUSH_STRENGTH
          const angle = Math.atan2(dy, dx)
          push.x += (Math.cos(angle) * force - push.x) * 0.15
          push.y += (Math.sin(angle) * force - push.y) * 0.15
        } else {
          push.x *= 0.92
          push.y *= 0.92
          if (Math.abs(push.x) < 0.1 && Math.abs(push.y) < 0.1) {
            push.x = 0
            push.y = 0
          }
        }

        wrapper.style.transform = `translate(${push.x}px, ${push.y}px)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="section-embers" aria-hidden="true">
      {embers.map((e, i) => (
        <div
          key={e.id}
          className="ember-wrapper"
          ref={(el) => (wrappersRef.current[i] = el)}
        >
          <div
            className="ember-particle"
            style={{
              left: e.left,
              animationDelay: e.delay,
              animationDuration: e.duration,
            }}
          />
        </div>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────
   HOME PAGE
   ──────────────────────────────────────────────────── */
const FALLBACK_GAMES = [
  { rank: 1, name: 'Cricket' },
  { rank: 2, name: 'Football' },
  { rank: 3, name: 'Basketball' },
]

/** Safely load leader games from localStorage */
const loadVanguardGames = () => {
  try {
    const stored = localStorage.getItem('ignis_leader_games')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { games: parsed.sort((a, b) => a.rank - b.rank), isFallback: false }
      }
    }
  } catch (e) {
    console.warn('Failed to parse leader games:', e)
  }
  return { games: FALLBACK_GAMES, isFallback: true }
}

const Home = ({ factionScores }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { games: vanguardGames, isFallback } = useMemo(loadVanguardGames, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="home">
      <Helmet>
        <title>IGNIS JWAALA — The Arena Awaits</title>
        <meta name="description" content="Enter the Vanguard Arena. Participate in live discussions, view real-time polls, and assert your faction's dominance." />
      </Helmet>

      {/* ═══════════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════════ */}
      <section className="hero ignis-scanlines" id="hero">
        {/* Animated background glow that follows mouse */}
        <div
          className="hero__glow"
          style={{
            background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, rgba(255,106,0,0.15) 0%, rgba(255,60,60,0.05) 30%, transparent 70%)`
          }}
        />
        <div className="hero__glow-static" />

        {/* Floating ember particles */}
        <SectionEmbers count={15} />

        <div className="ignis-container hero__content">
          <div className="hero__text">
            <span className="ignis-label ignis-animate-up delay-1">⚡ Welcome to the Arena</span>

            <h1 className="ignis-title hero__title ignis-animate-up delay-2">
              <span className="ignis-fire-text">IGNIS</span>
              <br />
              <span>JWAALA</span>
              <span className="hero__title-icon">🔥</span>
            </h1>

            <p className="hero__tagline ignis-animate-up delay-3">
              Where Opinions Ignite. Where Voices Rule.
            </p>

            <p className="hero__description ignis-animate-up delay-4">
              A cinematic Vanguard Arena for real-time polling,
              live discussions, and faction dominance.
            </p>

            <div className="hero__cta ignis-animate-up delay-5">
              <button className="ignis-btn-primary" id="hero-enter-arena">
                Enter Arena ⚡
              </button>
              <button className="ignis-btn-outline" id="hero-view-factions">
                View Factions →
              </button>
            </div>

            {/* Live stats */}
            <div className="hero__stats ignis-animate-up delay-6">
              <div className="hero__stat">
                <AnimatedCounter target={30} suffix="+" />
                <span className="hero__stat-label">EMBERS</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <AnimatedCounter target={5} />
                <span className="hero__stat-label">BATTLES</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <AnimatedCounter target={4} />
                <span className="hero__stat-label">FACTIONS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero__scroll-indicator">
          <span className="ignis-mono">Scroll to explore</span>
          <div className="hero__scroll-arrow">↓</div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2: VANGUARD'S ACTIVE MODULES
          ═══════════════════════════════════════════════ */}
      <section className="ignis-section modules-section" id="events">
        <SectionEmbers count={15} />
        <div className="ignis-container">
          <RevealSection animation="fade-up">
            <div className="section-header section-header--center">
              <span className="ignis-label">⚡ IGNIS PRESENTS</span>
              <h2 className="ignis-heading">VANGUARD'S ACTIVE <span className="ignis-fire-text">MODULES</span></h2>
              <p className="section-subtitle">
                {isFallback
                  ? 'Awaiting Leader Selection — showing default modules.'
                  : 'Leader-selected games. The Arena awaits.'}
              </p>
            </div>
          </RevealSection>

          <div className={`modules-grid ${vanguardGames.length === 1 ? 'modules-grid--single' : ''}`}>
            {vanguardGames.map((game, i) => (
              <RevealSection key={game.rank} animation="scale-in" delay={i * 0.15}>
                <div
                  className={`module-card ignis-card vanguard-card ${game.rank === 1 ? 'vanguard-card--rank1' : ''}`}
                  id={`vanguard-${game.rank}`}
                >
                  {game.rank === 1 && (
                    <div className="vanguard-card__badge">🏆 #1</div>
                  )}
                  <div className="module-card__header">
                    <span className="module-status" style={{
                      color: game.rank === 1 ? '#FFD600' : 'var(--ignis-orange)',
                      borderColor: game.rank === 1 ? '#FFD600' : 'var(--ignis-orange)'
                    }}>
                      ● RANK {game.rank}
                    </span>
                  </div>
                  <div className="module-card__icon">
                    {game.rank === 1 ? '🏆' : game.rank === 2 ? '🥈' : game.rank === 3 ? '🥉' : '🎮'}
                  </div>
                  <h3 className="module-card__title">{game.name.toUpperCase()}</h3>
                  <div className="module-card__footer">
                    <span className="ignis-mono">RANK #{game.rank}</span>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 3: BATTLE STATION (POLL)
          ═══════════════════════════════════════════════ */}
      <section className="ignis-section battle-section" id="battles">
        <SectionEmbers count={15} />
        <div className="ignis-container">
          <div className="battle-grid">
            <RevealSection animation="slide-left" className="battle-text">
              <span className="ignis-label">⚔️ BATTLE STATION</span>
              <h2 className="ignis-heading battle-heading">
                REAL OPINIONS.<br />
                <span className="ignis-fire-text">REAL IMPACT.</span>
              </h2>
              <hr className="ignis-divider" />
              <p className="battle-desc">
                Engage in polls that shape the conversation. Your vote isn't just a click — it's a declaration of where you stand.
              </p>
              <Link to="/polls" className="ignis-btn-primary" id="battle-enter" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Enter Battle →
              </Link>
            </RevealSection>

            <RevealSection animation="slide-right" delay={0.2} className="battle-poll">
              <div className="poll-card ignis-panel">
                <div className="poll-card__badge">
                  <span className="module-status" style={{ color: '#FF3C3C', borderColor: '#FF3C3C' }}>● LIVE</span>
                </div>
                <h3 className="poll-card__question">Which technology will shape the future the most?</h3>
                {[
                  { label: 'Artificial Intelligence', percent: 42 },
                  { label: 'Quantum Computing', percent: 28 },
                  { label: 'Blockchain & Web3', percent: 18 },
                  { label: 'Biotechnology', percent: 12 },
                ].map((opt, i) => (
                  <div key={i} className="poll-option">
                    <div className="poll-option__info">
                      <span className="poll-option__label">{opt.label}</span>
                      <span className="poll-option__percent">{opt.percent}%</span>
                    </div>
                    <div className="poll-option__bar">
                      <div className="poll-option__fill" style={{ width: `${opt.percent}%` }} />
                    </div>
                  </div>
                ))}
                <div className="poll-card__footer">
                  <span className="ignis-mono">2.3K votes</span>
                  <span className="ignis-mono">12h remaining</span>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 4: CREATE POLL
          ═══════════════════════════════════════════════ */}
      <section className="ignis-section create-section" id="forge">
        <SectionEmbers count={15} />
        <div className="ignis-container">
          <div className="create-grid">
            <RevealSection animation="scale-in" className="create-visual">
              <div className="create-icon">
                <div className="create-icon__inner">
                  <span className="create-icon__symbol">❓</span>
                  <div className="create-icon__ring" />
                  <div className="create-icon__ring create-icon__ring--2" />
                </div>
              </div>
            </RevealSection>

            <RevealSection animation="slide-right" delay={0.2} className="create-text">
              <span className="ignis-label">🛠️ GRAND MASTER FORGE</span>
              <h2 className="ignis-heading">
                ASK. IGNITE.<br />
                <span className="ignis-fire-text">INFLUENCE.</span>
              </h2>
              <hr className="ignis-divider" />
              <p className="create-desc">
                Only the Grand Master can forge new polls. Check the Arena to vote on active decrees.
              </p>
              <Link to="/polls" className="ignis-btn-outline" id="create-poll-cta" style={{ textDecoration: 'none', display: 'inline-block' }}>
                View Active Polls →
              </Link>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 5: ARENA COMMS (CHAT)
          ═══════════════════════════════════════════════ */}
      <section className="ignis-section chat-section" id="arena">
        <SectionEmbers count={15} />
        <div className="ignis-container">
          <div className="chat-grid">
            <RevealSection animation="slide-left" className="chat-text">
              <span className="ignis-label">💬 ARENA COMMS</span>
              <h2 className="ignis-heading">
                DISCUSS. DEBATE.<br />
                <span className="ignis-fire-text">DOMINATE.</span>
              </h2>
              <hr className="ignis-divider" />
              <p className="chat-desc">
                Enter the real-time discussion arena. Debate with fellow Embers, defend your faction, and shape public opinion.
              </p>
              <button className="ignis-btn-primary" id="join-chat-cta">
                Join The Chat 💬
              </button>
            </RevealSection>

            <RevealSection animation="slide-right" delay={0.2} className="chat-preview">
              <div className="chat-window ignis-panel">
                <div className="chat-window__header">
                  <span className="ignis-label" style={{ marginBottom: 0 }}>💬 LIVE CHAT</span>
                  <span className="module-status" style={{ color: '#2D9F2D', borderColor: '#2D9F2D' }}>● ONLINE</span>
                </div>
                <div className="chat-window__messages">
                  {[
                    { user: 'Aether_7', faction: 'aero', color: '#9B5DE5', msg: 'AI is clearly dominating this poll 🔥', time: '2m ago' },
                    { user: 'BlazeKing', faction: 'ignis', color: '#FF6A00', msg: 'Quantum Computing will surprise everyone. Mark my words.', time: '1m ago' },
                    { user: 'TerraForce', faction: 'terra', color: '#2D9F2D', msg: 'Biotech is underrated. Look at the breakthroughs.', time: '45s ago' },
                    { user: 'WaveRider', faction: 'aqua', color: '#00B4D8', msg: 'Web3 had its chance. Next.', time: '12s ago' },
                  ].map((msg, i) => (
                    <div key={i} className="chat-msg">
                      <div className="chat-msg__header">
                        <span className="chat-msg__user" style={{ color: msg.color }}>{msg.user}</span>
                        <span className="chat-msg__badge" style={{ borderColor: msg.color, color: msg.color }}>{msg.faction.toUpperCase()}</span>
                        <span className="chat-msg__time ignis-mono">{msg.time}</span>
                      </div>
                      <p className="chat-msg__text">{msg.msg}</p>
                    </div>
                  ))}
                </div>
                <div className="chat-window__input">
                  <input type="text" placeholder="Type your message..." className="ignis-input" disabled />
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 6: GLOBAL STANDINGS
          ═══════════════════════════════════════════════ */}
      <section className="ignis-section standings-section" id="factions">
        <SectionEmbers count={15} />
        <div className="ignis-container">
          <RevealSection animation="fade-up">
            <div className="section-header section-header--center">
              <span className="ignis-label">🏆 DOMINANCE RANK</span>
              <h2 className="ignis-heading">GLOBAL <span className="ignis-fire-text">STANDINGS</span></h2>
            </div>
          </RevealSection>

          <RevealSection animation="scale-in" delay={0.2}>
            <div className="standings-showcase">
              <div className="standings-orb">
                <div className="standings-orb__glow" />
                <span className="standings-orb__text ignis-fire-text">IGNIS</span>
                <span className="standings-orb__rank">#1 DOMINANT FACTION</span>
              </div>

              <div className="standings-bars">
                {(factionScores || [
                  { name: 'IGNIS', color: '#FF6A00', score: 85, icon: '🔥' },
                  { name: 'AQUA', color: '#00B4D8', score: 72, icon: '🌊' },
                  { name: 'TERRA', color: '#2D9F2D', score: 64, icon: '🌱' },
                  { name: 'AERO', color: '#9B5DE5', score: 58, icon: '🌪️' },
                ]).map((faction, i) => (
                  <div key={i} className="standings-bar">
                    <div className="standings-bar__info">
                      <span className="standings-bar__icon">{faction.icon}</span>
                      <span className="standings-bar__name">{faction.name}</span>
                      <span className="standings-bar__score ignis-mono">{faction.score}pts</span>
                    </div>
                    <div className="standings-bar__track">
                      <div
                        className="standings-bar__fill"
                        style={{ width: `${faction.score}%`, background: faction.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 7: COMMUNITY
          ═══════════════════════════════════════════════ */}
      <section className="ignis-section community-section">
        <SectionEmbers count={15} />
        <div className="ignis-container">
          <div className="community-grid">
            <RevealSection animation="slide-left" className="community-text">
              <span className="ignis-label">🔥 FACTION DOMINANCE</span>
              <h2 className="ignis-heading community-heading">
                30 EMBERS.<br />
                <span className="ignis-fire-text">ONE FIRE.</span>
              </h2>
              <hr className="ignis-divider" />
              <p className="community-desc">
                Choose your allegiance. Compete for dominance. Rise through the ranks.
                Every vote, every debate, every action fuels your faction's fire.
              </p>
              <a href="#factions" className="ignis-btn-outline" id="explore-factions" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Explore Factions →
              </a>
            </RevealSection>

            <RevealSection animation="fade-up" delay={0.15} className="community-cards">
              <div className="faction-cards">
                {[
                  { name: 'IGNIS', icon: '🔥', color: '#FF6A00', desc: 'The fire within. Bold, fierce, dominant.' },
                  { name: 'AQUA', icon: '🌊', color: '#00B4D8', desc: 'The calm tide. Strategic, adaptive, fluid.' },
                  { name: 'TERRA', icon: '🌱', color: '#2D9F2D', desc: 'The grounded force. Resilient, steady, powerful.' },
                  { name: 'AERO', icon: '🌪️', color: '#9B5DE5', desc: 'The swift wind. Agile, unpredictable, creative.' },
                ].map((faction, i) => (
                  <RevealSection key={i} animation="scale-in" delay={0.1 + i * 0.12}>
                    <div
                      className="faction-card ignis-card"
                      style={{ '--faction-accent': faction.color }}
                      id={`faction-${faction.name.toLowerCase()}`}
                    >
                      <div className="faction-card__icon">{faction.icon}</div>
                      <h3 className="faction-card__name" style={{ color: faction.color }}>{faction.name}</h3>
                      <p className="faction-card__desc">{faction.desc}</p>
                      <div className="faction-card__glow" />
                    </div>
                  </RevealSection>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
