import React, { useRef, useEffect, useState } from 'react'
import './IgnisCursor.css'

/*
  IgnisCursor — A custom fire-themed cursor that interacts with the page.
  - Outer ring follows the mouse with a smooth lerp delay
  - Inner dot tracks the mouse precisely
  - Both pulse with a fiery glow
  - The ring expands on hoverable elements
  - Emits tiny sparks on click
*/

const IgnisCursor = () => {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const sparksContainerRef = useRef(null)
  const mousePos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    const handleMove = (e) => {
      mousePos.current.x = e.clientX
      mousePos.current.y = e.clientY
    }

    const handleDown = () => setIsClicking(true)
    const handleUp = () => setIsClicking(false)

    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mousedown', handleDown)
    window.addEventListener('mouseup', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mousedown', handleDown)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [])

  /* ── Detect hoverable elements ── */
  useEffect(() => {
    const hoverables = 'a, button, .ignis-card, .module-card, .faction-card, .poll-option, .ignis-btn-primary, .ignis-btn-outline, input, [role="button"]'

    const onOver = () => setIsHovering(true)
    const onOut = () => setIsHovering(false)

    const observer = new MutationObserver(() => {
      document.querySelectorAll(hoverables).forEach((el) => {
        el.removeEventListener('mouseenter', onOver)
        el.removeEventListener('mouseleave', onOut)
        el.addEventListener('mouseenter', onOver)
        el.addEventListener('mouseleave', onOut)
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })

    // Initial bind
    document.querySelectorAll(hoverables).forEach((el) => {
      el.addEventListener('mouseenter', onOver)
      el.addEventListener('mouseleave', onOut)
    })

    return () => observer.disconnect()
  }, [])

  /* ── Click sparks ── */
  useEffect(() => {
    if (!isClicking) return

    const container = sparksContainerRef.current
    if (!container) return

    const { x, y } = mousePos.current
    const sparkCount = 6 + Math.floor(Math.random() * 4)

    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('div')
      spark.className = 'ignis-cursor__spark'
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.5
      const distance = 20 + Math.random() * 40
      const tx = Math.cos(angle) * distance
      const ty = Math.sin(angle) * distance
      spark.style.left = `${x}px`
      spark.style.top = `${y}px`
      spark.style.setProperty('--spark-tx', `${tx}px`)
      spark.style.setProperty('--spark-ty', `${ty}px`)
      spark.style.setProperty('--spark-size', `${1.5 + Math.random() * 2.5}px`)
      container.appendChild(spark)
      // Clean up after animation
      spark.addEventListener('animationend', () => spark.remove())
    }
  }, [isClicking])

  /* ── Smooth animation loop for ring lerp ── */
  useEffect(() => {
    let raf
    const lerp = (a, b, t) => a + (b - a) * t

    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.12)
      ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.12)

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mousePos.current.x}px, ${mousePos.current.y}px) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%) scale(${isHovering ? 1.8 : isClicking ? 0.7 : 1})`
      }

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [isHovering, isClicking])

  return (
    <>
      <div
        ref={dotRef}
        className={`ignis-cursor__dot ${isHovering ? 'ignis-cursor__dot--hover' : ''} ${isClicking ? 'ignis-cursor__dot--click' : ''}`}
      />
      <div
        ref={ringRef}
        className={`ignis-cursor__ring ${isHovering ? 'ignis-cursor__ring--hover' : ''} ${isClicking ? 'ignis-cursor__ring--click' : ''}`}
      />
      <div ref={sparksContainerRef} className="ignis-cursor__sparks" aria-hidden="true" />
    </>
  )
}

export default IgnisCursor
