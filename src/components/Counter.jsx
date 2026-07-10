import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotion } from '../lib/env'

gsap.registerPlugin(ScrollTrigger)

/**
 * Count-up that can never show a wrong number:
 *  - default/initial text IS the exact final value (if no trigger ever fires,
 *    the right number is already on screen);
 *  - each run arms a wall-clock setTimeout that snaps to the exact target —
 *    rAF throttling in background tabs freezes tween-driven counters, and a
 *    wrong price on screen is a catastrophic bug;
 *  - lands with a 1-frame tick flash.
 */
export default function Counter({ value, prefix = '', suffix = '', duration = 1.3, className = '' }) {
  const ref = useRef(null)
  const final = `${prefix}${value.toLocaleString('en-US')}${suffix}`

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    let tween = null
    let wall = null
    let flashT = null
    let landed = false

    const land = () => {
      if (landed) return
      landed = true
      el.textContent = final
      el.classList.add('tick-flash')
      flashT = setTimeout(() => el.classList.remove('tick-flash'), 160)
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        const obj = { v: 0 }
        tween = gsap.to(obj, {
          v: value,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            if (!landed) el.textContent = `${prefix}${Math.round(obj.v).toLocaleString('en-US')}${suffix}`
          },
          onComplete: land,
        })
        wall = setTimeout(land, duration * 1000 + 400)
      },
    })
    return () => {
      st.kill()
      if (tween) tween.kill()
      clearTimeout(wall)
      clearTimeout(flashT)
      el.textContent = final
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, prefix, suffix])

  return (
    <span ref={ref} className={`counter ${className}`}>
      {final}
    </span>
  )
}
