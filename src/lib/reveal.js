import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotion } from './env'

gsap.registerPlugin(ScrollTrigger)

/**
 * Wall-clock reveal failsafe. Content hidden by a gsap.from() may NEVER stay
 * invisible because a trigger or observer failed:
 *  - 3.5s after arming, anything at/above the viewport is force-finished.
 *  - An independent IntersectionObserver gives on-screen elements 1.5s to
 *    have started playing, then force-finishes.
 * Returns a disarm function.
 */
export function armRevealFailsafe(el, hasPlayed, forceFinish) {
  const timers = []
  const check = () => {
    if (!hasPlayed()) forceFinish()
  }
  timers.push(
    setTimeout(() => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * 1.05) check()
    }, 3500)
  )
  let io
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          timers.push(setTimeout(check, 1500))
        }
      },
      { threshold: 0.05 }
    )
    io.observe(el)
  }
  return () => {
    timers.forEach(clearTimeout)
    if (io) io.disconnect()
  }
}

/**
 * useReveal(build) -> scope ref.
 * `build(el)` runs inside a gsap.context and returns a tween/timeline whose
 * scrollTrigger should be `once: true`. Contract: elements are hidden ONLY by
 * the tween (gsap.from/fromTo) — never by CSS — so the pre-JS state is visible.
 * Reduced motion: build is skipped entirely; content just sits there, visible.
 */
export function useReveal(build) {
  const scope = useRef(null)
  useLayoutEffect(() => {
    const el = scope.current
    if (!el || reducedMotion()) return
    let disarm
    const ctx = gsap.context(() => {
      const tl = build(el)
      if (!tl) return
      disarm = armRevealFailsafe(
        el,
        () => tl.progress() > 0 || tl.isActive(),
        () => tl.progress(1)
      )
    }, el)
    return () => {
      if (disarm) disarm()
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return scope
}
