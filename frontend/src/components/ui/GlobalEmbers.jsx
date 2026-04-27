import React, { useMemo, useRef, useEffect, useCallback } from 'react'
import './GlobalEmbers.css'

/*
  GlobalEmbers — DOM-based floating ember particles.
  Each ember floats upward via CSS animation.
  A JS layer detects cursor proximity and pushes embers away,
  applied through a wrapper div so it doesn't conflict with the CSS animation.
*/

const INTERACTION_RADIUS = 140   // px — how close cursor must be to push
const PUSH_STRENGTH = 60         // px — max push distance

const GlobalEmbers = ({ count = 15 }) => {
  const wrappersRef = useRef([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const pushRef = useRef([])       // stores current push {x, y} per ember
  const rafRef = useRef(null)
  const embersContainerRef = useRef(null)

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 3,
      delay: `${Math.random() * 12}s`,
      duration: `${8 + Math.random() * 10}s`,
      drift: `${-30 + Math.random() * 60}px`,
      opacity: 0.3 + Math.random() * 0.5,
    }))
  }, [count])

  // Initialize push offsets
  useEffect(() => {
    pushRef.current = Array.from({ length: count }, () => ({ x: 0, y: 0 }))
  }, [count])

  // Track mouse
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

  // Animation loop — check each ember's position vs cursor, apply push
  const animate = useCallback(() => {
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    for (let i = 0; i < wrappersRef.current.length; i++) {
      const wrapper = wrappersRef.current[i]
      if (!wrapper) continue

      // Get the ember element inside the wrapper
      const ember = wrapper.firstChild
      if (!ember) continue

      // Get ember's current visual position
      const rect = ember.getBoundingClientRect()
      const ex = rect.left + rect.width / 2
      const ey = rect.top + rect.height / 2

      const dx = ex - mx
      const dy = ey - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      const push = pushRef.current[i]

      if (dist < INTERACTION_RADIUS && dist > 0) {
        // Push away from cursor
        const force = (1 - dist / INTERACTION_RADIUS) * PUSH_STRENGTH
        const angle = Math.atan2(dy, dx)
        const targetX = Math.cos(angle) * force
        const targetY = Math.sin(angle) * force
        // Lerp toward target for smooth movement
        push.x += (targetX - push.x) * 0.15
        push.y += (targetY - push.y) * 0.15
      } else {
        // Ease back to zero when cursor is far
        push.x *= 0.92
        push.y *= 0.92
        // Snap to zero when negligible
        if (Math.abs(push.x) < 0.1 && Math.abs(push.y) < 0.1) {
          push.x = 0
          push.y = 0
        }
      }

      // Apply push offset via the wrapper
      wrapper.style.transform = `translate(${push.x}px, ${push.y}px)`
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animate])

  return (
    <div className="global-embers" ref={embersContainerRef} aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={p.id}
          className="global-ember-wrapper"
          ref={(el) => (wrappersRef.current[i] = el)}
        >
          <div
            className="global-ember"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
              '--ember-drift': p.drift,
              '--ember-opacity': p.opacity,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default GlobalEmbers
