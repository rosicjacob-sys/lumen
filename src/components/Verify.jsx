import gsap from 'gsap'
import { useReveal } from '../lib/reveal'
import SplitHeading from './SplitHeading'
import Counter from './Counter'

const STATS = [
  { value: 99.1, suffix: '%', decimals: 1, label: 'MEAN HPLC PURITY, LAST 90 DAYS' },
  { value: 100, suffix: '%', label: 'LOTS SHIPPED WITH A PUBLIC COA' },
  { value: 24, suffix: 'H', label: 'DISPATCH ON BUSINESS DAYS' },
]

export default function Verify() {
  const scope = useReveal((el) =>
    gsap.from(el.querySelectorAll('[data-reveal]'), {
      y: 24,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 70%', once: true },
    })
  )
  return (
    <section id="verify" className="verify" ref={scope}>
      <div className="container">
        <p className="eyebrow eyebrow-onink" data-reveal>
          VERIFICATION — THE SPOTLIGHT SCENE
        </p>
        <SplitHeading as="h2" className="verify-quote" types="lines">
          Trust isn’t a claim. It’s a <em>chromatogram</em>.
        </SplitHeading>
        <p className="verify-body" data-reveal>
          Every lot goes to an independent, ISO 17025-accredited lab for reverse-phase HPLC and
          mass-spec identity testing before it can ship. The number on the vial is the number the
          assay returned — scan the cap to read the certificate yourself.
        </p>
        <div className="verify-stats">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <Counter value={s.value} suffix={s.suffix} className="stat-num" />
              <span className="stat-label mono-label">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="verify-foot mono-label" data-reveal>
          ASSAYS: RP-HPLC (UV 220NM) + ESI-MS IDENTITY · ENDOTOXIN & MICROBIAL PANELS ON REQUEST ·
          CERTIFICATES KEYED TO THE BATCH CODE ON EVERY CAP
        </p>
      </div>
    </section>
  )
}
