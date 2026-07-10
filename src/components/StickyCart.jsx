import { useEffect, useState } from 'react'
import { useCart } from '../lib/cart'

/** Mobile-only sticky add-to-cart bar (visible after the hero; safe-area
 * padded; unfocusable while hidden). Shows the active peptide. */
export default function StickyCart() {
  const { active, add } = useCart()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('hero')
      const h = hero ? hero.offsetHeight : window.innerHeight
      setShow(window.scrollY > h * 0.85)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className={`sticky-cart ${show ? 'is-visible' : ''}`}>
      <div className="sticky-row">
        <div className="sticky-info">
          <span className="sticky-name">
            {active.name} · {active.dose}
            {active.unit}
          </span>
          <span className="sticky-price">${active.price}</span>
        </div>
        <button className="btn sticky-btn" onClick={() => add(1)}>
          Add to cart
        </button>
      </div>
      <p className="sticky-trust mono-label">COA PER LOT · RESEARCH USE ONLY</p>
    </div>
  )
}
