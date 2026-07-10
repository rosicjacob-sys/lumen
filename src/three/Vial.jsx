import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { vialStore } from './vialStore'

/**
 * Amber borosilicate research vial: alpha-glass body (NOT transmission —
 * transmission samples the scene backdrop, and over a transparent canvas that
 * is empty, rendering dirty-dark; opacity + clearcoat photographs correctly),
 * crimped alu cap, rubber septum. depthWrite off so the powder inside stays
 * visible through the glass. Glass clears further as the powder lifts.
 */
export default function Vial() {
  const capRef = useRef(null)

  const geo = useMemo(
    () => ({
      body: new THREE.CylinderGeometry(0.5, 0.5, 1.6, 48, 1, true),
      base: new THREE.SphereGeometry(0.5, 48, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      neck: new THREE.CylinderGeometry(0.34, 0.5, 0.28, 48, 1, true),
      lip: new THREE.CylinderGeometry(0.37, 0.34, 0.12, 48),
      cap: new THREE.CylinderGeometry(0.38, 0.38, 0.22, 48),
      capTop: new THREE.CircleGeometry(0.38, 48),
      septum: new THREE.CylinderGeometry(0.3, 0.3, 0.06, 32),
    }),
    []
  )
  const mats = useMemo(() => {
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#c99a3f',
      roughness: 0.06,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    return {
      glass,
      cap: new THREE.MeshStandardMaterial({ color: '#dfe3e9', roughness: 0.34, metalness: 0.8 }),
      septum: new THREE.MeshStandardMaterial({ color: '#1a1c20', roughness: 0.7 }),
    }
  }, [])

  useFrame(() => {
    const s = vialStore
    // Glass clears as powder lifts, so the swirl cloud is legible.
    mats.glass.opacity = 0.34 - s.swirl * 0.16
    // The vial uncaps: crimp cap + septum float up and tilt as powder rises.
    if (capRef.current) {
      const e = s.swirl
      capRef.current.position.y = e * 1.9
      capRef.current.position.x = e * 0.55
      capRef.current.rotation.z = -e * 0.5
    }
  })

  return (
    <group>
      <mesh geometry={geo.body} material={mats.glass} renderOrder={3} />
      <mesh geometry={geo.base} material={mats.glass} position={[0, -0.8, 0]} scale={[1, 0.35, 1]} renderOrder={3} />
      <mesh geometry={geo.neck} material={mats.glass} position={[0, 0.94, 0]} renderOrder={3} />
      <mesh geometry={geo.lip} material={mats.glass} position={[0, 1.12, 0]} renderOrder={3} />
      <group ref={capRef}>
        <mesh geometry={geo.septum} material={mats.septum} position={[0, 1.16, 0]} />
        <mesh geometry={geo.cap} material={mats.cap} position={[0, 1.24, 0]} />
        <mesh geometry={geo.capTop} material={mats.cap} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.351, 0]} />
      </group>
    </group>
  )
}
