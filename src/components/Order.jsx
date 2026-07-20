import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useCart } from '../lib/cart'
import { PEPTIDES } from '../lib/data'
import { reducedMotion } from '../lib/env'
import { useReveal } from '../lib/reveal'
import SplitHeading from './SplitHeading'
import Counter from './Counter'

gsap.registerPlugin(Flip)

/**
 * The buy box: the three focus peptides as a radio-selected trio; the ring
 * FLIPs between cards; the persistent vial hovers beside the box wearing the
 * selected peptide's powder color.
 */
export default function Order() {
  const { activeId, setActiveId, active, add } = useCart()
  const cardsRef = useRef(null)
  const buyRef = useRef(null)
  const flipState = useRef(null)

  const scope = useReveal((el) =>
    gsap.from(el.querySelectorAll('.order-card, .order-side'), {
      y: 40,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 75%', once: true },
    })
  )

  const select = (id) => {
    if (id === activeId) return
    if (!reducedMotion() && cardsRef.current) {
      flipState.current = Flip.getState(cardsRef.current.querySelectorAll('.select-ring'))
    }
    setActiveId(id)
  }

  useLayoutEffect(() => {
    if (!flipState.current) return
    Flip.from(flipState.current, { duration: 0.5, ease: 'power3.inOut' })
    flipState.current = null
  }, [activeId])

  const onGroupKeyDown = (e) => {
    const idx = PEPTIDES.findIndex((p) => p.id === activeId)
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % PEPTIDES.length
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx + PEPTIDES.length - 1) % PEPTIDES.length
    if (next < 0) return
    e.preventDefault()
    select(PEPTIDES[next].id)
    const btns = cardsRef.current?.querySelectorAll('.order-card')
    if (btns && btns[next]) btns[next].focus()
  }

  // The vial arrives beside the box — flash the shine sweep once.
  useEffect(() => {
    const onArrive = () => {
      const btn = buyRef.current
      if (!btn) return
      btn.classList.add('shine-run')
      setTimeout(() => btn.classList.remove('shine-run'), 950)
    }
    window.addEventListener('vial-arrived', onArrive)
    return () => window.removeEventListener('vial-arrived', onArrive)
  }, [])

  return (
    <section id="order" className="order" ref={scope}>
      <div className="container">
        <p className="eyebrow">ORDER — THE FOCUS THREE</p>
        <SplitHeading as="h2" className="section-title">
          Pick your <em>compound</em>.
        </SplitHeading>
        <div className="order-grid">
          <div className="order-side" aria-hidden="true">
            <p className="order-side-note mono-label">
              THE COMPOUND WEARS THE COLOR YOU PICK
            </p>
          </div>
          <div className="order-right">
            <div
              className="order-cards"
              ref={cardsRef}
              role="radiogroup"
              aria-label="Choose a peptide"
              onKeyDown={onGroupKeyDown}
            >
              {PEPTIDES.map((p) => {
                const selected = p.id === activeId
                return (
                  <button
                    key={p.id}
                    className={`order-card ${selected ? 'is-selected' : ''}`}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(p.id)}
                    style={{ '--pep': p.emit, '--pep-deep': p.emit }}
                  >
                    <span className="order-swatch" aria-hidden="true" />
                    <span className="order-tag mono-label">
                      {p.dose}
                      {p.unit} · {p.purity}% HPLC
                    </span>
                    <span className="order-name">{p.name}</span>
                    <span className="order-price">
                      <Counter value={p.price} prefix="$" />
                    </span>
                    <span className="order-note">{p.blurb}</span>
                    {selected && <span className="select-ring" data-flip-id="ring" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
            <button className="btn btn-lg btn-buy" ref={buyRef} onClick={() => add(1)}>
              Add to cart — {active.name} · ${active.price}
            </button>
            <p className="mono-label order-trust">
              COA PER LOT · COLD-CHAIN · RESHIP GUARANTEE · VISA / MC / AMEX / WIRE
            </p>
            <p className="order-ruo">
              For laboratory research use only — not for human or veterinary use. Bulk and standing
              lab orders: <a href="mailto:lab@nocta.bio">lab@nocta.bio</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
