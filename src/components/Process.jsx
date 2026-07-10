import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { vialStore } from '../three/vialStore'
import { STEPS } from '../lib/data'
import { MQ_DESKTOP, reducedMotion } from '../lib/env'
import { useReveal } from '../lib/reveal'
import SplitHeading from './SplitHeading'

gsap.registerPlugin(ScrollTrigger)

/**
 * The screenshot moment. Desktop: pins ~200vh while the vial's powder lifts
 * into the rotating helix cloud (vialStore.swirl) and the four process steps
 * highlight in sequence. Mobile/reduced: no pin — plain steps (the vial does a
 * two-pose scrub via the choreography instead).
 * Hardened: swirl is written ONLY here; onLeave AND onLeaveBack hard-reset.
 */
export default function Process() {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MQ_DESKTOP, () => {
      const rows = gsap.utils.toArray('.step-row', sectionRef.current)
      const reset = () => {
        vialStore.swirl = 0
        rows.forEach((r) => r.classList.remove('is-active'))
      }
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=200%',
        pin: pinRef.current,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress
          let swirl
          let active = -1
          if (p < 0.22) swirl = p / 0.22
          else if (p < 0.88) {
            swirl = 1
            active = Math.min(3, Math.floor((p - 0.22) / (0.66 / 4)))
          } else swirl = 1 - (p - 0.88) / 0.12
          vialStore.swirl = swirl
          rows.forEach((r, i) => r.classList.toggle('is-active', i === active))
        },
        onLeave: reset,
        onLeaveBack: reset,
      })
      return () => {
        st.kill()
        reset()
      }
    })
    return () => mm.revert()
  }, [])

  const scope = useReveal((el) =>
    gsap.from(el.querySelectorAll('.step-row'), {
      y: 30,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 70%', once: true },
    })
  )

  return (
    <section id="process" className="process" ref={sectionRef}>
      <div className="proc-pin" ref={pinRef}>
        <div className="container proc-grid" ref={scope}>
          <div className="proc-rail">
            <p className="eyebrow">LOT BY LOT — HOW A VIAL EARNS ITS LABEL</p>
            <SplitHeading as="h2" className="section-title">
              Watch the powder <em>speak</em>.
            </SplitHeading>
            <ol className="step-list">
              {STEPS.map((s, i) => (
                <li className="step-row" key={s.t}>
                  <span className="step-n mono-label">{String(s.n).padStart(2, '0')}</span>
                  <div className="step-info">
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            {!reducedMotion() && (
              <p className="proc-hint mono-label" aria-hidden="true">
                KEEP SCROLLING — THE POWDER LIFTS
              </p>
            )}
          </div>
          <div className="proc-space" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
