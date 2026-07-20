import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { HelixCurve } from './HelixCurve'
import { vialStore } from './vialStore'
import { mulberry32 } from './utils'

/**
 * Absorbed-powder motes. Additive GPU point-sprites: each mote drifts from a
 * random point in the void toward a target on the helix curve, shrinks + fades
 * as it arrives (absorption), then respawns. Brightness is gated by proximity
 * to the wavefront (uProgress) so powder visibly converges wherever the strand
 * is being written. Calms to a faint ambient drift as uCalm rises.
 */

const TURNS = 7
const RADIUS = 1.0
const HEIGHT = 26

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uCalm;
  uniform float uDim;
  uniform float uPR;
  uniform float uScale;
  attribute vec3 aStart;
  attribute vec3 aTarget;
  attribute float aT;      // helix param of the target (for wavefront gating)
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aSize;
  varying float vAlpha;
  void main() {
    float cyc = fract(uTime * aSpeed * (1.0 - uCalm * 0.7) + aPhase);
    float e = cyc * cyc * (3.0 - 2.0 * cyc);        // smoothstep ease-in
    vec3 pos = mix(aStart, aTarget, e);
    // gentle swirl while traveling
    float sw = (1.0 - e) * 0.5;
    pos.x += sin(uTime * 0.6 + aPhase * 9.0) * sw;
    pos.z += cos(uTime * 0.6 + aPhase * 9.0) * sw;

    // fade: rise in, then extinguish on arrival (absorption)
    float life = smoothstep(0.0, 0.15, cyc) * (1.0 - smoothstep(0.78, 1.0, cyc));
    // converge on the wavefront: motes near the lit front glow brightest
    float gate = 0.4 + 0.6 * exp(-pow((aT - uProgress) * 4.0, 2.0));
    vAlpha = life * (0.25 + e * 0.55) * gate * 0.13 * (1.0 - uCalm * 0.5) * uDim;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float shrink = 1.0 - e * 0.7;                   // smaller as it's absorbed
    gl_PointSize = aSize * uScale * uPR * shrink * (62.0 / -mv.z);
  }
`
const FRAG = /* glsl */ `
  uniform vec3 uAccent;
  varying float vAlpha;
  void main() {
    vec2 n = gl_PointCoord * 2.0 - 1.0;
    float r = dot(n, n);
    if (r > 1.0) discard;
    float soft = exp(-r * 5.5);                     // tight discrete motes
    gl_FragColor = vec4(uAccent * soft * 0.6, soft * vAlpha);
  }
`

export default function NoctaPowder({ count = 6000, mobile = false }) {
  const matRef = useRef(null)
  const n = mobile ? Math.min(count, 1500) : count

  const geometry = useMemo(() => {
    const rnd = mulberry32(20260713)
    const curve = new HelixCurve({ turns: TURNS, radius: RADIUS, height: HEIGHT })
    const start = new Float32Array(n * 3)
    const target = new Float32Array(n * 3)
    const aT = new Float32Array(n)
    const speed = new Float32Array(n)
    const phase = new Float32Array(n)
    const size = new Float32Array(n)
    const pt = new THREE.Vector3()
    for (let i = 0; i < n; i++) {
      const t = rnd()
      curve.getPoint(t, pt)
      // target near the strand (slight radial offset so they sit on the tube)
      target[i * 3] = pt.x
      target[i * 3 + 1] = pt.y
      target[i * 3 + 2] = pt.z
      aT[i] = t
      // start: a point out in the void around that height
      const a = rnd() * Math.PI * 2
      const rr = 1.4 + rnd() * 2.4
      start[i * 3] = Math.cos(a) * rr
      start[i * 3 + 1] = pt.y + (rnd() - 0.5) * 3.0
      start[i * 3 + 2] = Math.sin(a) * rr
      speed[i] = 0.05 + rnd() * 0.12
      phase[i] = rnd()
      size[i] = 0.9 + rnd() * 1.6
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(start.slice(), 3))
    g.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
    g.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
    g.setAttribute('aT', new THREE.BufferAttribute(aT, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), HEIGHT)
    return g
  }, [n])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uCalm: { value: 0 },
      uDim: { value: 1 },
      uPR: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uScale: { value: 1 },
      uAccent: { value: new THREE.Color('#34D9FF') },
    }),
    []
  )

  useFrame((state) => {
    if (document.hidden && !window.__QA__) return
    const s = vialStore
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uProgress.value = s.progress
    uniforms.uCalm.value = s.powderCalm
    uniforms.uDim.value = s.dim
    uniforms.uAccent.value.copy(s.accent)
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
