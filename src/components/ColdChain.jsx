import gsap from 'gsap'
import { useReveal } from '../lib/reveal'

export default function ColdChain() {
  const scope = useReveal((el) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    })
    tl.from(el.querySelector('.cold-text'), {
      y: 22,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
    }).fromTo(
      el.querySelectorAll('.cold-seal [pathLength]'),
      { strokeDasharray: 1, strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.2 },
      '<'
    )
    return tl
  })
  return (
    <section className="cold" ref={scope}>
      <div className="container cold-inner">
        <svg
          className="cold-seal"
          viewBox="0 0 64 64"
          width="72"
          height="72"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="26" pathLength="1" />
          <path d="M32 14v36M18 21l28 22M46 21 18 43M24 17l8 6 8-6M24 47l8-6 8 6" pathLength="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="cold-text">
          Cold-packed, tracked, and dispatched within 24 hours. If a vial arrives broken — or your
          assay disagrees with our COA — we reship it. <em>No forms, no phone calls.</em>
        </p>
      </div>
    </section>
  )
}
