import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitHeading from './SplitHeading'
import Magnetic from './Magnetic'
import { useReveal } from '../lib/reveal'
import { scrollToEl, scrollState } from '../lib/scroll'
import { coarsePointer, reducedMotion } from '../lib/env'

export default function Hero() {
  const titleRef = useRef(null)
  // scroll-velocity-reactive display width: the headline breathes wider with
  // scroll speed (capped), snaps back with the smoothed velocity.
  useEffect(() => {
    if (reducedMotion() || coarsePointer()) return
    let w = 124
    const tick = () => {
      const el = titleRef.current && titleRef.current.querySelector('h1')
      if (!el) return
      const target = Math.min(124 + Math.abs(scrollState.velocity) * 3.2, 134)
      w += (target - w) * 0.12
      el.style.fontVariationSettings = `'wdth' ${w.toFixed(2)}`
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  const scope = useReveal((el) =>
    gsap.from(el.querySelectorAll('[data-reveal]'), {
      y: 26,
      autoAlpha: 0,
      duration: 0.95,
      ease: 'power3.out',
      stagger: 0.09,
      delay: 0.45,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  )
  return (
    <section id="hero" className="hero" ref={scope}>
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow" data-reveal>
            RESEARCH PEPTIDES — READ AS LIGHT
          </p>
          <div ref={titleRef}>
            <SplitHeading as="h1" className="hero-title">
              The compound, read as <em>light</em>.
            </SplitHeading>
          </div>
          <p className="hero-sub" data-reveal>
            Research peptides, sequenced in the dark. Each lot is lyophilized, argon-sealed, and
            cold-shipped — with a public certificate of analysis keyed to the batch on the cap.
          </p>
          <div className="hero-ctas" data-reveal>
            <Magnetic>
              <button
                className="btn"
                onClick={() => scrollToEl('#catalog')}
              >
                Browse the catalog
              </button>
            </Magnetic>
            <Magnetic strength={0.22}>
              <a
                className="btn-ghost"
                href="#verify"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToEl('#verify')
                }}
              >
                How we verify
              </a>
            </Magnetic>
          </div>
          <ul className="trust-row mono-label" data-reveal>
            <li>≥98% PURITY</li>
            <li>COA PER LOT</li>
            <li>RESEARCH USE ONLY</li>
          </ul>
        </div>
        <div className="hero-stage" aria-hidden="true" />
      </div>
    </section>
  )
}
