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

/** CSS-gradient vial fallback, anchored to the hero, fading as it scrolls away.
 * Rendered under the canvas at all times — the page never shows a blank hole. */
function FallbackVial({ show }) {
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
  return (
    <div ref={ref} className="vial-fallback" aria-hidden="true">
      <div className={`vf-inner ${show ? '' : 'vf-hidden'}`}>
        <div className="vf-vial">
          <div className="vf-cap" />
          <div className="vf-powder" />
        </div>
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
      <FallbackVial show={!showGL || !ready} />
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
