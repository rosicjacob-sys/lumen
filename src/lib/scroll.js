import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { reducedMotion } from './env'

// Shared, mutable scroll state. Marquees and the pill read `velocity`
// every frame; never re-render React for it.
export const scrollState = {
  lenis: null,
  velocity: 0, // smoothed, signed px/frame-ish
}

export function startLenis() {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })
  scrollState.lenis = lenis
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (time) => {
    lenis.raf(time * 1000)
    scrollState.velocity += (lenis.velocity - scrollState.velocity) * 0.1
  }
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(raf)
    lenis.destroy()
    scrollState.lenis = null
    scrollState.velocity = 0
  }
}

export function scrollToEl(target, offset = -76) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  if (scrollState.lenis && !reducedMotion()) {
    scrollState.lenis.scrollTo(el, { offset, duration: 1.4 })
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top: y, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
}
