import * as THREE from 'three'

// Single mutable store for the persistent compound (powder + DNA particle
// system). GSAP + the cart write it, the R3F scene reads it every frame.
// x/y are viewport-fraction offsets from center; scale 1 = designed hero size.
// Shape is a weight vector — waypoints scrub full profiles; the frame loop
// normalizes so mid-scrub sums never distort the blend.
export const vialStore = {
  x: 0.26,
  y: 0.0,
  scale: 1,
  intro: 0, // 0 -> 1 entrance
  // shape weights (blended, normalized per frame)
  wCloud: 1,
  wMound: 0,
  wHelix: 0,
  wTorus: 0,
  rungReveal: 0, // 0 -> 1: base pairs "click in" during the pinned scene
  spotlight: 0, // 0 -> 1 dark verification lighting
  pose: 0, // mobile two-pose scrub
  dropY: 0,
  // Powder color — lerped toward the active peptide's hue on selection.
  color: new THREE.Color('#1F6FEB'),
  colorDeep: new THREE.Color('#0B3D91'),
  targetColor: new THREE.Color('#1F6FEB'),
  targetDeep: new THREE.Color('#0B3D91'),
}

export function setVialColor(hex, deepHex, snap = false) {
  vialStore.targetColor.set(hex)
  vialStore.targetDeep.set(deepHex)
  if (snap) {
    // Reduced motion renders on demand: no frames means no lerp, so snap the
    // color instantly and ask the scene for one composed frame.
    vialStore.color.set(hex)
    vialStore.colorDeep.set(deepHex)
    window.dispatchEvent(new CustomEvent('vial-color-snap'))
  }
}
