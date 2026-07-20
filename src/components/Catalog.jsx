import { useEffect } from 'react'
import gsap from 'gsap'
import { useReveal } from '../lib/reveal'
import { useCart } from '../lib/cart'
import { PEPTIDES, CATALOG_EXTRA } from '../lib/data'
import { setVialColor } from '../three/vialStore'
import { reducedMotion } from '../lib/env'
import SplitHeading from './SplitHeading'
import Counter from './Counter'
import Chromatogram from './Chromatogram'

/**
 * The catalog. Three focus peptides are big selectable rows whose selection
 * morphs the persistent vial's powder color (blue/orange/white) — the
 * multi-product hook. Below, the rest of the catalog as a compact grid.
 */
export default function Catalog() {
  const { active, activeId, setActiveId, add } = useCart()

  // Keep the vial's powder AND the page accent synced to the active peptide —
  // the whole monochrome UI takes the compound's color.
  useEffect(() => {
    setVialColor(active.emit, active.emit, reducedMotion())
    const root = document.documentElement.style
    // powder color drives the 3D; the UI accent stays contrast-safe
    root.setProperty('--accent', active.emit)
    root.setProperty('--accent-deep', active.emit)
  }, [active])

  const scope = useReveal((el) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 74%', once: true },
    })
    tl.from(el.querySelectorAll('.pep-row, .grid-cell'), {
      y: 34,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.07,
    }).fromTo(
      el.querySelectorAll('.chroma [pathLength]'),
      { strokeDasharray: 1, strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.15 },
      '<0.3'
    )
    return tl
  })

  const select = (id) => {
    setActiveId(id)
    if (reducedMotion()) return
  }

  return (
    <section id="catalog" className="catalog" ref={scope}>
      <div className="container">
        <p className="eyebrow">THE CATALOG — SELECT TO PREVIEW THE POWDER</p>
        <SplitHeading as="h2" className="section-title">
          Many peptides. <em>One</em> standard.
        </SplitHeading>

        <div
          className="pep-list"
          role="radiogroup"
          aria-label="Featured peptides — select to preview"
          onKeyDown={(e) => {
            const i = PEPTIDES.findIndex((p) => p.id === activeId)
            let n = -1
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % PEPTIDES.length
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i + PEPTIDES.length - 1) % PEPTIDES.length
            if (n < 0) return
            e.preventDefault()
            select(PEPTIDES[n].id)
            const rows = e.currentTarget.querySelectorAll('.pep-row')
            rows[n] && rows[n].focus()
          }}
        >
          {PEPTIDES.map((p) => {
            const on = p.id === activeId
            return (
              <div
                key={p.id}
                className={`pep-row ${on ? 'is-active' : ''}`}
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => select(p.id)}
                onMouseEnter={() => !reducedMotion() && select(p.id)}
                style={{ '--pep': p.emit, '--pep-deep': p.emit }}
              >
                <span className="pep-swatch" aria-hidden="true" />
                <div className="pep-id">
                  <h3>{p.name}</h3>
                  <span className="pep-tag mono-label">{p.tag}</span>
                </div>
                <div className="pep-dose">
                  <Counter value={p.dose} className="pep-num" />
                  <span className="pep-unit mono-label">{p.unit}</span>
                </div>
                <div className="pep-meta">
                  <span className="mono-label">{p.seq}</span>
                  <span className="pep-purity mono-label">
                    <Counter value={p.purity} suffix="%" /> HPLC
                  </span>
                  <Chromatogram purity={p.purity} seed={p.dose} w={140} h={30} />
                </div>
                <div className="pep-buy">
                  <span className="pep-price">${p.price}</span>
                  <button
                    className="pep-add"
                    onClick={(e) => {
                      e.stopPropagation()
                      select(p.id)
                      add(1)
                    }}
                    aria-label={`Add ${p.name} ${p.dose}${p.unit} to cart — $${p.price}`}
                  >
                    Add — ${p.price}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid-head">
          <p className="mono-label">MORE IN STOCK</p>
          <span className="grid-rule" aria-hidden="true" />
        </div>
        <p className="catalog-ruo mono-label">
          ALL PRODUCTS: FOR LABORATORY RESEARCH USE ONLY — NOT FOR HUMAN OR VETERINARY USE
        </p>
        <div className="cat-grid">
          {CATALOG_EXTRA.map((c) => (
            <article className="grid-cell" key={c.name}>
              <header>
                <h4>{c.name}</h4>
                <span className="mono-label">{c.tag}</span>
              </header>
              <div className="grid-foot">
                <span className="mono-label">
                  {c.dose}
                  {c.unit} · {c.purity}%
                </span>
                <button className="grid-add" onClick={() => add(1)} aria-label={`Add ${c.name} to cart — $${c.price}`}>
                  ${c.price}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
