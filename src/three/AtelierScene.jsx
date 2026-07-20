import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import NoctaHelix from './NoctaHelix'
import NoctaPowder from './NoctaPowder'
import { vialStore } from './vialStore'

const HEIGHT = 26
const HX = 2.9 // strand world-x offset -> sits screen-right, content on the left

export default function AtelierScene({ reduced, mobile }) {
  const helixRef = useRef(null)
  const scannerRef = useRef(null)
  const look = useMemo(() => new THREE.Vector3(), [])
  const ptr = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  useEffect(() => {
    if (reduced || mobile) return
    const onMove = (e) => {
      ptr.current.tx = (e.clientX / window.innerWidth) * 2 - 1
      ptr.current.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduced, mobile])

  const apply = (state, t) => {
    const s = vialStore
    const p = ptr.current
    p.x += (p.tx - p.x) * 0.05
    p.y += (p.ty - p.y) * 0.05

    if (helixRef.current) {
      helixRef.current.position.x = HX
      helixRef.current.rotation.y = t * 0.06 + s.progress * 0.5
    }
    s._worldScale = 1

    const camY = THREE.MathUtils.lerp(HEIGHT * 0.5 - 2.2, -HEIGHT * 0.5 + 2.2, s.progress)
    const cam = state.camera
    const dolly = s.camZ - s.columnReveal * 3.5 - s.scanner * 1.2
    cam.position.set(s.camX + p.x * 0.5, camY + p.y * 0.6, dolly)
    cam.rotation.z = s.camRoll + p.x * 0.015
    look.set(s.camX + p.x * 0.5, camY - s.lookLead * HEIGHT, 0)
    cam.lookAt(look)
    if (cam.isPerspectiveCamera) {
      const fov = 42 + s.scanner * 2
      if (Math.abs(cam.fov - fov) > 0.01) {
        cam.fov = fov
        cam.updateProjectionMatrix()
      }
    }

    if (scannerRef.current) {
      const on = s.scanner
      scannerRef.current.visible = on > 0.001
      scannerRef.current.position.set(HX, THREE.MathUtils.lerp(HEIGHT * 0.5, -HEIGHT * 0.5, on), 0)
      scannerRef.current.material.opacity = Math.sin(on * Math.PI) * 0.8
      scannerRef.current.material.color.copy(s.accent)
    }
  }

  useFrame((state) => {
    if (document.hidden && !window.__QA__) return
    apply(state, reduced ? 0 : state.clock.elapsedTime)
  })

  const three = useThree()
  useEffect(() => {
    if (!reduced) return
    apply(three, 0)
    three.invalidate()
  })
  useEffect(() => {
    if (!reduced) return
    const onSnap = () => { apply(three, 0); three.invalidate() }
    window.addEventListener('vial-color-snap', onSnap)
    return () => window.removeEventListener('vial-color-snap', onSnap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return (
    <>
      <group ref={helixRef}>
        <NoctaHelix mobile={mobile} />
        <NoctaPowder mobile={mobile} count={mobile ? 900 : 2000} />
      </group>
      <mesh ref={scannerRef} visible={false} position={[HX, 0, 0]}>
        <planeGeometry args={[4.6, 0.12]} />
        <meshBasicMaterial transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}
