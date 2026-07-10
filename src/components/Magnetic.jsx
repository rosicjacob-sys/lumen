import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { coarsePointer, reducedMotion } from '../lib/env'

/**
 * Magnetic hover: drifts toward the cursor inside a radius, elastic release.
 * No-op on coarse pointers and under reduced motion.
 */
export default function Magnetic({ children, strength = 0.35, radius = 70, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion() || coarsePointer()) return
    let inside = false
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const range = Math.max(r.width, r.height) / 2 + radius
      if (Math.hypot(dx, dy) < range) {
        inside = true
        gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
      } else if (inside) {
        inside = false
        gsap.to(el, { x: 0, y: 0, duration: 0.85, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' })
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      gsap.killTweensOf(el)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [strength, radius])
  return (
    <div ref={ref} className={`magnetic ${className}`}>
      {children}
    </div>
  )
}
