import SplitHeading from './SplitHeading'
import Magnetic from './Magnetic'
import { useCart } from '../lib/cart'
import { scrollToEl } from '../lib/scroll'

export default function FinalCta() {
  const { active, add } = useCart()
  return (
    <section id="final-cta" className="final-cta">
      <div className="container final-inner">
        <SplitHeading as="h2" className="final-title">
          Ready when your <em>lab</em> is.
        </SplitHeading>
        <div className="final-ctas">
          <Magnetic>
            <button className="btn btn-lg" onClick={() => add(1)}>
              Add to cart — {active.name} · ${active.price}
            </button>
          </Magnetic>
          <Magnetic strength={0.22}>
            <button
              className="btn-ghost"
              onClick={() => scrollToEl('#catalog')}
            >
              Back to the catalog
            </button>
          </Magnetic>
        </div>
        <p className="mono-label final-trust">COA PER LOT · SHIPS IN 24H · RESEARCH USE ONLY</p>
      </div>
    </section>
  )
}
