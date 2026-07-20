import * as THREE from 'three'

// A vertical double-helix backbone as a THREE.Curve, so TubeGeometry can
// extrude a solid ribbon along it. t in [0,1] maps top(+H/2) -> bottom(-H/2).
export class HelixCurve extends THREE.Curve {
  constructor({ turns = 9, radius = 1.15, height = 26, phase = 0 } = {}) {
    super()
    this.turns = turns
    this.radius = radius
    this.height = height
    this.phase = phase
  }
  getPoint(t, target = new THREE.Vector3()) {
    const a = t * this.turns * Math.PI * 2 + this.phase
    return target.set(
      Math.cos(a) * this.radius,
      this.height * (0.5 - t),
      Math.sin(a) * this.radius
    )
  }
}
