import { useRef, useState } from 'react'
import gsap from 'gsap'
import { FAQS } from '../lib/data'
import { reducedMotion } from '../lib/env'
import SplitHeading from './SplitHeading'

function Item({ q, a, idx }) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef(null)

  const toggle = () => {
    const el = bodyRef.current
    const next = !open
    setOpen(next)
    if (!el) return
    if (reducedMotion()) {
      el.style.height = next ? 'auto' : '0px'
      return
    }
    if (next) {
      gsap.set(el, { height: 'auto' })
      gsap.from(el, { height: 0, duration: 0.55, ease: 'power3.inOut', overwrite: true })
    } else {
      gsap.to(el, { height: 0, duration: 0.45, ease: 'power3.inOut', overwrite: true })
    }
  }

  return (
    <div className={`faq-item ${open ? 'is-open' : ''}`}>
      <button className="faq-q" aria-expanded={open} aria-controls={`faq-a-${idx}`} id={`faq-q-${idx}`} onClick={toggle}>
        <span>{q}</span>
        <span className="faq-icon" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>
      <div id={`faq-a-${idx}`} role="region" aria-labelledby={`faq-q-${idx}`} ref={bodyRef} className="faq-a">
        <p>{a}</p>
      </div>
    </div>
  )
}

export default function Faq() {
  return (
    <section id="faq" className="faq">
      <div className="container faq-inner">
        <div className="faq-head">
          <p className="eyebrow">BEFORE YOU ORDER</p>
          <SplitHeading as="h2" className="section-title">
            Straight <em>answers</em>.
          </SplitHeading>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <Item key={f.q} q={f.q} a={f.a} idx={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
