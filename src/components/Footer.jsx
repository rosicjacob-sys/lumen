import { DISCLAIMER } from '../lib/data'
import { VialGlyph } from './Nav'
import { scrollToEl } from '../lib/scroll'

const PAYMENTS = ['VISA', 'MC', 'AMEX', 'WIRE']

export default function Footer() {
  const go = (e, t) => {
    e.preventDefault()
    scrollToEl(t)
  }
  return (
    <footer id="site-footer" className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <p className="footer-logo">
            <VialGlyph />
            <span>NOCTA</span>
          </p>
          <p className="mono-label">RESEARCH-GRADE · BATCH-TRACEABLE</p>
          <p className="footer-tag">Research peptides, sequenced in the dark.</p>
        </div>
        <nav className="footer-col" aria-label="Shop">
          <p className="mono-label footer-head">CATALOG</p>
          <a href="#catalog" onClick={(e) => go(e, '#catalog')}>GHK-Cu 100mg — $46</a>
          <a href="#catalog" onClick={(e) => go(e, '#catalog')}>5-Amino-1MQ 50mg — $64</a>
          <a href="#catalog" onClick={(e) => go(e, '#catalog')}>Retatrutide 20mg — $189</a>
          <a href="#catalog" onClick={(e) => go(e, '#catalog')}>All peptides</a>
        </nav>
        <nav className="footer-col" aria-label="Standards">
          <p className="mono-label footer-head">STANDARDS</p>
          <a href="#process" onClick={(e) => go(e, '#process')}>Our process</a>
          <a href="#verify" onClick={(e) => go(e, '#verify')}>Verification &amp; COAs</a>
          <a href="#faq" onClick={(e) => go(e, '#faq')}>FAQ + shipping</a>
        </nav>
        <div className="footer-col">
          <p className="mono-label footer-head">CONTACT</p>
          <a href="mailto:lab@nocta.bio">lab@nocta.bio</a>
          <p className="footer-pay" aria-label="Accepted payments: Visa, Mastercard, American Express, wire transfer">
            {PAYMENTS.map((p) => (
              <span className="pay-chip mono-label" key={p}>
                {p}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="container footer-legal">
        <p className="footer-disclaimer">{DISCLAIMER}</p>
        <p className="footer-disclaimer">
          Sales restricted to purchasers 21+ acting on behalf of a laboratory or research
          institution. Handle all compounds with appropriate laboratory controls.
        </p>
        <p className="mono-label footer-copy">© 2026 NOCTA BIOWORKS LLC · ALL RIGHTS RESERVED</p>
      </div>
    </footer>
  )
}
