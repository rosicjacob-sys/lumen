// Capability probes + test hooks.
// ?rm=1 forces reduced motion, ?nogl=1 forces the WebGL fallback —
// so the failsafes can be exercised deliberately, not just trusted.
import { useEffect, useState } from 'react'

const params = new URLSearchParams(window.location.search)

export const FORCE_REDUCED_MOTION = params.has('rm')
export const FORCE_NO_WEBGL = params.has('nogl')
// ?qa=1 lets automated QA drive the scene (compose frames in a hidden tab).
export const FORCE_QA = params.has('qa')

export const reducedMotion = () =>
  FORCE_REDUCED_MOTION || window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const coarsePointer = () => window.matchMedia('(pointer: coarse)').matches

// 799.98 (not 799): fractional CSS widths from zoom / non-integer DPR must
// never fall between the mobile and desktop ranges.
export const MOBILE_MQ = '(max-width: 799.98px)'

export const isMobileViewport = () => window.matchMedia(MOBILE_MQ).matches

// Reactive media-query hook — canvas props (dpr, particles, frameloop) must
// track live viewport/preference changes, same as the GSAP matchMedia side.
export function useMediaQuery(query, force = false) {
  const [matches, setMatches] = useState(() => force || window.matchMedia(query).matches)
  useEffect(() => {
    if (force) return
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query, force])
  return matches
}

export function webglSupported() {
  if (FORCE_NO_WEBGL) return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// gsap.matchMedia condition strings, honoring the ?rm=1 override.
// With ?rm=1 we hand gsap a never-matching query so all motion contexts stay off.
export const MQ_MOTION_OK = FORCE_REDUCED_MOTION
  ? '(min-width: 999999px)'
  : '(prefers-reduced-motion: no-preference)'
export const MQ_DESKTOP = `(min-width: 800px) and ${MQ_MOTION_OK}`
export const MQ_MOBILE = `${MOBILE_MQ} and ${MQ_MOTION_OK}`
export const MQ_REDUCED = FORCE_REDUCED_MOTION
  ? '(min-width: 1px)'
  : '(prefers-reduced-motion: reduce)'
// Width-scoped reduced contexts so the static pose re-applies when a
// reduced-motion viewport crosses the breakpoint (rotation, window resize).
export const MQ_REDUCED_DESKTOP = `(min-width: 800px) and ${MQ_REDUCED}`
export const MQ_REDUCED_MOBILE = `${MOBILE_MQ} and ${MQ_REDUCED}`
