import { useRef } from 'react'
import { useMarquee } from '../lib/useMarquee'
import { MARQUEE_WORDS } from '../lib/data'

export default function Marquee() {
  const track = useRef(null)
  useMarquee(track, { speed: 84, dir: -1, velocityBoost: true })
  const run = (key) =>
    MARQUEE_WORDS.map((w, i) => (
      <span className="mk-item" key={`${key}-${i}`}>
        <span className={`mk-word ${i % 2 ? 'mk-outline' : ''}`}>{w}</span>
        <span className="mk-dot" aria-hidden="true" />
      </span>
    ))
  return (
    <div className="marquee" aria-hidden="true">
      <div className="mk-track" ref={track}>
        {run('a')}
        {run('b')}
      </div>
    </div>
  )
}
