import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../lib/env'

/**
 * STRATA boot sequence: wordmark + calibration readout + strata lines drawing
 * in, ~1.1s, then it hands the page over. Hardened: wall-clock force-finish
 * (a rAF-throttled tab can never trap the page behind the loader), reduced
 * motion skips it entirely, and it unmounts — no lingering overlay.
 */
export default function Boot() {
  const [done, setDone] = useState(() => reducedMotion())
  const ref = useRef(null)
  const pctRef = useRef(null)

  useEffect(() => {
    if (done) return
    let finished = false
    const el = ref.current
    const finish = () => {
      if (finished) return
      finished = true
      gsap.to(el, {
        autoAlpha: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => setDone(true),
      })
      // belt: the fade is tween-driven; a frozen ticker must never trap the
      // overlay on screen — wall-clock unmount regardless.
      setTimeout(() => setDone(true), 800)
    }
    const obj = { v: 0 }
    const tl = gsap.timeline({ onComplete: finish })
    tl.to(obj, {
      v: 100,
      duration: 1.05,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (pctRef.current) pctRef.current.textContent = String(Math.round(obj.v)).padStart(3, '0')
      },
    })
      .from(el.querySelectorAll('.boot-line'), { scaleX: 0, transformOrigin: 'left', stagger: 0.07, duration: 0.5, ease: 'power4.out' }, 0)
      .from(el.querySelector('.boot-mark'), { yPercent: 30, autoAlpha: 0, duration: 0.55, ease: 'power4.out' }, 0.05)
    // wall-clock cap — the loader can NEVER hang the page
    const wall = setTimeout(finish, 1900)
    return () => {
      clearTimeout(wall)
      tl.kill()
    }
  }, [done])

  if (done) return null
  return (
    <div className="boot" ref={ref} aria-hidden="true">
      <div className="boot-inner">
        <p className="boot-mark">NOCTA</p>
        <div className="boot-lines">
          {[0, 1, 2, 3, 4].map((i) => (
            <span className="boot-line" key={i} />
          ))}
        </div>
        <p className="boot-read mono-label">
          PRIMING FLUORESCENCE · LOT 2438 · <span ref={pctRef}>000</span>
        </p>
      </div>
    </div>
  )
}
