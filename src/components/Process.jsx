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
 * The screenshot moment. Desktop: pins ~200vh while the powder mound
 * assembles into the rotating double helix (wHelix) and the base-pair rungs
 * click in one by one (rungReveal), steps highlighting in sequence.
 * Mobile/reduced: no pin — a short scrub assembles the helix instead.
 * Hardened: within the pin gap, weights are written ONLY here; onLeaveBack
 * hands the mound back, onLeave hands the built helix to #verify's waypoint.
 */
export default function Process() {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MQ_DESKTOP, () => {
      const rows = gsap.utils.toArray('.step-row', sectionRef.current)
      const reset = () => {
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
          let active = -1
          // 0–0.3: the powder mound assembles into the double helix;
          // 0.18–1: base-pair rungs click in one by one (cascade),
          // steps highlight across the hold.
          const build = Math.min(p / 0.3, 1)
          vialStore.wHelix = build
          vialStore.wMound = 1 - build
          vialStore.wCloud = 0
          vialStore.wTorus = 0
          vialStore.rungReveal = Math.min(Math.max((p - 0.18) / 0.72, 0), 1)
          if (p >= 0.25) active = Math.min(3, Math.floor((p - 0.25) / (0.75 / 4)))
          rows.forEach((r, i) => r.classList.toggle('is-active', i === active))
        },
        // No weight reset here: leaving downward hands a fully-built helix to
        // the #verify waypoint (which owns it next); leaving upward hands the
        // mound back to the #process waypoint. Only the DOM state resets.
        onLeave: () => reset(),
        onLeaveBack: () => {
          reset()
          vialStore.wHelix = 0
          vialStore.wMound = 1
          vialStore.rungReveal = 0
        },
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
              Powder in. <em>Sequence</em> out.
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
                KEEP SCROLLING — THE HELIX ASSEMBLES
              </p>
            )}
          </div>
          <div className="proc-space" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
