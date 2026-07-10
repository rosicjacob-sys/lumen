import { useEffect } from 'react'
import gsap from 'gsap'
import { reducedMotion } from './env'
import { scrollState } from './scroll'

/**
 * Infinite marquee on a track whose content is rendered exactly twice.
 * Transform-only, pauses while offscreen or document.hidden (the gsap ticker
 * itself is the restart heartbeat — no observer has to "wake" it), optional
 * scroll-velocity boost and hover pause. Reduced motion: never starts.
 */
export function useMarquee(trackRef, { speed = 60, dir = -1, velocityBoost = false, pauseOnHover = false } = {}) {
  useEffect(() => {
    const track = trackRef.current
    if (!track || reducedMotion()) return
    let x = 0
    let half = 0
    let hovered = false
    let visible = true

    const measure = () => {
      half = track.scrollWidth / 2
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { rootMargin: '120px' }
    )
    io.observe(track)

    const tick = () => {
      if (!half || hovered || !visible || document.hidden) return
      const dt = gsap.ticker.deltaRatio(60) / 60
      const boost = velocityBoost ? Math.min(Math.abs(scrollState.velocity) * 0.55, 2.6) : 0
      x += dir * speed * (1 + boost) * dt
      const y = ((x % half) + half) % half
      track.style.transform = `translate3d(${-y}px,0,0)`
    }
    gsap.ticker.add(tick)

    const enter = () => (hovered = true)
    const leave = () => (hovered = false)
    if (pauseOnHover) {
      track.addEventListener('mouseenter', enter)
      track.addEventListener('mouseleave', leave)
    }
    return () => {
      gsap.ticker.remove(tick)
      ro.disconnect()
      io.disconnect()
      if (pauseOnHover) {
        track.removeEventListener('mouseenter', enter)
        track.removeEventListener('mouseleave', leave)
      }
      track.style.transform = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
