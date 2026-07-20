import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { vialStore } from './vialStore'
import { MQ_DESKTOP, MQ_MOBILE, MQ_REDUCED_DESKTOP, MQ_REDUCED_MOBILE } from '../lib/env'

gsap.registerPlugin(ScrollTrigger)

/**
 * NOCTA choreography. ONE global scrub writes `progress` 0..1 across the whole
 * document — the camera descends the strand and the wavefront sequences it as
 * you scroll. Per-section waypoints only reframe the camera (dolly/lateral/
 * look) and trigger the verify scanner + order column reveal + powder calm.
 * The pinned synthesis lives in Process.jsx.
 */
export function useVialChoreography() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()

    const wp = (trigger, vars, start = 'top bottom', end = 'top 30%') =>
      gsap.to(vialStore, {
        ...vars, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger, start, end, scrub: 0.6, invalidateOnRefresh: true },
      })

    mm.add(MQ_DESKTOP, () => {
      gsap.set(vialStore, {
        progress: 0, intro: 0, dim: 1,
        camZ: 9.4, camX: 0.5, camRoll: 0, lookLead: 0.02,
        scanner: 0, columnReveal: 0, powderCalm: 0,
      })
      gsap.to(vialStore, { intro: 1, duration: 1.6, ease: 'power2.out', delay: 0.2 })
      // the spine: whole-document scrub descends the strand + writes it
      gsap.to(vialStore, {
        progress: 1, ease: 'none',
        scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
      })
      // camera framing per station. `dim` + a farther/rightward camera let the
      // strand shrink & recede over content-dense sections, then swell bright
      // at the two set-pieces (hero + process synthesis).
      wp('#catalog', { camZ: 13.5, camX: -2.0, dim: 0.35, lookLead: 0.03, powderCalm: 0 })
      wp('#process', { camZ: 6.4, camX: 0.55, dim: 1, lookLead: 0.045, powderCalm: 0 })
      wp('#verify', { camZ: 12.5, camX: -1.7, dim: 0.4, lookLead: 0.02, scanner: 1, powderCalm: 0.6 }, 'top 80%', 'top 25%')
      wp('#reviews', { camZ: 13.5, camX: -2.0, dim: 0.35, scanner: 0, powderCalm: 0.55 }, 'top 95%', 'top 45%')
      wp('#order', { camZ: 13.5, camX: -1.9, dim: 0.35, camRoll: 0.02, columnReveal: 1, powderCalm: 0.85 })
      wp('#final-cta', { camZ: 9.6, camX: 0.4, dim: 0.85, camRoll: 0, columnReveal: 0.4, powderCalm: 1 }, 'top bottom', 'top 45%')
    })

    mm.add(MQ_MOBILE, () => {
      gsap.set(vialStore, {
        progress: 0, intro: 0,
        camZ: 15, camX: -0.6, camRoll: 0, lookLead: 0.02, dim: 0.7,
        scanner: 0, columnReveal: 0, powderCalm: 0,
      })
      gsap.to(vialStore, { intro: 1, duration: 1.6, ease: 'power2.out', delay: 0.2 })
      gsap.to(vialStore, {
        progress: 1, ease: 'none',
        scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
      })
      wp('#catalog', { camZ: 19, camX: -1.9, dim: 0.28 })
      wp('#process', { camZ: 12.5, camX: -0.4, dim: 0.8 })
      wp('#verify', { camZ: 18, camX: -1.7, dim: 0.32, scanner: 1, powderCalm: 0.6 }, 'top 80%', 'top 25%')
      wp('#reviews', { camZ: 19, camX: -1.9, dim: 0.28, scanner: 0, powderCalm: 0.55 }, 'top 95%', 'top 45%')
      wp('#order', { camZ: 19, camX: -1.8, dim: 0.28, columnReveal: 1, powderCalm: 0.85 })
      wp('#final-cta', { camZ: 15.5, camX: -0.4, dim: 0.65, columnReveal: 0.4, powderCalm: 1 }, 'top bottom', 'top 45%')
    })

    const staticPose = (mobile) => () =>
      gsap.set(vialStore, {
        progress: 0.42, intro: 1,
        camZ: mobile ? 15 : 9.4, camX: mobile ? -0.5 : 0.5, camRoll: 0, lookLead: 0.02,
        scanner: 0, columnReveal: 0, powderCalm: 0.3, dim: 0.85,
      })
    mm.add(MQ_REDUCED_DESKTOP, staticPose(false))
    mm.add(MQ_REDUCED_MOBILE, staticPose(true))

    return () => mm.revert()
  }, [])
}
