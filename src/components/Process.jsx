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
 * The synthesis set-piece. Desktop: pins ~200vh — the global progress scrub
 * keeps advancing during the pin, so the wavefront slows here and the base-pair
 * rungs assemble rung-by-rung while the camera holds its close synthesis
 * framing; the four steps highlight in sequence. The pin only holds the section
 * and highlights steps — the strand writing is owned by the global scrub.
 */
export default function Process() {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MQ_DESKTOP, () => {
      const rows = gsap.utils.toArray('.step-row', sectionRef.current)
      const reset = () => rows.forEach((r) => r.classList.remove('is-active'))
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=200%',
        pin: pinRef.current,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress
          const active = p < 0.12 ? -1 : Math.min(3, Math.floor((p - 0.12) / (0.88 / 4)))
          rows.forEach((r, i) => r.classList.toggle('is-active', i === active))
        },
        onLeave: reset,
        onLeaveBack: reset,
      })
      return () => { st.kill(); reset() }
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
            <p className="eyebrow">SYNTHESIS — WATCHED, NOT CLAIMED</p>
            <SplitHeading as="h2" className="section-title">
              The strand <em>writes</em> itself.
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
                KEEP SCROLLING — THE SEQUENCE FILLS IN
              </p>
            )}
          </div>
          <div className="proc-space" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
