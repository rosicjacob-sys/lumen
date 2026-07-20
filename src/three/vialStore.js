import * as THREE from 'three'

// NOCTA store. GSAP ScrollTrigger scrubs `progress` (0..1 = descent down the
// strand + how much of the sequence is "written"); the scene reads it every
// frame to place the camera and drive the emissive wavefront. One accent is
// lit at a time — it lerps toward the selected peptide's EMISSION color.
export const vialStore = {
  progress: 0, // 0..1 wavefront + camera descent
  intro: 0, // 0..1 boot-up of the strand
  // camera rig (world units; strand is a tall vertical double helix at x≈2.4)
  camZ: 8.2, // dolly distance
  camX: 0.4, // lateral — pushes strand toward screen-right for content cabins
  camRoll: 0, // radians, tiny
  lookLead: 0.02, // how far ahead the camera looks down the strand
  axialView: 0, // 0 = side view, 1 = looking down the helix axis (hero)
  scanner: 0, // 0..1 verify scanner-plane sweep
  columnReveal: 0, // order: pull back to reveal the whole column
  powderCalm: 0, // 0 busy -> 1 calmed
  dim: 1, // 1 full presence (set-pieces) -> ~0.4 recessed (content sections)
  // emission color (lerped toward target on selection)
  accent: new THREE.Color('#34D9FF'),
  target: new THREE.Color('#34D9FF'),
  // internals
  _worldScale: 1,
}

export function setVialColor(hex, _deep, snap = false) {
  vialStore.target.set(hex)
  if (snap) {
    vialStore.accent.set(hex)
    window.dispatchEvent(new CustomEvent('vial-color-snap'))
  }
}
