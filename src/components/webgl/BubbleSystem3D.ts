import {
  InstancedMesh,
  Object3D,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three'

const BG_COUNT_DESKTOP = 25
const BG_COUNT_MOBILE = 14
const EMIT_POOL = 56

type BubbleState = {
  pos: Vector3
  vel: Vector3
  radius: number
  wobble: number
  life: number
  maxLife: number
  active: boolean
  isEmit: boolean
}

export interface BubbleSystem3DOptions {
  mobile?: boolean
  fieldW: number
  fieldH: number
  fogColor: [number, number, number]
  fogNear: number
  fogFar: number
}

/**
 * Unified 3D bubble system. Replaces the old screen-space BubbleField
 * (background bubbles) and the DOM-based submarine bubble pool with a
 * single InstancedMesh of low-poly transparent spheres rendered in world
 * space. Background bubbles cycle vertically across the camera view;
 * the back of the pool is reserved for emit() calls from the submarine.
 */
export class BubbleSystem3D {
  readonly mesh: InstancedMesh
  private readonly mat: ShaderMaterial
  private readonly states: BubbleState[] = []
  private readonly dummy = new Object3D()
  private readonly bgCount: number
  private emitCursor = 0
  private fieldW: number
  private fieldH: number

  constructor(scene: Scene, opts: BubbleSystem3DOptions) {
    this.fieldW = opts.fieldW
    this.fieldH = opts.fieldH
    this.bgCount = opts.mobile ? BG_COUNT_MOBILE : BG_COUNT_DESKTOP
    const total = this.bgCount + EMIT_POOL

    const geom = new SphereGeometry(1, 12, 8)

    this.mat = new ShaderMaterial({
      uniforms: {
        uFogColor: { value: opts.fogColor },
        uFogNear: { value: opts.fogNear },
        uFogFar: { value: opts.fogFar },
        uLightDir: { value: new Vector3(-0.4, 0.85, 0.5).normalize() },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        varying float vFogDepth;
        void main() {
          mat4 im = instanceMatrix;
          vec4 mvPosition = modelViewMatrix * im * vec4(position, 1.0);
          mat3 nMat = mat3(modelViewMatrix) * mat3(im);
          vNormalView = normalize(nMat * normal);
          vViewDir = normalize(-mvPosition.xyz);
          vFogDepth = -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uFogColor;
        uniform float uFogNear;
        uniform float uFogFar;
        uniform vec3 uLightDir;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        varying float vFogDepth;
        void main() {
          vec3 N = normalize(vNormalView);
          vec3 V = normalize(vViewDir);
          float ndv = max(dot(N, V), 0.0);
          float fres = pow(1.0 - ndv, 2.6);
          vec3 R = reflect(-uLightDir, N);
          float spec = pow(max(dot(R, V), 0.0), 28.0);
          vec3 base = vec3(0.70, 0.93, 1.0);
          vec3 col = base * (0.30 + fres * 0.85) + vec3(1.0) * spec * 0.95;
          float alpha = clamp(fres * 0.85 + spec * 0.95 + 0.05, 0.0, 0.92);
          float fogF = clamp((vFogDepth - uFogNear) / max(uFogFar - uFogNear, 0.0001), 0.0, 1.0);
          col = mix(col, uFogColor, fogF);
          alpha *= 1.0 - fogF * 0.85;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    })

    this.mesh = new InstancedMesh(geom, this.mat, total)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 1

    for (let i = 0; i < total; i++) {
      const isEmit = i >= this.bgCount
      const s: BubbleState = {
        pos: new Vector3(),
        vel: new Vector3(),
        radius: 0,
        wobble: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 0,
        active: !isEmit,
        isEmit,
      }
      if (!isEmit) {
        this.spawnBackground(s, true)
      } else {
        s.pos.set(0, -1e5, 0)
      }
      this.states.push(s)
    }

    this.writeAll()
    scene.add(this.mesh)
  }

  private spawnBackground(s: BubbleState, initial = false) {
    const w = this.fieldW
    const h = this.fieldH
    s.pos.set(
      (Math.random() - 0.5) * w * 1.4,
      initial
        ? (Math.random() - 0.5) * h * 1.6
        : -h * 0.7 - Math.random() * h * 0.3,
      -380 + Math.random() * 560
    )
    s.vel.set(
      (Math.random() - 0.5) * 4,
      14 + Math.random() * 38,
      (Math.random() - 0.5) * 2
    )
    s.radius = 2.5 + Math.random() * 7.5
    s.wobble = Math.random() * Math.PI * 2
    s.life = 0
    s.maxLife = 0
    s.active = true
  }

  emit(worldPos: Vector3, facingLeft: boolean) {
    const idx = this.bgCount + (this.emitCursor % EMIT_POOL)
    this.emitCursor++
    const s = this.states[idx]
    s.pos.copy(worldPos)
    s.pos.x += (Math.random() - 0.5) * 6
    s.pos.y += (Math.random() - 0.5) * 6
    s.pos.z += (Math.random() - 0.5) * 6
    const dirX = facingLeft ? 1 : -1
    s.vel.set(
      dirX * (10 + Math.random() * 22),
      28 + Math.random() * 42,
      (Math.random() - 0.5) * 6
    )
    s.radius = 3 + Math.random() * 5
    s.wobble = Math.random() * Math.PI * 2
    s.life = 0
    s.maxLife = 1.4 + Math.random() * 0.6
    s.active = true
  }

  update(dt: number, t: number) {
    const h = this.fieldH
    for (let i = 0; i < this.states.length; i++) {
      const s = this.states[i]
      if (!s.active) continue

      s.pos.x += s.vel.x * dt + Math.sin(t * 1.4 + s.wobble) * 8 * dt
      s.pos.y += s.vel.y * dt
      s.pos.z += s.vel.z * dt + Math.cos(t * 1.1 + s.wobble) * 4 * dt

      if (s.isEmit) {
        s.life += dt
        const k = s.life / s.maxLife
        if (k >= 1) {
          s.active = false
          this.dummy.position.set(0, -1e5, 0)
          this.dummy.scale.setScalar(0.0001)
          this.dummy.rotation.set(0, 0, 0)
          this.dummy.updateMatrix()
          this.mesh.setMatrixAt(i, this.dummy.matrix)
          continue
        }
        const r = s.radius * (1 - k * 0.45)
        this.dummy.position.copy(s.pos)
        this.dummy.scale.setScalar(r)
        this.dummy.rotation.set(t * 0.4 + s.wobble, t * 0.3, 0)
        this.dummy.updateMatrix()
        this.mesh.setMatrixAt(i, this.dummy.matrix)
      } else {
        if (s.pos.y > h * 0.8) {
          this.spawnBackground(s)
        }
        this.dummy.position.copy(s.pos)
        this.dummy.scale.setScalar(s.radius)
        this.dummy.rotation.set(t * 0.2, t * 0.15, 0)
        this.dummy.updateMatrix()
        this.mesh.setMatrixAt(i, this.dummy.matrix)
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true
  }

  resize(w: number, h: number) {
    this.fieldW = w
    this.fieldH = h
  }

  private writeAll() {
    for (let i = 0; i < this.states.length; i++) {
      const s = this.states[i]
      this.dummy.position.copy(s.pos)
      this.dummy.scale.setScalar(s.active ? s.radius : 0.0001)
      this.dummy.rotation.set(0, 0, 0)
      this.dummy.updateMatrix()
      this.mesh.setMatrixAt(i, this.dummy.matrix)
    }
    this.mesh.instanceMatrix.needsUpdate = true
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.mat.dispose()
    this.mesh.removeFromParent()
  }
}
