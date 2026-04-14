import {
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector3,
} from 'three'

type Fish = {
  schoolIdx: number
  offset: Vector3
  phase: number
  size: number
}

type School = {
  center: Vector3
  ax: Vector3
  ay: Vector3
  az: Vector3
  speed: number
}

export interface FishShadowSwarmOptions {
  mobile?: boolean
  fieldW: number
  fieldH: number
  fogColor: [number, number, number]
  fogNear: number
  fogFar: number
}

/**
 * A school of distant fish silhouettes — billboard quads with a procedural
 * fish-shaped SDF mask, drawn in a deep navy that fades into the fog. The
 * fish drift along Lissajous paths grouped into a few schools to read as
 * organic movement rather than uniform noise.
 */
export class FishShadowSwarm {
  readonly mesh: InstancedMesh
  private readonly mat: ShaderMaterial
  private readonly fish: Fish[] = []
  private readonly schools: School[] = []
  private readonly dummy = new Object3D()

  constructor(scene: Scene, opts: FishShadowSwarmOptions) {
    const count = opts.mobile ? 25 : 50
    const w = opts.fieldW
    const h = opts.fieldH

    const schoolCount = 3
    for (let i = 0; i < schoolCount; i++) {
      this.schools.push({
        center: new Vector3(
          (Math.random() - 0.5) * w * 0.7,
          (Math.random() - 0.5) * h * 0.4,
          -380 + Math.random() * 200
        ),
        ax: new Vector3(
          110 + Math.random() * 60,
          22 + Math.random() * 14,
          50 + Math.random() * 30
        ),
        ay: new Vector3(
          40 + Math.random() * 30,
          60 + Math.random() * 30,
          90 + Math.random() * 40
        ),
        az: new Vector3(
          0.7 + Math.random() * 0.5,
          0.9 + Math.random() * 0.4,
          0.5 + Math.random() * 0.4
        ),
        speed: 0.10 + Math.random() * 0.08,
      })
    }

    for (let i = 0; i < count; i++) {
      this.fish.push({
        schoolIdx: i % schoolCount,
        offset: new Vector3(
          (Math.random() - 0.5) * 90,
          (Math.random() - 0.5) * 45,
          (Math.random() - 0.5) * 70
        ),
        phase: Math.random() * Math.PI * 2,
        size: 16 + Math.random() * 14,
      })
    }

    const geom = new PlaneGeometry(1, 0.42)

    this.mat = new ShaderMaterial({
      uniforms: {
        uFogColor: { value: opts.fogColor },
        uFogNear: { value: opts.fogNear },
        uFogFar: { value: opts.fogFar },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying float vFogDepth;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          vFogDepth = -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uFogColor;
        uniform float uFogNear;
        uniform float uFogFar;
        varying vec2 vUv;
        varying float vFogDepth;
        void main() {
          // Recenter so fish body is to the right, tail to the left
          vec2 p = vUv - vec2(0.55, 0.5);

          // Body: stretched ellipse
          float bodyD = length(vec2(p.x * 1.05, p.y * 2.55));
          float body = 1.0 - smoothstep(0.18, 0.27, bodyD);

          // Tail wedge on the left
          vec2 tp = vec2(p.x + 0.34, p.y);
          float tailEdge = abs(tp.y) * 1.6 + tp.x * 0.55;
          float tail = 1.0 - smoothstep(0.05, 0.13, tailEdge);
          tail *= step(-0.45, p.x) * step(p.x, -0.22);

          float silhouette = clamp(body + tail, 0.0, 1.0);
          if (silhouette < 0.02) discard;

          float fogF = clamp((vFogDepth - uFogNear) / max(uFogFar - uFogNear, 0.0001), 0.0, 1.0);
          vec3 col = mix(vec3(0.01, 0.04, 0.09), uFogColor, fogF * 0.85);
          float alpha = silhouette * (0.55 - fogF * 0.35);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    })

    this.mesh = new InstancedMesh(geom, this.mat, count)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 0
    scene.add(this.mesh)
  }

  update(t: number) {
    for (let i = 0; i < this.fish.length; i++) {
      const f = this.fish[i]
      const sc = this.schools[f.schoolIdx]
      const a = t * sc.speed + f.phase

      const x =
        sc.center.x +
        Math.sin(a * sc.az.x) * sc.ax.x +
        Math.cos(a * 0.7) * sc.ay.x * 0.3 +
        f.offset.x
      const y =
        sc.center.y +
        Math.cos(a * sc.az.y) * sc.ax.y +
        Math.sin(a * 1.3) * sc.ay.y * 0.4 +
        f.offset.y
      const z =
        sc.center.z +
        Math.sin(a * sc.az.z) * sc.ax.z +
        Math.cos(a * 0.4) * sc.ay.z * 0.3 +
        f.offset.z

      // Heading: derivative of x to choose facing
      const dxApprox =
        Math.cos(a * sc.az.x) * sc.ax.x * sc.az.x -
        Math.sin(a * 0.7) * 0.7 * sc.ay.x * 0.3
      const wiggle = Math.sin(t * 4.5 + f.phase) * 0.18

      this.dummy.position.set(x, y, z)
      this.dummy.rotation.set(0, dxApprox >= 0 ? 0 : Math.PI, wiggle)
      this.dummy.scale.set(f.size, f.size, f.size)
      this.dummy.updateMatrix()
      this.mesh.setMatrixAt(i, this.dummy.matrix)
    }
    this.mesh.instanceMatrix.needsUpdate = true
  }

  resize(w: number, h: number) {
    for (const sc of this.schools) {
      sc.center.x = Math.max(-w * 0.5, Math.min(w * 0.5, sc.center.x))
      sc.center.y = Math.max(-h * 0.5, Math.min(h * 0.5, sc.center.y))
    }
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.mat.dispose()
    this.mesh.removeFromParent()
  }
}
