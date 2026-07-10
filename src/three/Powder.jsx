import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { vialStore } from './vialStore'
import { easeInOutCubic, mulberry32 } from './utils'

const TWIST = Math.PI * 7 // total helix rotation across the strand
const _c = new THREE.Color()

/**
 * The lyophilized powder as GPU-instanced grains. Two lives:
 *  - rest (swirl 0): a settled mound inside the vial;
 *  - swirl (swirl 1): grains lift into a slow double-helix cloud — a peptide
 *    chain rendered in the powder's own color. This is the screenshot moment.
 * Color tracks vialStore.color, which lerps toward the active peptide's hue on
 * selection (blue GHK-Cu / orange 5-Amino / white Retatrutide). Matrix + color
 * updates only; no per-frame allocation; deterministic seeded layout.
 */
export default function Powder({ count = 620 }) {
  const ref = useRef(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const rest = useMemo(() => new THREE.Vector3(), [])
  const heli = useMemo(() => new THREE.Vector3(), [])
  const prevColor = useRef(new THREE.Color('#000'))

  const data = useMemo(() => {
    const rnd = mulberry32(20260708)
    const rx = new Float32Array(count * 3)
    const hx = new Float32Array(count * 3)
    const depth = new Float32Array(count)
    const size = new Float32Array(count)
    const spin = new Float32Array(count)
    const bob = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // rest: mound inside the vial (denser at center/bottom)
      const a = rnd() * Math.PI * 2
      const rr = Math.pow(rnd(), 0.7) * 0.42
      rx[i * 3] = Math.cos(a) * rr
      rx[i * 3 + 1] = -0.78 + Math.pow(rnd(), 1.6) * 0.62
      rx[i * 3 + 2] = Math.sin(a) * rr
      // helix: two strands + a light scatter cloud
      const frac = i / count
      const strand = i % 2
      const cloud = i % 7 === 0
      const ang = frac * TWIST + strand * Math.PI
      const hr = cloud ? 0.5 + rnd() * 0.5 : 0.52 + (rnd() - 0.5) * 0.12
      hx[i * 3] = Math.cos(ang) * hr
      hx[i * 3 + 1] = -1.05 + frac * 2.15 + (rnd() - 0.5) * (cloud ? 0.5 : 0.08)
      hx[i * 3 + 2] = Math.sin(ang) * hr
      depth[i] = rnd()
      size[i] = 0.5 + rnd() * 0.9
      spin[i] = 0.3 + rnd() * 0.5
      bob[i] = rnd() * Math.PI * 2
    }
    return { rx, hx, depth, size, spin, bob }
  }, [count])

  const recolor = () => {
    const mesh = ref.current
    if (!mesh) return
    for (let i = 0; i < count; i++) {
      _c.copy(vialStore.color).lerp(vialStore.colorDeep, data.depth[i] * 0.85)
      mesh.setColorAt(i, _c)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    prevColor.current.copy(vialStore.color)
  }

  useLayoutEffect(() => {
    recolor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const s = vialStore
    // lerp powder color toward the active peptide, recolor while it moves
    s.color.lerp(s.targetColor, 0.08)
    s.colorDeep.lerp(s.targetDeep, 0.08)
    if (s.color.distanceToSquared(prevColor.current) > 1e-5) recolor()

    const t = state.clock.elapsedTime
    const e = easeInOutCubic(Math.min(s.swirl, 1))
    const reveal = Math.max(s.intro, 0.0001)
    const rot = t * 0.25 * e
    const cr = Math.cos(rot)
    const sr = Math.sin(rot)
    for (let i = 0; i < count; i++) {
      rest.set(data.rx[i * 3], data.rx[i * 3 + 1], data.rx[i * 3 + 2])
      // helix rotates slowly about Y while lifted
      const hxx = data.hx[i * 3]
      const hzz = data.hx[i * 3 + 2]
      heli.set(
        hxx * cr - hzz * sr,
        data.hx[i * 3 + 1] + Math.sin(t * 1.3 + data.bob[i]) * 0.05 * e,
        hxx * sr + hzz * cr
      )
      v.copy(rest).lerp(heli, e)
      const sc = data.size[i] * 0.04 * reveal * (1 + e * 0.35)
      dummy.position.copy(v)
      dummy.scale.setScalar(sc)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.62} metalness={0.05} color="#ffffff" />
    </instancedMesh>
  )
}
