import {
  BufferAttribute,
  BufferGeometry,
  Points,
  Scene,
  ShaderMaterial,
} from 'three'

export interface MoteParticlesOptions {
  mobile?: boolean
  fieldW: number
  fieldH: number
  fogColor: [number, number, number]
  fogNear: number
  fogFar: number
}

/**
 * Slow-drifting "marine snow" particles. Soft glowing points scattered
 * through the world that fade out with the same fog the bubbles use, so
 * the entire scene feels like one volume.
 */
export class MoteParticles {
  readonly points: Points
  private readonly mat: ShaderMaterial
  private readonly positions: Float32Array
  private readonly velocities: Float32Array
  private readonly phases: Float32Array
  private readonly posAttr: BufferAttribute
  private fieldW: number
  private fieldH: number

  constructor(scene: Scene, opts: MoteParticlesOptions) {
    const count = opts.mobile ? 400 : 800
    this.fieldW = opts.fieldW
    this.fieldH = opts.fieldH

    this.positions = new Float32Array(count * 3)
    this.velocities = new Float32Array(count * 3)
    this.phases = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      this.positions[i * 3 + 0] = (Math.random() - 0.5) * opts.fieldW * 1.5
      this.positions[i * 3 + 1] = (Math.random() - 0.5) * opts.fieldH * 1.4
      this.positions[i * 3 + 2] = -460 + Math.random() * 720
      this.velocities[i * 3 + 0] = (Math.random() - 0.5) * 1.5
      this.velocities[i * 3 + 1] = 1 + Math.random() * 4
      this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 1.0
      this.phases[i] = Math.random() * Math.PI * 2
    }

    const geom = new BufferGeometry()
    this.posAttr = new BufferAttribute(this.positions, 3)
    geom.setAttribute('position', this.posAttr)
    geom.setAttribute('aPhase', new BufferAttribute(this.phases, 1))

    this.mat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFogColor: { value: opts.fogColor },
        uFogNear: { value: opts.fogNear },
        uFogFar: { value: opts.fogFar },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float aPhase;
        varying float vFogDepth;
        varying float vGlow;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.6 + aPhase) * 4.0;
          p.y += cos(uTime * 0.4 + aPhase * 1.3) * 3.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFogDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (2.4 + sin(aPhase + uTime) * 1.4) * uPixelRatio;
          vGlow = 0.5 + 0.5 * sin(uTime * 1.8 + aPhase * 3.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uFogColor;
        uniform float uFogNear;
        uniform float uFogFar;
        varying float vFogDepth;
        varying float vGlow;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = 1.0 - smoothstep(0.0, 0.5, d);
          a = pow(a, 2.0);
          float fogF = clamp((vFogDepth - uFogNear) / max(uFogFar - uFogNear, 0.0001), 0.0, 1.0);
          vec3 col = mix(vec3(0.78, 0.93, 1.0), uFogColor, fogF * 0.75);
          float alpha = a * (0.42 + vGlow * 0.4) * (1.0 - fogF * 0.6);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    })

    this.points = new Points(geom, this.mat)
    this.points.frustumCulled = false
    this.points.renderOrder = 2
    scene.add(this.points)
  }

  update(dt: number, t: number) {
    this.mat.uniforms.uTime.value = t
    const pos = this.positions
    const vel = this.velocities
    const w = this.fieldW
    const h = this.fieldH
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 0] += vel[i + 0] * dt
      pos[i + 1] += vel[i + 1] * dt
      pos[i + 2] += vel[i + 2] * dt

      if (pos[i + 1] > h * 0.8) {
        pos[i + 0] = (Math.random() - 0.5) * w * 1.5
        pos[i + 1] = -h * 0.8
        pos[i + 2] = -460 + Math.random() * 720
      }
      if (pos[i + 0] > w * 0.85) pos[i + 0] = -w * 0.85
      else if (pos[i + 0] < -w * 0.85) pos[i + 0] = w * 0.85
    }
    this.posAttr.needsUpdate = true
  }

  resize(w: number, h: number) {
    this.fieldW = w
    this.fieldH = h
  }

  dispose() {
    this.points.geometry.dispose()
    this.mat.dispose()
    this.points.removeFromParent()
  }
}
