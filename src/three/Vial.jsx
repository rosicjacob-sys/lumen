import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { vialStore } from './vialStore'

/**
 * Amber borosilicate research vial: transmissive glass body, crimped alu cap,
 * rubber septum. The powder itself is the instanced Powder system (separate),
 * so the glass here is just the vessel. Glass fades slightly as the powder
 * swirls out, so the helix cloud reads clearly.
 */
export default function Vial() {
  const glassRef = useRef(null)
  const bodyMat = useRef(null)

  const geo = useMemo(
    () => ({
      body: new THREE.CylinderGeometry(0.5, 0.5, 1.6, 48, 1, false),
      neck: new THREE.CylinderGeometry(0.34, 0.5, 0.28, 48),
      lip: new THREE.CylinderGeometry(0.37, 0.34, 0.12, 48),
      cap: new THREE.CylinderGeometry(0.38, 0.38, 0.22, 48),
      septum: new THREE.CylinderGeometry(0.3, 0.3, 0.06, 32),
      base: new THREE.CircleGeometry(0.5, 48),
    }),
    []
  )
  const mats = useMemo(
    () => ({
      glass: new THREE.MeshPhysicalMaterial({
        color: '#caa14a',
        roughness: 0.08,
        metalness: 0,
        transmission: 0.92,
        thickness: 0.8,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        transparent: true,
        opacity: 1,
        attenuationColor: new THREE.Color('#8a6a1f'),
        attenuationDistance: 1.4,
      }),
      cap: new THREE.MeshStandardMaterial({ color: '#c9ccd2', roughness: 0.32, metalness: 0.9 }),
      septum: new THREE.MeshStandardMaterial({ color: '#1a1c20', roughness: 0.7 }),
    }),
    []
  )
  mats.glass && (bodyMat.current = mats.glass)

  useFrame(() => {
    const s = vialStore
    // Glass clears as powder lifts, so the swirl cloud is legible.
    mats.glass.opacity = 1 - s.swirl * 0.55
    mats.glass.transmission = 0.92 + s.swirl * 0.06
  })

  return (
    <group ref={glassRef}>
      <mesh geometry={geo.body} material={mats.glass} />
      <mesh geometry={geo.base} material={mats.glass} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} />
      <mesh geometry={geo.neck} material={mats.glass} position={[0, 0.94, 0]} />
      <mesh geometry={geo.lip} material={mats.glass} position={[0, 1.12, 0]} />
      <mesh geometry={geo.septum} material={mats.septum} position={[0, 1.16, 0]} />
      <mesh geometry={geo.cap} material={mats.cap} position={[0, 1.24, 0]} />
    </group>
  )
}
