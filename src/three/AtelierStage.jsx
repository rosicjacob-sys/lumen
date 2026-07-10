import { Component, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import AtelierScene from './AtelierScene'
import { useVialChoreography } from './choreography'
import { vialStore } from './vialStore'
import { FORCE_QA, FORCE_REDUCED_MOTION, MOBILE_MQ, useMediaQuery, webglSupported } from '../lib/env'

if (FORCE_QA) window.__QA__ = true

class GLErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.warn('[vial] WebGL scene failed — static fallback shown.', err)
    if (this.props.onFail) this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Static double-helix fallback (SVG), anchored to the hero, fading as it
 * scrolls away. Rendered under the canvas at all times — the page never shows
 * a blank hole. Colors ride the live --accent var. */
function FallbackHelix({ show }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const f = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.7))
      el.style.opacity = String(f)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const rungs = [14, 34, 54, 74, 94, 114, 134, 154, 174]
  const xa = (y) => 40 + Math.sin(y / 30) * 28
  const xb = (y) => 40 - Math.sin(y / 30) * 28
  return (
    <div ref={ref} className="vial-fallback" aria-hidden="true">
      <div className={`vf-inner ${show ? '' : 'vf-hidden'}`}>
        <svg className="vf-helix" viewBox="0 0 80 190" fill="none">
          {rungs.map((y) => (
            <g key={y}>
              <line x1={xa(y)} y1={y} x2={xb(y)} y2={y} stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
              <circle cx={xa(y)} cy={y} r="4.2" fill="#aeb6c0" />
              <circle cx={xb(y)} cy={y} r="4.2" fill="#8d97a3" />
              <circle cx={(xa(y) + xb(y)) / 2 - (xa(y) - xb(y)) / 4} cy={y} r="2.6" fill="var(--accent)" />
              <circle cx={(xa(y) + xb(y)) / 2 + (xa(y) - xb(y)) / 4} cy={y} r="2.6" fill="var(--accent-deep)" />
            </g>
          ))}
        </svg>
        <div className="vf-shadow" />
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
    if (el.clientWidth > 0) {
      setSized(true)
      return
    }
    let ro = null
    let timer = null
    const check = () => {
      if (el.clientWidth > 0) {
        setSized(true)
        if (ro) ro.disconnect()
        clearInterval(timer)
      }
    }
    ro = new ResizeObserver(check)
    ro.observe(el)
    timer = setInterval(check, 700)
    return () => {
      ro.disconnect()
      clearInterval(timer)
    }
  }, [])

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
              camera={{ fov: 34, position: [0, 0, 7.5] }}
              gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
              onCreated={(state) => {
                state.gl.domElement.addEventListener('webglcontextlost', (e) => {
                  e.preventDefault()
                  setFailed(true)
                })
                window.__vial = {
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
