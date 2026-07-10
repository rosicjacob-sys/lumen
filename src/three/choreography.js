import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { vialStore } from './vialStore'
import { MQ_DESKTOP, MQ_MOBILE, MQ_REDUCED_DESKTOP, MQ_REDUCED_MOBILE } from '../lib/env'

gsap.registerPlugin(ScrollTrigger)

/**
 * The compound's journey. Every waypoint scrubs a FULL shape-weight profile
 * (cloud/mound/helix/torus) plus position — consecutive tweens on the same
 * fields, immediateRender off, ranges never overlapping. The pinned process
 * scene owns wHelix/wCloud/rungReveal directly (see Process.jsx) in the gap
 * between the #process and #verify waypoints.
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
      gsap.to(vialStore, { intro: 1, duration: 1.6, ease: 'power3.out', delay: 0.2 })

    mm.add(MQ_DESKTOP, () => {
      gsap.set(vialStore, {
        x: 0.26, y: 0, scale: 1, spotlight: 0, pose: 0,
        wCloud: 1, wMound: 0, wHelix: 0, wTorus: 0, rungReveal: 0,
      })
      intro()
      // hero cloud -> settled powder mound at the catalog's left gutter
      wp('#catalog', { x: -0.36, y: -0.04, scale: 0.6, wCloud: 0, wMound: 1, wHelix: 0, wTorus: 0 })
      // approach the pinned scene as a mound; the pin itself assembles the helix
      wp('#process', { x: 0.24, y: 0, scale: 0.85, wMound: 1, wCloud: 0, wHelix: 0, wTorus: 0 })
      // dark verification: helix stands tall in the spotlight
      wp('#verify', { x: 0.28, y: 0, scale: 1.02, spotlight: 1, wHelix: 1, wMound: 0, wCloud: 0, wTorus: 0, rungReveal: 1 }, 'top 85%', 'top 30%')
      // relax to a small drifting cloud beside the batch ledger
      wp('#reviews', { x: 0.32, y: 0.05, scale: 0.42, spotlight: 0, wCloud: 1, wHelix: 0, wMound: 0, wTorus: 0 }, 'top 95%', 'top 45%')
      // the dose ring hovers beside the buy box
      wp('#order', { x: -0.3, y: 0.02, scale: 0.5, wTorus: 1, wCloud: 0, wHelix: 0, wMound: 0 })
      const arriveD = ScrollTrigger.create({
        trigger: '#order', start: 'top 55%', once: true,
        onEnter: () => window.dispatchEvent(new CustomEvent('vial-arrived')),
      })
      // calm cloud at the close
      wp('#final-cta', { x: 0.26, y: -0.03, scale: 0.62, wCloud: 1, wTorus: 0, dropY: 0 }, 'top bottom', 'top 45%')
      wp('#site-footer', { y: -0.95 }, 'top bottom', 'top 60%')
      return () => arriveD.kill()
    })

    mm.add(MQ_MOBILE, () => {
      gsap.set(vialStore, {
        x: 0.18, y: -0.42, scale: 0.5, spotlight: 0, pose: 0,
        wCloud: 1, wMound: 0, wHelix: 0, wTorus: 0, rungReveal: 0,
      })
      intro()
      wp('#catalog', { x: 0.28, y: 0.32, scale: 0.26, wCloud: 0, wMound: 1, wHelix: 0, wTorus: 0 })
      // no pin on mobile: a short scrub assembles the helix in place
      wp('#process', { x: 0.02, y: 0.24, scale: 0.5, pose: 1, wHelix: 1, wMound: 0, wCloud: 0, wTorus: 0, rungReveal: 1 }, 'top 80%', 'top 12%')
      wp('#verify', { x: 0, y: 0.26, scale: 0.56, spotlight: 1, pose: 0 }, 'top 85%', 'top 28%')
      wp('#reviews', { x: 0.3, y: 0.32, scale: 0.26, spotlight: 0, wCloud: 1, wHelix: 0, rungReveal: 0 }, 'top 95%', 'top 45%')
      wp('#order', { x: 0.28, y: 0.3, scale: 0.3, wTorus: 1, wCloud: 0 })
      const arriveM = ScrollTrigger.create({
        trigger: '#order', start: 'top 55%', once: true,
        onEnter: () => window.dispatchEvent(new CustomEvent('vial-arrived')),
      })
      wp('#final-cta', { x: 0, y: -0.16, scale: 0.52, wCloud: 1, wTorus: 0, dropY: 0 }, 'top bottom', 'top 45%')
      wp('#site-footer', { y: -0.95 }, 'top bottom', 'top 60%')
      return () => arriveM.kill()
    })

    // Reduced motion: one static composed frame — the assembled helix, the
    // most branded shape, at the hero position.
    const staticPose = (mobile) => () =>
      gsap.set(vialStore, {
        x: mobile ? 0.18 : 0.26,
        y: mobile ? -0.42 : 0,
        scale: mobile ? 0.5 : 0.92,
        intro: 1,
        wCloud: 0, wMound: 0, wHelix: 1, wTorus: 0,
        rungReveal: 1,
        spotlight: 0,
        pose: 0,
        dropY: 0,
      })
    mm.add(MQ_REDUCED_DESKTOP, staticPose(false))
    mm.add(MQ_REDUCED_MOBILE, staticPose(true))

    return () => mm.revert()
  }, [])
}
