import { useRef } from 'react'
import { useMarquee } from '../lib/useMarquee'
import { reducedMotion } from '../lib/env'

const PROMISE =
  'HPLC-VERIFIED, EVERY BATCH · PUBLIC COA PER LOT · COLD-CHAIN SHIPPING · FOR RESEARCH USE ONLY · '

export default function AnnouncementBar() {
  const track = useRef(null)
  useMarquee(track, { speed: 42, dir: -1 })
  const reduced = reducedMotion()
  return (
    <div className="announce" role="note" aria-label="HPLC-verified every batch. Public COA per lot. Cold-chain shipping. For research use only.">
      {reduced ? (
        <p className="announce-static mono-label">HPLC-VERIFIED · PUBLIC COA PER LOT · FOR RESEARCH USE ONLY</p>
      ) : (
        <div className="announce-track mono-label" ref={track} aria-hidden="true">
          <span>{PROMISE.repeat(3)}</span>
          <span>{PROMISE.repeat(3)}</span>
        </div>
      )}
    </div>
  )
}
