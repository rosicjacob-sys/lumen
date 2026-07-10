import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import { reducedMotion } from '../lib/env'
import { armRevealFailsafe } from '../lib/reveal'

gsap.registerPlugin(ScrollTrigger)

/**
 * Masked reveal heading. types='chars' staggers characters, 'lines' staggers
 * whole lines. Words stay inline-block units (split-type) so nothing wraps
 * mid-word. The split waits for fonts (metrics), and the DOM is reverted to
 * natural text the moment the animation completes — no lingering span soup.
 */
export default function SplitHeading({
  as: Tag = 'h2',
  children,
  className = '',
  types = 'chars',
  stagger,
  id,
}) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    let split = null
    let tween = null
    let disarm = null
    let cancelled = false

    const run = async () => {
      try {
        await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))])
      } catch {
        /* fonts API unavailable — split with current metrics */
      }
      if (cancelled) return
      const chars = types === 'chars'
      split = new SplitType(el, {
        types: 'lines,words,chars',
        lineClass: 'sh-line',
        wordClass: 'sh-word',
        charClass: 'sh-char',
      })
      const targets = chars ? split.chars : split.lines
      if (!targets || !targets.length) return
      tween = gsap.from(targets, {
        yPercent: 112,
        duration: chars ? 0.9 : 1.05,
        stagger: stagger ?? (chars ? 0.028 : 0.14),
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onComplete: () => {
          if (split) split.revert()
          split = null
        },
      })
      disarm = armRevealFailsafe(
        el,
        () => !tween || tween.progress() > 0 || tween.isActive(),
        () => tween && tween.progress(1)
      )
    }
    run()
    return () => {
      cancelled = true
      if (disarm) disarm()
      if (tween) {
        if (tween.scrollTrigger) tween.scrollTrigger.kill()
        tween.kill()
      }
      if (split) split.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Tag ref={ref} id={id} className={`split-heading ${className}`}>
      {children}
    </Tag>
  )
}
