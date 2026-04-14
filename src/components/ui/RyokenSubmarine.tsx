'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  OrthographicCamera,
  PointLight,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * The "R" in RYOKEN morphs into a REAL 3D submarine built from Three.js
 * primitives. Because it's a true 3D object with volume, the direction
 * flip is a natural, smooth rotation.y interpolation — no flat moment.
 *
 * The Three.js canvas is rendered via createPortal into document.body so
 * its `position: fixed` containing block is the viewport. The DOM light
 * beam and bubble-trail pool are siblings of the canvas.
 */

type Keyframe = {
  scroll: number
  x: number // viewport-px offset from R center
  y: number
  rotation: number // z-axis pitch (diving angle, deg)
  rotationY: number // y-axis turn (deg, accumulates beyond 360)
  beam: number
  opacity: number
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const degToRad = (d: number) => (d * Math.PI) / 180
const BUBBLE_POOL_SIZE = 32

export default function RyokenSubmarine() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const bubblesRef = useRef<HTMLDivElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    setPortalTarget(document.body)
  }, [])

  useEffect(() => {
    if (prefersReduced || !portalTarget || !canvasContainerRef.current) return

    const canvasContainer = canvasContainerRef.current
    const beamEl = beamRef.current
    const bubbleContainer = bubblesRef.current
    const bubbleEls: HTMLDivElement[] = bubbleContainer
      ? Array.from(
          bubbleContainer.querySelectorAll<HTMLDivElement>('.sub-bubble')
        )
      : []

    // --- Three.js setup ---
    const renderer = new WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    canvasContainer.appendChild(renderer.domElement)
    renderer.domElement.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;'

    const scene = new Scene()

    // Orthographic camera: 1 world unit = 1 screen px, centered at (0,0)
    const camera = new OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      0.1,
      2000
    )
    camera.position.z = 500

    // Lighting
    scene.add(new AmbientLight(0x6ba8d9, 0.55))
    const dirLight = new DirectionalLight(0xffffff, 1.4)
    dirLight.position.set(-200, 400, 300)
    scene.add(dirLight)
    const rimLight = new DirectionalLight(0x7dd3fc, 0.6)
    rimLight.position.set(300, -200, -100)
    scene.add(rimLight)

    // --- Submarine group ---
    const subGroup = new Group()
    const subMaterials: { opacity: number; transparent: boolean }[] = []

    const addMat = <T extends MeshStandardMaterial | MeshBasicMaterial>(m: T) => {
      m.transparent = true
      m.opacity = 0
      subMaterials.push(m as unknown as { opacity: number; transparent: boolean })
      return m
    }

    // HULL BODY — yellow ellipsoid (scaled sphere)
    const hullMat = addMat(
      new MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.35,
        roughness: 0.4,
      })
    )
    const hull = new Mesh(new SphereGeometry(1, 48, 24), hullMat)
    hull.scale.set(2.1, 1, 1)
    subGroup.add(hull)

    // HULL SHINE STRIPE (thin lighter band on top)
    const stripeMat = addMat(
      new MeshStandardMaterial({
        color: 0xfef08a,
        metalness: 0.1,
        roughness: 0.3,
        emissive: 0xfde047,
        emissiveIntensity: 0.15,
      })
    )
    const stripe = new Mesh(new BoxGeometry(3.6, 0.05, 0.8), stripeMat)
    stripe.position.set(0, 0.68, 0)
    subGroup.add(stripe)

    // CONNING TOWER
    const towerMat = addMat(
      new MeshStandardMaterial({
        color: 0xeab308,
        metalness: 0.3,
        roughness: 0.45,
      })
    )
    const tower = new Mesh(new CylinderGeometry(0.28, 0.34, 0.45, 24), towerMat)
    tower.position.set(-0.1, 1.05, 0)
    subGroup.add(tower)

    // PERISCOPE
    const periscopeMat = addMat(
      new MeshStandardMaterial({ color: 0xca8a04, metalness: 0.6, roughness: 0.3 })
    )
    const periscope = new Mesh(
      new CylinderGeometry(0.04, 0.04, 0.55, 12),
      periscopeMat
    )
    periscope.position.set(-0.05, 1.5, 0)
    subGroup.add(periscope)

    // Periscope head
    const periscopeHeadMat = addMat(
      new MeshStandardMaterial({
        color: 0x14b8a6,
        emissive: 0x14b8a6,
        emissiveIntensity: 0.6,
        metalness: 0.2,
        roughness: 0.2,
      })
    )
    const periscopeHead = new Mesh(
      new SphereGeometry(0.09, 16, 12),
      periscopeHeadMat
    )
    periscopeHead.position.set(0.08, 1.8, 0)
    subGroup.add(periscopeHead)

    // TAIL CONNECTOR (red cone-ish cylinder) — on the LEFT (negative X)
    const tailMat = addMat(
      new MeshStandardMaterial({
        color: 0xef4444,
        metalness: 0.25,
        roughness: 0.5,
      })
    )
    const tail = new Mesh(
      new CylinderGeometry(0.42, 0.55, 0.55, 24),
      tailMat
    )
    tail.rotation.z = Math.PI / 2
    tail.position.set(-2.0, 0, 0)
    subGroup.add(tail)

    // PROPELLER assembly (child of subGroup so it follows the sub, but
    // we hold a separate reference to spin it independently)
    const propellerGroup = new Group()
    propellerGroup.position.set(-2.35, 0, 0)
    propellerGroup.rotation.z = Math.PI / 2
    subGroup.add(propellerGroup)

    const propHubMat = addMat(
      new MeshStandardMaterial({
        color: 0xfcd34d,
        metalness: 0.55,
        roughness: 0.3,
      })
    )
    const propHub = new Mesh(
      new CylinderGeometry(0.14, 0.14, 0.1, 16),
      propHubMat
    )
    propellerGroup.add(propHub)

    const bladeMat = addMat(
      new MeshStandardMaterial({
        color: 0xdc2626,
        metalness: 0.4,
        roughness: 0.4,
      })
    )
    for (let i = 0; i < 3; i++) {
      const blade = new Mesh(new BoxGeometry(0.08, 0.55, 0.06), bladeMat)
      blade.rotation.y = (i / 3) * Math.PI * 2
      blade.position.y = 0.0
      // Offset blade centers so they radiate from hub
      const holder = new Group()
      holder.rotation.y = (i / 3) * Math.PI * 2
      const b = new Mesh(new BoxGeometry(0.08, 0.5, 0.05), bladeMat)
      b.position.set(0, 0.3, 0)
      holder.add(b)
      propellerGroup.add(holder)
      blade.visible = false
    }

    // PORTHOLES (circles on the side, facing camera Z+)
    const portholeRingMat = addMat(
      new MeshStandardMaterial({
        color: 0xea580c,
        metalness: 0.5,
        roughness: 0.4,
      })
    )
    const portholeGlassMat = addMat(
      new MeshStandardMaterial({
        color: 0x2dd4bf,
        emissive: 0x14b8a6,
        emissiveIntensity: 0.7,
        metalness: 0.0,
        roughness: 0.1,
      })
    )

    const addPorthole = (x: number, z: number) => {
      const facing = z >= 0 ? 1 : -1
      const ring = new Mesh(new CircleGeometry(0.22, 24), portholeRingMat)
      ring.position.set(x, 0, z + 0.02 * facing)
      ring.rotation.y = facing > 0 ? 0 : Math.PI
      subGroup.add(ring)

      const glass = new Mesh(new CircleGeometry(0.16, 24), portholeGlassMat)
      glass.position.set(x, 0, z + 0.03 * facing)
      glass.rotation.y = facing > 0 ? 0 : Math.PI
      subGroup.add(glass)
    }
    addPorthole(-0.35, 1.0)
    addPorthole(0.4, 1.0)
    addPorthole(-0.35, -1.0)
    addPorthole(0.4, -1.0)

    // FRONT COCKPIT WINDOW (teal sphere on the right = front)
    const cockpitMat = addMat(
      new MeshStandardMaterial({
        color: 0x2dd4bf,
        emissive: 0x14b8a6,
        emissiveIntensity: 0.3,
        metalness: 0.2,
        roughness: 0.15,
        side: DoubleSide,
      })
    )
    const cockpit = new Mesh(new SphereGeometry(0.38, 24, 16), cockpitMat)
    cockpit.position.set(1.7, 0, 0)
    subGroup.add(cockpit)

    // HEADLIGHT (front bright emissive + PointLight)
    const headlightMat = addMat(
      new MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: 0xfef3c7,
        emissiveIntensity: 1.8,
        metalness: 0.1,
        roughness: 0.1,
      })
    )
    const headlight = new Mesh(new SphereGeometry(0.12, 16, 12), headlightMat)
    headlight.position.set(2.0, -0.1, 0)
    subGroup.add(headlight)

    const headlightPoint = new PointLight(0xfff3c4, 1.5, 8, 1.5)
    headlightPoint.position.set(2.5, 0, 0)
    subGroup.add(headlightPoint)

    scene.add(subGroup)
    subGroup.visible = false

    // --- Morph particles (R → submarine) ---
    const MORPH_COUNT = 2400
    let morphPoints: Points | null = null
    let morphMaterial: ShaderMaterial | null = null
    let morphStart = 0
    let morphEnd = 0

    const sampleRLetterPoints = async (
      rEl: HTMLElement,
      count: number,
      unitScale: number
    ): Promise<Float32Array | null> => {
      try {
        if (document.fonts && document.fonts.ready) await document.fonts.ready
      } catch {}
      const rect = rEl.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return null
      const dpr = 2
      const w = Math.ceil(rect.width * dpr)
      const h = Math.ceil(rect.height * dpr)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return null
      const cs = getComputedStyle(rEl)
      const weight = cs.fontWeight || '700'
      const size = parseFloat(cs.fontSize) || 100
      const family = cs.fontFamily || 'serif'
      const style = cs.fontStyle || 'normal'
      ctx.font = `${style} ${weight} ${size * dpr}px ${family}`
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#fff'
      const metrics = ctx.measureText('R')
      const textW = metrics.width
      const ascent = metrics.actualBoundingBoxAscent || size * dpr * 0.75
      const descent = metrics.actualBoundingBoxDescent || size * dpr * 0.2
      const drawX = (w - textW) / 2
      const drawY = (h + ascent - descent) / 2
      ctx.fillText('R', drawX, drawY)

      const data = ctx.getImageData(0, 0, w, h).data
      const pxList: number[] = []
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          if (data[(py * w + px) * 4 + 3] > 60) {
            pxList.push(px, py)
          }
        }
      }
      const total = pxList.length / 2
      if (total < 10) return null

      const result = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * total) * 2
        const px = pxList[idx]
        const py = pxList[idx + 1]
        // Pixels relative to R rect center, then flip Y (world up), then
        // convert from screen px to sub-local units (divided by unitScale).
        const sx = (px / dpr - rect.width / 2) / unitScale
        const sy = -(py / dpr - rect.height / 2) / unitScale
        const sz = ((Math.random() - 0.5) * 12) / unitScale
        result[i * 3 + 0] = sx
        result[i * 3 + 1] = sy
        result[i * 3 + 2] = sz
      }
      return result
    }

    const sampleSubmarineSurface = (
      root: Object3D,
      count: number
    ): Float32Array => {
      root.updateMatrixWorld(true)
      const rootInv = new Matrix4().copy(root.matrixWorld).invert()

      type Tri = { a: Vector3; b: Vector3; c: Vector3; area: number }
      const tris: Tri[] = []
      let totalArea = 0

      root.traverse((obj) => {
        if (!(obj instanceof Mesh)) return
        const geom = obj.geometry as BufferGeometry
        const pos = geom.attributes.position as BufferAttribute | undefined
        if (!pos) return
        const toRoot = new Matrix4()
          .copy(obj.matrixWorld)
          .premultiply(rootInv)
        const index = geom.index
        const triCount = index ? index.count / 3 : pos.count / 3
        const getV = (i: number) => {
          const v = new Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))
          return v.applyMatrix4(toRoot)
        }
        for (let t = 0; t < triCount; t++) {
          const ia = index ? index.getX(t * 3) : t * 3
          const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1
          const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2
          const a = getV(ia)
          const b = getV(ib)
          const c = getV(ic)
          const ab = new Vector3().subVectors(b, a)
          const ac = new Vector3().subVectors(c, a)
          const area = new Vector3().crossVectors(ab, ac).length() * 0.5
          if (area > 1e-8) {
            tris.push({ a, b, c, area })
            totalArea += area
          }
        }
      })

      const result = new Float32Array(count * 3)
      if (tris.length === 0 || totalArea <= 0) return result

      const cdf = new Float32Array(tris.length)
      let acc = 0
      for (let i = 0; i < tris.length; i++) {
        acc += tris[i].area / totalArea
        cdf[i] = acc
      }

      for (let i = 0; i < count; i++) {
        const r = Math.random()
        let lo = 0
        let hi = tris.length - 1
        while (lo < hi) {
          const mid = (lo + hi) >> 1
          if (cdf[mid] < r) lo = mid + 1
          else hi = mid
        }
        const tri = tris[lo]
        let u = Math.random()
        let v = Math.random()
        if (u + v > 1) {
          u = 1 - u
          v = 1 - v
        }
        const ww = 1 - u - v
        result[i * 3 + 0] = tri.a.x * ww + tri.b.x * u + tri.c.x * v
        result[i * 3 + 1] = tri.a.y * ww + tri.b.y * u + tri.c.y * v
        result[i * 3 + 2] = tri.a.z * ww + tri.b.z * u + tri.c.z * v
      }
      return result
    }

    const rebuildMorph = async () => {
      const rEl = document.getElementById('hero-r-letter')
      if (!rEl) return
      const unitScale = (subBaseW * 0.85) / 4.2
      if (unitScale <= 0) return

      const rPts = await sampleRLetterPoints(rEl, MORPH_COUNT, unitScale)
      if (!rPts) return
      const subPts = sampleSubmarineSurface(subGroup, MORPH_COUNT)

      if (!morphPoints) {
        const geom = new BufferGeometry()
        geom.setAttribute(
          'position',
          new BufferAttribute(new Float32Array(MORPH_COUNT * 3), 3)
        )
        geom.setAttribute('aStart', new BufferAttribute(rPts, 3))
        geom.setAttribute('aEnd', new BufferAttribute(subPts, 3))
        const offsets = new Float32Array(MORPH_COUNT)
        for (let i = 0; i < MORPH_COUNT; i++) offsets[i] = Math.random()
        geom.setAttribute('aOffset', new BufferAttribute(offsets, 1))

        morphMaterial = new ShaderMaterial({
          uniforms: {
            uProgress: { value: 0 },
            uSizeScale: {
              value: Math.min(window.devicePixelRatio || 1, 2) * 3.0,
            },
          },
          vertexShader: /* glsl */ `
            uniform float uProgress;
            uniform float uSizeScale;
            attribute vec3 aStart;
            attribute vec3 aEnd;
            attribute float aOffset;
            varying float vMid;
            void main() {
              float t = clamp((uProgress - aOffset * 0.22) / 0.78, 0.0, 1.0);
              float s = t * t * (3.0 - 2.0 * t);
              vec3 p = mix(aStart, aEnd, s);
              // Small arc in z so particles swoop rather than go straight
              p.z += sin(s * 3.14159) * 0.6;
              vMid = 1.0 - abs(s - 0.5) * 2.0;
              vec4 mv = modelViewMatrix * vec4(p, 1.0);
              gl_Position = projectionMatrix * mv;
              float scl = length(vec3(modelMatrix[0].x, modelMatrix[1].y, modelMatrix[2].z));
              gl_PointSize = uSizeScale * (2.8 + vMid * 2.2);
            }
          `,
          fragmentShader: /* glsl */ `
            precision highp float;
            varying float vMid;
            void main() {
              vec2 c = gl_PointCoord - 0.5;
              float d = length(c);
              if (d > 0.5) discard;
              float a = 1.0 - smoothstep(0.05, 0.5, d);
              vec3 cool = vec3(0.82, 0.93, 1.0);
              vec3 warm = vec3(1.0, 0.92, 0.55);
              vec3 col = mix(cool, warm, vMid);
              gl_FragColor = vec4(col, a * (0.55 + vMid * 0.45));
            }
          `,
          transparent: true,
          depthTest: false,
        })
        morphPoints = new Points(geom, morphMaterial)
        morphPoints.visible = false
        morphPoints.frustumCulled = false
        scene.add(morphPoints)
      } else {
        const geom = morphPoints.geometry as BufferGeometry
        geom.setAttribute('aStart', new BufferAttribute(rPts, 3))
        geom.setAttribute('aEnd', new BufferAttribute(subPts, 3))
      }
    }

    // --- R measurement & keyframes ---
    let attempts = 0
    let rafId = 0
    let trigger: ScrollTrigger | null = null
    let settleId: number | null = null
    let resizeHandler: (() => void) | null = null
    let waterFullAtScroll = Number.POSITIVE_INFINITY

    // Sub "base size" in pixels (for R center anchor + bubble rear computation)
    let subBaseW = 200
    let subBaseH = 130

    const computeSize = (r: DOMRect) => {
      const h = Math.max(r.height * 1.0, 90)
      const w = h * 1.55
      return { w, h }
    }

    const placeAt = (r: DOMRect) => {
      const { w, h } = computeSize(r)
      subBaseW = w
      subBaseH = h
      const centerX = r.left + r.width / 2
      const centerY = r.top + r.height / 2
      // Map scale so the hull (scale 2.1 × radius 1 = ~4.2 units wide) fills ~85% of w
      const unitScale = (w * 0.85) / 4.2
      subGroup.scale.setScalar(unitScale)
      return { centerX, centerY, w, h }
    }

    const docTop = (el: HTMLElement | null) => {
      if (!el) return 0
      return el.getBoundingClientRect().top + window.scrollY
    }

    let keyframes: Keyframe[] = []
    let rCenterX = window.innerWidth / 2
    let rCenterY = window.innerHeight / 2

    const getStateAt = (scroll: number): Keyframe => {
      if (keyframes.length === 0) {
        return {
          scroll,
          x: 0,
          y: 0,
          rotation: 0,
          rotationY: 0,
          beam: 0,
          opacity: 0,
        }
      }
      if (scroll <= keyframes[0].scroll) return keyframes[0]
      for (let i = 0; i < keyframes.length - 1; i++) {
        const a = keyframes[i]
        const b = keyframes[i + 1]
        if (scroll <= b.scroll) {
          const span = b.scroll - a.scroll
          const t = span > 0 ? (scroll - a.scroll) / span : 0
          return {
            scroll,
            x: lerp(a.x, b.x, t),
            y: lerp(a.y, b.y, t),
            rotation: lerp(a.rotation, b.rotation, t),
            rotationY: lerp(a.rotationY, b.rotationY, t),
            beam: lerp(a.beam, b.beam, t),
            opacity: lerp(a.opacity, b.opacity, t),
          }
        }
      }
      return keyframes[keyframes.length - 1]
    }

    const buildKeyframes = () => {
      const vh = window.innerHeight
      const vw = window.innerWidth

      const rightTargetX = vw - 150
      const leftTargetX = 150
      const rightX = rightTargetX - rCenterX
      const leftX = leftTargetX - rCenterX

      const midY = vh / 2 - rCenterY

      const heroEl = document.getElementById('hero-trigger')
      const aboutEl = document.getElementById('about')
      const projectsEl = document.getElementById('projects')
      const contactEl = document.getElementById('contact')

      const heroTop = docTop(heroEl)
      const heroH = heroEl?.offsetHeight ?? vh
      const heroBottom = heroTop + heroH

      const aboutTop = docTop(aboutEl)
      const aboutH = aboutEl?.offsetHeight ?? vh
      const aboutBottom = aboutTop + aboutH

      const projectsTop = docTop(projectsEl)
      const projectsH = projectsEl?.offsetHeight ?? vh
      const projectsBottom = projectsTop + projectsH

      const contactTop = docTop(contactEl)
      const contactH = contactEl?.offsetHeight ?? vh

      // Bubble emission only after water fully covers the screen.
      waterFullAtScroll = heroBottom - vh * 0.5 + 20

      // R → submarine morph window
      morphStart = heroTop + heroH * 0.08
      morphEnd = heroTop + heroH * 0.45

      keyframes = [
        { scroll: heroTop, x: 0, y: 0, rotation: 0, rotationY: 0, beam: 0, opacity: 0 },
        { scroll: heroTop + heroH * 0.12, x: 0, y: 5, rotation: 5, rotationY: 0, beam: 0, opacity: 1 },
        { scroll: heroTop + heroH * 0.55, x: rightX * 0.2, y: midY + 60, rotation: 12, rotationY: 20, beam: 0, opacity: 1 },
        { scroll: heroBottom, x: rightX * 0.7, y: midY + 120, rotation: 10, rotationY: 120, beam: 0, opacity: 1 },
        { scroll: aboutTop + aboutH * 0.15, x: rightX, y: midY + 60, rotation: 8, rotationY: 180, beam: 0.7, opacity: 1 },
        { scroll: aboutTop + aboutH * 0.45, x: rightX, y: midY + 110, rotation: 10, rotationY: 180, beam: 1.2, opacity: 1 },
        { scroll: aboutTop + aboutH * 0.85, x: rightX * 0.5, y: midY + 180, rotation: 14, rotationY: 200, beam: 0.7, opacity: 1 },
        { scroll: aboutBottom, x: rightX * 0.2, y: midY + 200, rotation: 12, rotationY: 260, beam: 0.2, opacity: 1 },
        { scroll: projectsTop + projectsH * 0.35, x: leftX, y: midY + 120, rotation: 8, rotationY: 360, beam: 0.7, opacity: 1 },
        { scroll: projectsTop + projectsH * 0.6, x: leftX, y: midY + 170, rotation: 10, rotationY: 360, beam: 1.2, opacity: 1 },
        { scroll: projectsTop + projectsH * 0.85, x: leftX, y: midY + 240, rotation: 14, rotationY: 360, beam: 0.7, opacity: 1 },
        { scroll: projectsBottom, x: leftX, y: midY + 260, rotation: 12, rotationY: 420, beam: 0, opacity: 1 },
        { scroll: contactTop + contactH * 0.15, x: rightX, y: midY + 180, rotation: 8, rotationY: 540, beam: 0.7, opacity: 1 },
        { scroll: contactTop + contactH * 0.5, x: rightX, y: midY + 210, rotation: 10, rotationY: 540, beam: 1.2, opacity: 1 },
        { scroll: contactTop + contactH * 0.85, x: rightX, y: midY + 240, rotation: 14, rotationY: 540, beam: 0.7, opacity: 1 },
      ]
    }

    // --- Bubble trail (DOM) ---
    let bubbleIndex = 0
    let lastBubbleTime = 0
    let lastBubbleScroll = -Infinity
    let lastScrollForDelta = window.scrollY

    const emitBubble = (facingLeft: boolean) => {
      if (!bubbleEls.length) return
      const bubble = bubbleEls[bubbleIndex % bubbleEls.length]
      bubbleIndex++

      // Sub center on screen = (vw/2 + stateX, vh/2 - (-stateY) ) = (vw/2 + x, vh/2 + y) since y is screen-down
      // We track from last applyState via subScreenX/Y refs below.
      const cx = lastScreenX
      const cy = lastScreenY
      const rearOffset = subBaseW * 0.42
      const rearX = facingLeft ? cx + rearOffset : cx - rearOffset
      const rearY = cy + (Math.random() - 0.5) * 10
      const size = 5 + Math.random() * 7

      gsap.killTweensOf(bubble)
      gsap.set(bubble, {
        left: rearX,
        top: rearY,
        width: size,
        height: size,
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        opacity: 0.75,
        x: 0,
        y: 0,
      })
      gsap.to(bubble, {
        x: (facingLeft ? 50 : -50) + (Math.random() - 0.5) * 20,
        y: -50 - Math.random() * 30,
        scale: 0.4,
        opacity: 0,
        duration: 1.3 + Math.random() * 0.4,
        ease: 'power1.out',
      })
    }

    // Track last computed screen position for bubble emission + beam placement
    let lastScreenX = rCenterX
    let lastScreenY = rCenterY


    const applyState = (scroll: number) => {
      const state = getStateAt(scroll)
      const tNow = performance.now() * 0.001
      const wiggleY = Math.sin(tNow * 1.2) * 3
      const wiggleR = Math.sin(tNow * 1.6) * 1.5

      // Screen (px) position
      const screenX = rCenterX + state.x
      const screenY = rCenterY + state.y + wiggleY
      lastScreenX = screenX
      lastScreenY = screenY

      // Map screen px to 3D world (camera is orthographic pixel-space, Y up)
      const worldX = screenX - window.innerWidth / 2
      const worldY = -(screenY - window.innerHeight / 2)

      subGroup.position.set(worldX, worldY, 0)
      subGroup.rotation.z = degToRad(state.rotation + wiggleR)
      subGroup.rotation.y = degToRad(state.rotationY)
      const subScale = (subBaseW * 0.85) / 4.2

      // Morph progress: 0 = full R, 1 = full submarine
      const morphSpan = morphEnd - morphStart
      const morphProgress =
        morphSpan > 0
          ? Math.max(0, Math.min(1, (scroll - morphStart) / morphSpan))
          : scroll >= morphEnd
            ? 1
            : 0
      // Submarine mesh only fades in at the tail end of the morph
      const subReveal =
        morphProgress < 0.9
          ? 0
          : Math.min(1, (morphProgress - 0.9) / 0.1)
      const effectiveOpacity = state.opacity * subReveal

      const opacityScale = 0.85 + effectiveOpacity * 0.15
      subGroup.scale.setScalar(subScale * opacityScale)

      // Visibility + material opacity (all materials share this opacity)
      subGroup.visible = effectiveOpacity > 0.005
      for (const m of subMaterials) m.opacity = effectiveOpacity

      // Spin propeller continuously when visible
      propellerGroup.rotation.x += effectiveOpacity * 0.35

      // Morph particles — mirror sub transform and update progress
      if (morphPoints && morphMaterial) {
        morphPoints.position.copy(subGroup.position)
        morphPoints.rotation.copy(subGroup.rotation)
        morphPoints.scale.copy(subGroup.scale)
        morphMaterial.uniforms.uProgress.value = morphProgress
        morphPoints.visible = morphProgress > 0.002 && morphProgress < 0.999
      }

      // Beam CSS overlay follows the sub
      if (beamEl) {
        const normY = ((state.rotationY % 360) + 360) % 360
        const visibility = Math.abs(Math.cos(degToRad(normY)))
        const facingLeft = normY > 90 && normY < 270
        const flip = facingLeft ? -1 : 1
        const intensity = state.beam * visibility
        const scaleX = 0.85 + Math.min(intensity, 1.2) * 0.6
        const scaleY = 0.9 + Math.min(intensity, 1.2) * 0.2
        // Anchor beam at the sub's headlight (front tip), not its center.
        // Slightly inside the hull so the soft glow blends with the sub.
        const frontOffset = subBaseW * 0.34
        const tiltRad = degToRad(state.rotation)
        const anchorX = screenX + Math.cos(tiltRad) * frontOffset * flip
        const anchorY = screenY + Math.sin(tiltRad) * frontOffset * flip
        beamEl.style.opacity = String(Math.min(1, intensity))
        beamEl.style.left = `${anchorX}px`
        beamEl.style.top = `${anchorY}px`
        beamEl.style.transform = `translate(0, -50%) rotate(${state.rotation * flip}deg) scaleX(${flip * scaleX}) scaleY(${scaleY})`
      }

      // Fade R letter out as the morph begins
      const rEl = document.getElementById('hero-r-letter')
      if (rEl) {
        const rFade = Math.max(0, Math.min(1, morphProgress / 0.1))
        rEl.style.opacity = String(1 - rFade)
        rEl.style.transform = `scale(${1 - rFade * 0.12})`
        rEl.style.display = 'inline-block'
        rEl.style.transformOrigin = 'center center'
      }

      // Emit bubbles only once water is fully up
      if (scroll > waterFullAtScroll && effectiveOpacity > 0.6) {
        const scrollDelta = Math.abs(scroll - lastScrollForDelta)
        lastScrollForDelta = scroll
        const enoughTime = tNow - lastBubbleTime > 0.06
        const enoughMovement = Math.abs(scroll - lastBubbleScroll) > 1.2
        if (enoughTime && (scrollDelta > 0.1 || enoughMovement)) {
          const normY = ((state.rotationY % 360) + 360) % 360
          const facingLeft = normY > 90 && normY < 270
          emitBubble(facingLeft)
          emitBubble(facingLeft)
          emitBubble(facingLeft)
          lastBubbleTime = tNow
          lastBubbleScroll = scroll
        }
      }

      renderer.render(scene, camera)
    }

    const setup = () => {
      const rEl = document.getElementById('hero-r-letter')
      if (!rEl || rEl.getBoundingClientRect().width < 5) {
        if (attempts++ < 120) {
          rafId = requestAnimationFrame(setup)
        }
        return
      }

      const rect = rEl.getBoundingClientRect()
      const placed = placeAt(rect)
      rCenterX = placed.centerX
      rCenterY = placed.centerY

      buildKeyframes()
      applyState(window.scrollY)
      void rebuildMorph()

      trigger = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          applyState(self.scroll())
        },
      })

      gsap.ticker.add(tickerTick)
      ScrollTrigger.refresh()

      settleId = window.setTimeout(() => {
        if (window.scrollY > window.innerHeight * 0.1) return
        const el = document.getElementById('hero-r-letter')
        if (!el) return
        const newRect = el.getBoundingClientRect()
        if (
          Math.abs(newRect.left - rect.left) > 1 ||
          Math.abs(newRect.top - rect.top) > 1
        ) {
          const p2 = placeAt(newRect)
          rCenterX = p2.centerX
          rCenterY = p2.centerY
          buildKeyframes()
          ScrollTrigger.refresh()
          applyState(window.scrollY)
          void rebuildMorph()
        }
      }, 500)

      resizeHandler = () => {
        renderer.setSize(window.innerWidth, window.innerHeight, false)
        camera.left = -window.innerWidth / 2
        camera.right = window.innerWidth / 2
        camera.top = window.innerHeight / 2
        camera.bottom = -window.innerHeight / 2
        camera.updateProjectionMatrix()

        const el = document.getElementById('hero-r-letter')
        if (!el) return
        const newRect = el.getBoundingClientRect()
        if (window.scrollY < window.innerHeight * 0.1) {
          const p2 = placeAt(newRect)
          rCenterX = p2.centerX
          rCenterY = p2.centerY
        }
        buildKeyframes()
        ScrollTrigger.refresh()
        applyState(window.scrollY)
        void rebuildMorph()
      }
      window.addEventListener('resize', resizeHandler)
    }

    const tickerTick = () => {
      applyState(window.scrollY)
    }

    setup()

    return () => {
      cancelAnimationFrame(rafId)
      trigger?.kill()
      gsap.ticker.remove(tickerTick)
      if (settleId !== null) window.clearTimeout(settleId)
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)

      const rEl = document.getElementById('hero-r-letter')
      if (rEl) {
        rEl.style.opacity = '1'
        rEl.style.transform = ''
      }

      // Dispose Three.js resources
      scene.traverse((obj) => {
        if ((obj as Mesh).isMesh) {
          const mesh = obj as Mesh
          mesh.geometry?.dispose()
          const mat = mesh.material
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else if (mat) (mat as MeshStandardMaterial).dispose()
        }
      })
      if (morphPoints) {
        morphPoints.geometry.dispose()
        ;(morphPoints.material as ShaderMaterial).dispose()
      }
      renderer.dispose()
      if (canvasContainer.contains(renderer.domElement)) {
        canvasContainer.removeChild(renderer.domElement)
      }
    }
  }, [prefersReduced, portalTarget])

  if (prefersReduced || !portalTarget) return null

  return createPortal(
    <>
      {/* Three.js canvas container */}
      <div
        ref={canvasContainerRef}
        className="pointer-events-none"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* DOM light beam — follows the sub's screen position */}
      <div
        ref={beamRef}
        className="sub-beam pointer-events-none"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 720,
          height: 440,
          transformOrigin: '0% 50%',
          background:
            'conic-gradient(from 60deg at 0% 50%, rgba(253,224,71,0) 0deg, rgba(254,240,138,0.35) 12deg, rgba(255,247,180,0.85) 30deg, rgba(254,240,138,0.35) 48deg, rgba(253,224,71,0) 60deg)',
          WebkitMaskImage:
            'radial-gradient(ellipse 100% 85% at 0% 50%, rgba(0,0,0,1) 8%, rgba(0,0,0,0.75) 38%, rgba(0,0,0,0.28) 70%, rgba(0,0,0,0) 95%)',
          maskImage:
            'radial-gradient(ellipse 100% 85% at 0% 50%, rgba(0,0,0,1) 8%, rgba(0,0,0,0.75) 38%, rgba(0,0,0,0.28) 70%, rgba(0,0,0,0) 95%)',
          filter: 'blur(10px)',
          mixBlendMode: 'screen',
          opacity: 0,
          zIndex: 3,
          willChange: 'opacity, transform, left, top',
        }}
        aria-hidden="true"
      />

      {/* Bubble trail pool */}
      <div
        ref={bubblesRef}
        className="pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          zIndex: 2,
        }}
        aria-hidden="true"
      >
        {Array.from({ length: BUBBLE_POOL_SIZE }).map((_, i) => (
          <div
            key={i}
            className="sub-bubble"
            style={{
              position: 'fixed',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(224,242,254,0.6) 0%, rgba(186,230,253,0.25) 35%, rgba(125,211,252,0.08) 65%, rgba(125,211,252,0) 100%)',
              filter: 'blur(2px)',
              mixBlendMode: 'screen',
              opacity: 0,
              pointerEvents: 'none',
              willChange: 'transform, opacity, filter',
            }}
          />
        ))}
      </div>
    </>,
    portalTarget
  )
}
