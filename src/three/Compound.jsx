import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { vialStore } from './vialStore'
import { mulberry32 } from './utils'

const _c = new THREE.Color()
const SILVER = new THREE.Color('#c3cad3')
const SILVER_DEEP = new THREE.Color('#707a87')
const WHITE = new THREE.Color('#ffffff')

// Particle tiers: DNA backbone (large, silver), base-pair rungs (medium,
// accent-colored), ambient dust (small, pale accent).
const TIER = { BACKBONE: 0, RUNG: 1, DUST: 2 }

/**
 * The compound — a single instanced particle system that IS the page's
 * protagonist. Four shape targets, weight-blended and scrubbed by scroll:
 *   CLOUD  suspended powder drifting in studio light (hero / rails / final)
 *   MOUND  settled lyophilized pile (catalog)
 *   HELIX  double helix with base-pair rungs that click in (process/verify)
 *   TORUS  compact spinning dose ring (buy box)
 * Deterministic layout, matrix+color updates only, no per-frame allocation.
 */
export default function Compound({
  counts = { backbone: 220, rungs: 24, perRung: 9, dust: 460 },
  reduced = false,
}) {
  const ref = useRef(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const prevColor = useRef(new THREE.Color('#000'))

  const data = useMemo(() => {
    const rnd = mulberry32(20260710)
    const nBackbone = counts.backbone
    const nRung = counts.rungs * counts.perRung
    const nDust = counts.dust
    const count = nBackbone + nRung + nDust

    const tier = new Uint8Array(count)
    const size = new Float32Array(count)
    const phase = new Float32Array(count)
    const drift = new Float32Array(count * 3)
    const rungIndex = new Float32Array(count) // 0..1 along helix, rungs only
    const rungSide = new Float32Array(count) // -1..1 across the rung
    const cloud = new Float32Array(count * 3)
    const mound = new Float32Array(count * 3)
    const helix = new Float32Array(count * 3)
    const torus = new Float32Array(count * 3)

    const H = 3.0 // helix height
    const TURNS = 2.6
    const R = 0.55 // backbone radius
    const ang = (t) => Math.PI * 2 * TURNS * t

    let i = 0
    // --- backbone: two strands ---
    for (let s = 0; s < 2; s++) {
      const perStrand = nBackbone / 2
      for (let k = 0; k < perStrand; k++, i++) {
        const t = k / (perStrand - 1)
        const a = ang(t) + s * Math.PI
        tier[i] = TIER.BACKBONE
        size[i] = 1.5 + rnd() * 0.5
        helix[i * 3] = Math.cos(a) * R
        helix[i * 3 + 1] = -H / 2 + t * H
        helix[i * 3 + 2] = Math.sin(a) * R
        rungIndex[i] = t
      }
    }
    // --- rungs: straight base-pair lines between the strands ---
    for (let r = 0; r < counts.rungs; r++) {
      const t = (r + 0.5) / counts.rungs
      const a = ang(t)
      const y = -H / 2 + t * H
      for (let j = 0; j < counts.perRung; j++, i++) {
        const f = (j / (counts.perRung - 1)) * 2 - 1 // -1..1 across
        tier[i] = TIER.RUNG
        size[i] = 0.95 + rnd() * 0.25
        rungIndex[i] = t
        rungSide[i] = f
        helix[i * 3] = Math.cos(a) * R * f
        helix[i * 3 + 1] = y
        helix[i * 3 + 2] = Math.sin(a) * R * f
      }
    }
    // --- dust: loose spiral atmosphere around the helix ---
    for (let d = 0; d < nDust; d++, i++) {
      const t = rnd()
      const a = ang(t) + (rnd() - 0.5) * 2.2
      const rr = 0.85 + rnd() * 0.6
      tier[i] = TIER.DUST
      size[i] = 0.35 + rnd() * 0.5
      rungIndex[i] = t
      helix[i * 3] = Math.cos(a) * rr
      helix[i * 3 + 1] = -H / 2 + t * H + (rnd() - 0.5) * 0.3
      helix[i * 3 + 2] = Math.sin(a) * rr
    }

    // --- cloud / mound / torus targets + per-particle drift for every one ---
    for (let k = 0; k < count; k++) {
      // cloud: soft ellipsoid (gaussian-ish via sum of two randoms)
      const g = () => (rnd() + rnd() - 1) * 1.35
      cloud[k * 3] = g() * 1.5
      cloud[k * 3 + 1] = g() * 1.05
      cloud[k * 3 + 2] = g() * 1.1
      // mound: settled cone pile
      const th = rnd() * Math.PI * 2
      const rr2 = Math.sqrt(rnd()) * 1.05
      mound[k * 3] = Math.cos(th) * rr2
      mound[k * 3 + 1] = -1.0 + Math.pow(1 - rr2 / 1.05, 1.5) * 0.85 + rnd() * 0.06
      mound[k * 3 + 2] = Math.sin(th) * rr2
      // torus: dose ring
      const u = rnd() * Math.PI * 2
      const v = rnd() * Math.PI * 2
      const ring = 0.85 + 0.26 * Math.cos(v)
      torus[k * 3] = Math.cos(u) * ring
      torus[k * 3 + 1] = 0.26 * Math.sin(v)
      torus[k * 3 + 2] = Math.sin(u) * ring
      phase[k] = rnd() * Math.PI * 2
      drift[k * 3] = 0.5 + rnd()
      drift[k * 3 + 1] = 0.5 + rnd()
      drift[k * 3 + 2] = 0.5 + rnd()
    }

    return { count, tier, size, phase, drift, rungIndex, rungSide, cloud, mound, helix, torus }
  }, [counts])

  const recolor = () => {
    const mesh = ref.current
    if (!mesh) return
    const s = vialStore
    for (let i = 0; i < data.count; i++) {
      if (data.tier[i] === TIER.BACKBONE) {
        _c.copy(SILVER).lerp(SILVER_DEEP, (data.rungIndex[i] * 7) % 1 > 0.5 ? 0.55 : 0.1)
      } else if (data.tier[i] === TIER.RUNG) {
        // pair halves: one side accent, the other deep — reads as base pairs
        _c.copy(data.rungSide[i] < 0 ? s.color : s.colorDeep)
        _c.lerp(WHITE, 0.08)
      } else {
        _c.copy(s.color).lerp(WHITE, 0.62)
      }
      mesh.setColorAt(i, _c)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    prevColor.current.copy(s.color)
  }

  useLayoutEffect(() => {
    recolor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    if (document.hidden && !window.__QA__) return
    const s = vialStore

    // color follows the active peptide
    s.color.lerp(s.targetColor, 0.08)
    s.colorDeep.lerp(s.targetDeep, 0.08)
    const pc = prevColor.current
    const dc = (s.color.r - pc.r) ** 2 + (s.color.g - pc.g) ** 2 + (s.color.b - pc.b) ** 2
    if (dc > 1e-5) recolor()

    // normalized shape weights
    let wc = Math.max(s.wCloud, 0)
    let wm = Math.max(s.wMound, 0)
    let wh = Math.max(s.wHelix, 0)
    let wt = Math.max(s.wTorus, 0)
    const sum = wc + wm + wh + wt || 1
    wc /= sum
    wm /= sum
    wh /= sum
    wt /= sum

    // Frozen time under reduced motion: every demand frame composes the SAME
    // pose — an unfrozen clock would make the "static" shape drift per frame.
    const t = reduced ? 0.9 : state.clock.elapsedTime
    const reveal = s.rungReveal
    const spinH = t * 0.45 // helix rotation
    const chH = Math.cos(spinH)
    const shH = Math.sin(spinH)
    const spinT = t * 0.8 // torus rotation
    const chT = Math.cos(spinT)
    const shT = Math.sin(spinT)
    const { count, tier, size, phase, drift, rungIndex, rungSide, cloud, mound, helix, torus } = data

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const ph = phase[i]

      // cloud with turbulent drift
      const cx = cloud[i3] + Math.sin(t * 0.5 * drift[i3] + ph) * 0.2
      const cy = cloud[i3 + 1] + Math.sin(t * 0.4 * drift[i3 + 1] + ph * 2) * 0.16
      const cz = cloud[i3 + 2] + Math.cos(t * 0.45 * drift[i3 + 2] + ph) * 0.18

      // mound (dust shimmers faintly, grains sit still)
      const shimmer = tier[i] === TIER.DUST ? Math.sin(t * 1.2 + ph) * 0.02 : 0
      const mx = mound[i3]
      const my = mound[i3 + 1] + shimmer
      const mz = mound[i3 + 2]

      // helix rotating about Y; rungs click in via the reveal cascade
      let hx = helix[i3]
      let hy = helix[i3 + 1]
      let hz = helix[i3 + 2]
      if (tier[i] === TIER.RUNG) {
        const gate = Math.min(Math.max(reveal * 1.35 - rungIndex[i] * 0.35, 0), 1)
        // before its moment, a rung's particles hover scattered off the strand
        const scatter = 1 - gate
        hx += Math.sin(ph * 7) * 0.5 * scatter
        hy += Math.cos(ph * 5) * 0.35 * scatter
        hz += Math.cos(ph * 9) * 0.5 * scatter
      }
      const rhx = hx * chH - hz * shH
      const rhz = hx * shH + hz * chH

      // torus spinning, tilted toward the camera so the ring opening reads
      const tx0 = torus[i3] * chT - torus[i3 + 2] * shT
      const tz0 = torus[i3] * shT + torus[i3 + 2] * chT
      const ty0 = torus[i3 + 1]
      const tx = tx0
      const ty = ty0 * 0.85 - tz0 * 0.53 // ~32° tilt around X
      const tz = ty0 * 0.53 + tz0 * 0.85

      const px = cx * wc + mx * wm + rhx * wh + tx * wt
      const py = cy * wc + my * wm + hy * wh + ty * wt
      const pz = cz * wc + mz * wm + rhz * wh + tz * wt

      let sc = size[i] * 0.045 * Math.max(s.intro, 0.0001)
      if (tier[i] === TIER.RUNG && wh > 0.5) {
        const gate = Math.min(Math.max(reveal * 1.35 - rungIndex[i] * 0.35, 0), 1)
        sc *= 0.6 + 0.55 * gate // rungs brighten up as they lock
      }

      dummy.position.set(px, py, pz)
      dummy.scale.setScalar(sc)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  const total = counts.backbone + counts.rungs * counts.perRung + counts.dust
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, total]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial roughness={0.55} metalness={0.08} color="#ffffff" />
    </instancedMesh>
  )
}
