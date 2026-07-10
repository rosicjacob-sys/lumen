import { useRef } from 'react'
import { useMarquee } from '../lib/useMarquee'
import { reducedMotion } from '../lib/env'
import SplitHeading from './SplitHeading'

// Social proof, replaced with something this category can actually claim:
// a live-feeling rail of recent batch records. More credible than reviews,
// and compliant — no human-effect testimonials.
const BATCHES = [
  { lot: 'GHK-CU · LOT 2417', purity: '99.2%', mass: '340.9 DA ✓' },
  { lot: 'RETATRUTIDE · LOT 2431', purity: '99.5%', mass: '4731 DA ✓' },
  { lot: '5-AMINO-1MQ · LOT 2409', purity: '98.7%', mass: '160.2 DA ✓' },
  { lot: 'BPC-157 · LOT 2422', purity: '99.0%', mass: '1419 DA ✓' },
  { lot: 'SEMAGLUTIDE · LOT 2436', purity: '99.4%', mass: '4114 DA ✓' },
  { lot: 'TB-500 · LOT 2411', purity: '98.9%', mass: '889 DA ✓' },
  { lot: 'IPAMORELIN · LOT 2428', purity: '99.3%', mass: '711 DA ✓' },
  { lot: 'EPITHALON · LOT 2404', purity: '98.8%', mass: '390 DA ✓' },
]

function Chip({ b }) {
  return (
    <span className="batch-chip">
      <span className="batch-lot mono-label">{b.lot}</span>
      <span className="batch-purity mono-label">HPLC {b.purity}</span>
      <span className="batch-mass mono-label">{b.mass}</span>
      <span className="batch-pass mono-label">PASS</span>
    </span>
  )
}

function Row({ items, dir, speed }) {
  const track = useRef(null)
  useMarquee(track, { speed, dir, pauseOnHover: true })
  return (
    <div className="batch-row">
      <div className="batch-track" ref={track}>
        {items.map((b, i) => (
          <Chip b={b} key={`a-${i}`} />
        ))}
        {items.map((b, i) => (
          <Chip b={b} key={`b-${i}`} />
        ))}
      </div>
    </div>
  )
}

export default function BatchRail() {
  const reduced = reducedMotion()
  return (
    <section id="reviews" className="batches">
      <div className="container">
        <p className="eyebrow">RECENT LOTS — THE LEDGER, NOT THE HYPE</p>
        <SplitHeading as="h2" className="section-title">
          Proof <em>scrolls</em> by.
        </SplitHeading>
      </div>
      {reduced ? (
        <div className="container batch-grid-static">
          {BATCHES.slice(0, 6).map((b) => (
            <Chip b={b} key={b.lot} />
          ))}
        </div>
      ) : (
        <>
          <Row items={BATCHES.slice(0, 4)} dir={-1} speed={34} />
          <Row items={BATCHES.slice(4)} dir={1} speed={24} />
        </>
      )}
    </section>
  )
}
