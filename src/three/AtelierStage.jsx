import { Component, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import AtelierScene from './AtelierScene'
import { useVialChoreography } from './choreography'
import { vialStore } from './vialStore'
import { FORCE_QA, FORCE_REDUCED_MOTION, MOBILE_MQ, useMediaQuery, webglSupported } from '../lib/env'

if (FORCE_QA) window.__QA__ = true

class GLErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) {
    console.warn('[nocta] WebGL scene failed — static fallback shown.', err)
    if (this.props.onFail) this.props.onFail()
  }
  render() { return this.state.failed ? null : this.props.children }
}

/** Never-blank fallback: a static vertical SVG double helix with a CSS
 * wavefront sheen, in the live accent. Rendered under the canvas at all times. */
function FallbackHelix({ show }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const f = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.8))
      el.style.opacity = String(0.35 + f * 0.65)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const rows = Array.from({ length: 16 }, (_, i) => 8 + i * 11)
  const xa = (y) => 40 + Math.sin(y / 22) * 26
  const xb = (y) => 40 - Math.sin(y / 22) * 26
  return (
    <div ref={ref} className="vial-fallback" aria-hidden="true">
      <div className={`vf-inner ${show ? '' : 'vf-hidden'}`}>
        <svg className="vf-helix" viewBox="0 0 80 190" fill="none" preserveAspectRatio="xMidYMid slice">
          {rows.map((y) => (
            <g key={y}>
              <line x1={xa(y)} y1={y} x2={xb(y)} y2={y} stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
              <circle cx={xa(y)} cy={y} r="2.4" fill="var(--accent)" />
              <circle cx={xb(y)} cy={y} r="2.4" fill="var(--accent)" />
            </g>
          ))}
        </svg>
        <div className="vf-sheen" />
      </div>
    </div>
  )
}

export default function AtelierStage() {
  const [glOk] = useState(() => webglSupported())
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [sized, setSized] = useState(false)
  const stageRef = useRef(null)
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)', FORCE_REDUCED_MOTION)
  const mobile = useMediaQuery(MOBILE_MQ)

  useVialChoreography()

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    if (el.clientWidth > 0) { setSized(true); return }
    let ro = null, timer = null
    const check = () => {
      if (el.clientWidth > 0) { setSized(true); if (ro) ro.disconnect(); clearInterval(timer) }
    }
    ro = new ResizeObserver(check); ro.observe(el)
    timer = setInterval(check, 700)
    return () => { ro.disconnect(); clearInterval(timer) }
  }, [])

  // R3F initializes only after react-use-measure reports a non-zero size,
  // which it does on window 'resize'. In a backgrounded tab the ResizeObserver
  // is frozen, so nudge it with a few wall-clock resize dispatches — harmless
  // in a live tab (already sized), essential for hidden-tab QA + edge cases.
  useEffect(() => {
    if (!sized) return
    const t = [80, 300, 900].map((ms) =>
      setTimeout(() => window.dispatchEvent(new Event('resize')), ms)
    )
    return () => t.forEach(clearTimeout)
  }, [sized])

  const showGL = glOk && !failed
  return (
    <>
      <FallbackHelix show={!showGL || !ready} />
      <div ref={stageRef} className="vial-stage" aria-hidden="true">
        {showGL && sized && (
          <GLErrorBoundary onFail={() => setFailed(true)}>
            <Canvas
              dpr={mobile ? [1, 1.5] : [1, 2]}
              frameloop={reduced ? 'demand' : 'always'}
              camera={{ fov: 42, position: [0.3, 11, 8.2], near: 0.1, far: 80 }}
              gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
              onCreated={(state) => {
                state.gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setFailed(true) })
                window.__nocta = {
                  set: (vals) => Object.assign(vialStore, vals),
                  advance: () => state.advance(performance.now() / 1000),
                }
                requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
              }}
            >
              <AtelierScene reduced={reduced} mobile={mobile} />
            </Canvas>
          </GLErrorBoundary>
        )}
      </div>
    </>
  )
}
