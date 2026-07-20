import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { HelixCurve } from './HelixCurve'
import { vialStore } from './vialStore'
import { mulberry32 } from './utils'

/**
 * The self-sequencing double helix. Two solid TubeGeometry backbones (real
 * geometry, never morphs) + one InstancedMesh of base-pair rungs. A scroll-
 * driven wavefront uniform lights the strand from the top down: unwritten
 * strand is a dim cyan skeleton, written strand is bright, a subtle band rides
 * the front. Rungs ignite + pop as the wavefront crosses them. Emissive-only.
 */

const TURNS = 7
const RADIUS = 1.0
const HEIGHT = 26

const STRAND_VERT = /* glsl */ `
  varying float vT;
  varying vec3 vNormal;
  void main() {
    vT = uv.x;   // uv.x runs ALONG the tube length (uv.y is around it)
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const STRAND_FRAG = /* glsl */ `
  uniform float uProgress;
  uniform vec3 uAccent;
  uniform float uDim;
  varying float vT;
  varying vec3 vNormal;
  void main() {
    float lit = 1.0 - smoothstep(uProgress, uProgress + 0.05, vT);
    float front = exp(-pow((vT - uProgress) * 60.0, 2.0));
    float rim = pow(1.0 - abs(vNormal.z), 1.5);
    vec3 base = uAccent * 0.62;
    vec3 col = mix(base, uAccent * 1.15, lit);
    col += uAccent * rim * (0.4 + lit * 0.5);
    col += mix(uAccent, vec3(1.0), 0.35) * front * 0.5;
    gl_FragColor = vec4(col * uDim, 1.0);
  }
`

const RUNG_VERT = /* glsl */ `
  uniform float uProgress;
  attribute float aT;
  attribute float aJit;
  varying float vLit;
  varying float vJit;
  void main() {
    vJit = aJit;
    float on = step(aT, uProgress);
    float pop = exp(-pow((aT - uProgress) * 26.0, 2.0));
    vLit = on;
    float s = on * (1.0 + pop * 0.9);
    vec4 world = modelMatrix * instanceMatrix * vec4(position * vec3(1.0, s, s), 1.0);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
const RUNG_FRAG = /* glsl */ `
  uniform vec3 uAccent;
  uniform float uDim;
  varying float vLit;
  varying float vJit;
  void main() {
    if (vLit < 0.5) discard;
    vec3 col = uAccent * (0.6 + vJit * 0.35);
    gl_FragColor = vec4(col * uDim, 1.0);
  }
`

const GLOW_FRAG = /* glsl */ `
  uniform float uProgress;
  uniform vec3 uAccent;
  uniform float uDim;
  varying float vT;
  varying vec3 vNormal;
  void main() {
    float lit = 1.0 - smoothstep(uProgress, uProgress + 0.06, vT);
    float rim = pow(1.0 - abs(vNormal.z), 2.2);
    float a = rim * (0.14 + lit * 0.5) * uDim;
    gl_FragColor = vec4(uAccent * (0.7 + lit * 0.5), a);
  }
`

export default function NoctaHelix({ mobile = false }) {
  const rungRef = useRef(null)

  const curves = useMemo(
    () => [
      new HelixCurve({ turns: TURNS, radius: RADIUS, height: HEIGHT, phase: 0 }),
      new HelixCurve({ turns: TURNS, radius: RADIUS, height: HEIGHT, phase: Math.PI }),
    ],
    []
  )

  const tubes = useMemo(
    () => curves.map((c) => new THREE.TubeGeometry(c, mobile ? 460 : 1000, 0.085, mobile ? 5 : 8, false)),
    [curves, mobile]
  )
  const glowTubes = useMemo(
    () => curves.map((c) => new THREE.TubeGeometry(c, mobile ? 320 : 700, 0.26, mobile ? 5 : 7, false)),
    [curves, mobile]
  )

  const strandUniforms = useMemo(
    () => ({ uProgress: { value: 0 }, uAccent: { value: new THREE.Color('#34D9FF') }, uDim: { value: 1 } }),
    []
  )
  const rungUniforms = useMemo(
    () => ({ uProgress: { value: 0 }, uAccent: { value: new THREE.Color('#34D9FF') }, uDim: { value: 1 } }),
    []
  )

  const RUNGS = mobile ? 90 : 170
  const rungGeo = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 1, 6), [])
  const { instMatrix, aT, aJit } = useMemo(() => {
    const rnd = mulberry32(20260712)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    const arr = new Float32Array(RUNGS * 16)
    const t = new Float32Array(RUNGS)
    const jit = new Float32Array(RUNGS)
    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    for (let i = 0; i < RUNGS; i++) {
      const tt = (i + 0.5) / RUNGS
      curves[0].getPoint(tt, a)
      curves[1].getPoint(tt, b)
      const mid = a.clone().add(b).multiplyScalar(0.5)
      const dir = b.clone().sub(a)
      const len = dir.length()
      dir.normalize()
      q.setFromUnitVectors(up, dir)
      m.compose(mid, q, new THREE.Vector3(1, len, 1))
      m.toArray(arr, i * 16)
      t[i] = tt
      jit[i] = rnd()
    }
    return { instMatrix: arr, aT: t, aJit: jit }
  }, [curves, RUNGS])

  useFrame(() => {
    if (document.hidden && !window.__QA__) return
    const s = vialStore
    s.accent.lerp(s.target, 0.08)
    strandUniforms.uProgress.value = s.progress
    strandUniforms.uAccent.value.copy(s.accent)
    strandUniforms.uDim.value = s.dim
    rungUniforms.uProgress.value = s.progress
    rungUniforms.uAccent.value.copy(s.accent)
    rungUniforms.uDim.value = s.dim
  })

  return (
    <group>
      {glowTubes.map((geo, i) => (
        <mesh key={`g${i}`} geometry={geo} renderOrder={-1}>
          <shaderMaterial
            vertexShader={STRAND_VERT}
            fragmentShader={GLOW_FRAG}
            uniforms={strandUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      {tubes.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <shaderMaterial vertexShader={STRAND_VERT} fragmentShader={STRAND_FRAG} uniforms={strandUniforms} />
        </mesh>
      ))}
      <instancedMesh
        ref={rungRef}
        args={[rungGeo, undefined, RUNGS]}
        frustumCulled={false}
        onUpdate={(self) => {
          self.instanceMatrix.array.set(instMatrix)
          self.instanceMatrix.needsUpdate = true
          self.geometry.setAttribute('aT', new THREE.InstancedBufferAttribute(aT, 1))
          self.geometry.setAttribute('aJit', new THREE.InstancedBufferAttribute(aJit, 1))
        }}
      >
        <shaderMaterial vertexShader={RUNG_VERT} fragmentShader={RUNG_FRAG} uniforms={rungUniforms} />
      </instancedMesh>
    </group>
  )
}
