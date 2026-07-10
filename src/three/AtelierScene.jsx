import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import Vial from './Vial'
import Powder from './Powder'
import { vialStore } from './vialStore'
import { coarsePointer } from '../lib/env'
import { radialTexture } from './textures'

const SPIN = (Math.PI * 2) / 16 // slow idle rotation
const _eul = new THREE.Euler()

export default function AtelierScene({ reduced, mobile }) {
  const posRef = useRef(null)
  const spinRef = useRef(null)
  const keyRef = useRef(null)
  const rimRef = useRef(null)
  const fillRef = useRef(null)
  const glowRef = useRef(null)
  const shadowRef = useRef(null)
  const ptr = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  const shadowTex = useMemo(() => radialTexture('20,23,26', 0.5), [])
  const glowTex = useMemo(() => radialTexture('120,140,170', 0.5), [])

  useEffect(() => {
    if (reduced || coarsePointer()) return
    const onMove = (e) => {
      ptr.current.tx = (e.clientX / window.innerWidth) * 2 - 1
      ptr.current.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduced])

  const apply = (state, t) => {
    if (!posRef.current || !spinRef.current) return
    const s = vialStore
    const vw = state.viewport.width
    const vh = state.viewport.height
    const p = ptr.current
    p.x += (p.tx - p.x) * 0.06
    p.y += (p.ty - p.y) * 0.06
    const sc = Math.max(vh * 0.2 * s.scale * s.intro, 0.0001)
    const floatY = reduced ? 0 : Math.sin(t * 0.7) * 0.04 * Math.min(sc, 1.4)
    const px = s.x * vw
    const py = (s.y + s.dropY) * vh + floatY
    posRef.current.position.set(px, py, 0)
    posRef.current.scale.setScalar(sc)

    _eul.set(
      0.12 + p.y * 0.12 + s.pose * 0.5,
      t * SPIN + p.x * 0.14 + s.pose * 0.9,
      0
    )
    spinRef.current.rotation.copy(_eul)

    // grey lab lighting; a spotlight punches up in the verification scene
    if (keyRef.current) keyRef.current.intensity = 2.1 + s.spotlight * 1.4
    if (fillRef.current) fillRef.current.intensity = 0.6 - s.spotlight * 0.35
    if (rimRef.current) {
      rimRef.current.intensity = 0.8 + s.spotlight * 2.4
      rimRef.current.color.copy(s.color)
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = (0.12 + s.swirl * 0.22 + s.spotlight * 0.2)
      glowRef.current.material.color.copy(s.color)
      glowRef.current.scale.set(sc * 5, sc * 5, 1)
      glowRef.current.position.set(px, py, -1.5)
    }
    if (shadowRef.current) {
      shadowRef.current.material.opacity = 0.22 * (1 - s.spotlight * 0.5) * s.intro * (1 - s.swirl * 0.6)
      shadowRef.current.scale.set(sc * 1.7, sc * 0.5, 1)
      shadowRef.current.position.set(px, py - sc * 1.15, -0.4)
    }
  }

  useFrame((state) => {
    if (document.hidden && !window.__QA__) return
    apply(state, reduced ? 0.85 : state.clock.elapsedTime)
  })

  const three = useThree()
  useEffect(() => {
    if (!reduced) return
    apply(three, 0.85)
    three.invalidate()
  })

  return (
    <>
      <ambientLight ref={fillRef} intensity={0.6} color="#e8ecf2" />
      <directionalLight ref={keyRef} position={[3, 4.5, 4]} intensity={2.1} color="#ffffff" />
      <directionalLight position={[-4, 1, 3]} intensity={0.5} color="#d8e2f0" />
      <directionalLight ref={rimRef} position={[-2, 1.5, -4]} intensity={0.8} color="#1F6FEB" />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={1.2} position={[0, 3, 4]} scale={[7, 3, 1]} color="#ffffff" />
        <Lightformer intensity={0.7} position={[-4, 0, 2]} rotation-y={Math.PI / 3} scale={[3, 5, 1]} color="#eef2f8" />
        <Lightformer intensity={0.5} position={[4, -1, -2]} rotation-y={-Math.PI / 3} scale={[3, 4, 1]} color="#c9d4e2" />
      </Environment>
      <sprite ref={glowRef} renderOrder={-2}>
        <spriteMaterial map={glowTex} transparent opacity={0} depthWrite={false} />
      </sprite>
      <sprite ref={shadowRef} renderOrder={-1}>
        <spriteMaterial map={shadowTex} transparent opacity={0} depthWrite={false} />
      </sprite>
      <group ref={posRef}>
        <group ref={spinRef}>
          <Vial />
          {!mobile && <Powder count={620} />}
          {mobile && <Powder count={150} />}
        </group>
      </group>
    </>
  )
}
