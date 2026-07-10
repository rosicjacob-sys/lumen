import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { vialStore } from './vialStore'
import { MQ_DESKTOP, MQ_MOBILE, MQ_REDUCED_DESKTOP, MQ_REDUCED_MOBILE } from '../lib/env'

gsap.registerPlugin(ScrollTrigger)

/**
 * The vial's journey across the page. Scrubbed waypoint tweens (immediateRender
 * off so each picks up where the last left it); the pinned "process" scene owns
 * `swirl` directly (see Process.jsx). Ranges never overlap on a shared field.
 */
export function useVialChoreography() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()

    const wp = (trigger, vars, start = 'top bottom', end = 'top 25%') =>
      gsap.to(vialStore, {
        ...vars,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger, start, end, scrub: 0.5, invalidateOnRefresh: true },
      })

    const intro = () =>
      gsap.to(vialStore, { intro: 1, duration: 1.5, ease: 'back.out(1.4)', delay: 0.2 })

    mm.add(MQ_DESKTOP, () => {
      gsap.set(vialStore, { x: 0.26, y: 0, scale: 1, spotlight: 0, pose: 0, swirl: 0 })
      intro()
      wp('#catalog', { x: -0.36, y: 0.02, scale: 0.52 })
      wp('#process', { x: 0.24, y: 0, scale: 0.82 })
      wp('#verify', { x: 0.28, y: 0.03, scale: 0.9, spotlight: 1 }, 'top 85%', 'top 30%')
      wp('#reviews', { x: 0.32, y: 0.05, scale: 0.42, spotlight: 0 }, 'top 95%', 'top 45%')
      wp('#order', { x: -0.3, y: 0.02, scale: 0.46 })
      wp('#final-cta', { x: 0.26, y: -0.03, scale: 0.6, dropY: 0 }, 'top bottom', 'top 45%')
      wp('#site-footer', { y: -0.95 }, 'top bottom', 'top 60%')
    })

    mm.add(MQ_MOBILE, () => {
      gsap.set(vialStore, { x: 0.16, y: -0.34, scale: 0.5, spotlight: 0, pose: 0, swirl: 0 })
      intro()
      wp('#catalog', { x: 0.28, y: 0.32, scale: 0.24 })
      wp('#process', { x: 0.02, y: 0.24, scale: 0.46, pose: 1 }, 'top 80%', 'top 12%')
      wp('#verify', { x: 0, y: 0.28, scale: 0.52, spotlight: 1, pose: 0 }, 'top 85%', 'top 28%')
      wp('#reviews', { x: 0.3, y: 0.32, scale: 0.24, spotlight: 0 }, 'top 95%', 'top 45%')
      wp('#order', { x: 0.28, y: 0.3, scale: 0.28 })
      wp('#final-cta', { x: 0, y: -0.16, scale: 0.5, dropY: 0 }, 'top bottom', 'top 45%')
      wp('#site-footer', { y: -0.95 }, 'top bottom', 'top 60%')
    })

    const staticPose = (mobile) => () =>
      gsap.set(vialStore, {
        x: mobile ? 0.16 : 0.26,
        y: mobile ? -0.34 : 0,
        scale: mobile ? 0.5 : 1,
        intro: 1,
        swirl: 0,
        spotlight: 0,
        pose: 0,
        dropY: 0,
      })
    mm.add(MQ_REDUCED_DESKTOP, staticPose(false))
    mm.add(MQ_REDUCED_MOBILE, staticPose(true))

    return () => mm.revert()
  }, [])
}
