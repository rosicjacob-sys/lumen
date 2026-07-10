import gsap from 'gsap'
import SplitHeading from './SplitHeading'
import Magnetic from './Magnetic'
import { useReveal } from '../lib/reveal'
import { scrollToEl } from '../lib/scroll'

export default function Hero() {
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
            RESEARCH PEPTIDES — HPLC-VERIFIED, BATCH-TRACEABLE
          </p>
          <SplitHeading as="h1" className="hero-title">
            Peptides with a <em>paper</em> trail.
          </SplitHeading>
          <p className="hero-sub" data-reveal>
            Lyophilized, argon-sealed, and tested by an independent lab — every lot ships with a
            public certificate of analysis keyed to the batch on the cap.
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
