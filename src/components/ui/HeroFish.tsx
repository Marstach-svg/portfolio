'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AmbientLight,
  BoxGeometry,
  CircleGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PointLight,
  Scene,
  SphereGeometry,
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
const BUBBLE_POOL_SIZE = 14

export default function HeroFish() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const bubblesRef = useRef<HTMLDivElement>(null)
  const splashRef = useRef<HTMLDivElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    setPortalTarget(document.body)
  }, [])

  useEffect(() => {
    if (prefersReduced || !portalTarget || !canvasContainerRef.current) return

    const canvasContainer = canvasContainerRef.current
    const beamEl = beamRef.current
    const splashEl = splashRef.current
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
      // Splash fires once, as the sub first dips into the rising wave.
      splashAtScroll = heroTop + heroH * 0.18

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

    // Splash (water entry burst) — one-shot
    let splashed = false
    let splashAtScroll = Number.POSITIVE_INFINITY
    const triggerSplash = (cx: number, cy: number) => {
      if (!splashEl || splashed) return
      splashed = true
      gsap.killTweensOf(splashEl)
      gsap.set(splashEl, {
        left: cx,
        top: cy,
        xPercent: -50,
        yPercent: -50,
        scale: 0.2,
        opacity: 0,
        display: 'block',
      })
      const tl = gsap.timeline({
        onComplete: () => {
          if (splashEl) splashEl.style.display = 'none'
        },
      })
      tl.to(splashEl, { opacity: 0.9, duration: 0.08, ease: 'power2.out' })
        .to(
          splashEl,
          { scale: 2.4, duration: 0.9, ease: 'power2.out' },
          0
        )
        .to(
          splashEl,
          { opacity: 0, duration: 0.55, ease: 'power1.in' },
          '>-0.5'
        )

      // Burst a few extra bubbles around the entry point
      for (let i = 0; i < 6; i++) {
        const b = bubbleEls[bubbleIndex % bubbleEls.length]
        bubbleIndex++
        if (!b) break
        const ang = Math.random() * Math.PI * 2
        const dist = 20 + Math.random() * 40
        const size = 6 + Math.random() * 8
        gsap.killTweensOf(b)
        gsap.set(b, {
          left: cx,
          top: cy,
          width: size,
          height: size,
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          opacity: 0.85,
          x: 0,
          y: 0,
        })
        gsap.to(b, {
          x: Math.cos(ang) * dist,
          y: Math.sin(ang) * dist - 30,
          scale: 0.3,
          opacity: 0,
          duration: 1.0 + Math.random() * 0.4,
          ease: 'power2.out',
        })
      }
    }

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
      const opacityScale = 0.85 + state.opacity * 0.15
      subGroup.scale.setScalar(subScale * opacityScale)

      // Visibility + material opacity (all materials share this opacity)
      subGroup.visible = state.opacity > 0.005
      for (const m of subMaterials) m.opacity = state.opacity

      // Spin propeller continuously when visible
      propellerGroup.rotation.x += state.opacity * 0.35

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
        const frontOffset = subBaseW * 0.42
        const tiltRad = degToRad(state.rotation)
        const anchorX = screenX + Math.cos(tiltRad) * frontOffset * flip
        const anchorY = screenY + Math.sin(tiltRad) * frontOffset * flip
        beamEl.style.opacity = String(Math.min(1, intensity))
        beamEl.style.left = `${anchorX}px`
        beamEl.style.top = `${anchorY}px`
        beamEl.style.transform = `translate(0, -50%) rotate(${state.rotation * flip}deg) scaleX(${flip * scaleX}) scaleY(${scaleY})`
      }

      // Fade R letter and shrink during morph
      const rEl = document.getElementById('hero-r-letter')
      if (rEl) {
        rEl.style.opacity = String(1 - state.opacity)
        rEl.style.transform = `scale(${1 - state.opacity * 0.25})`
        rEl.style.display = 'inline-block'
        rEl.style.transformOrigin = 'center center'
      }

      // One-shot splash as the sub first touches the wave
      if (!splashed && scroll >= splashAtScroll && state.opacity > 0.4) {
        triggerSplash(screenX, screenY)
      }

      // Emit bubbles only once water is fully up
      if (scroll > waterFullAtScroll && state.opacity > 0.6) {
        const scrollDelta = Math.abs(scroll - lastScrollForDelta)
        lastScrollForDelta = scroll
        const enoughTime = tNow - lastBubbleTime > 0.18
        const enoughMovement = Math.abs(scroll - lastBubbleScroll) > 4
        if (enoughTime && (scrollDelta > 0.3 || enoughMovement)) {
          const normY = ((state.rotationY % 360) + 360) % 360
          const facingLeft = normY > 90 && normY < 270
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
          width: 560,
          height: 240,
          transformOrigin: '0% 50%',
          background:
            'radial-gradient(ellipse at 0% 50%, rgba(254,240,138,0.55) 0%, rgba(253,224,71,0.28) 22%, rgba(253,224,71,0.08) 45%, rgba(253,224,71,0) 70%)',
          clipPath: 'polygon(0% 40%, 0% 60%, 100% 100%, 100% 0%)',
          mixBlendMode: 'screen',
          opacity: 0,
          zIndex: 3,
          willChange: 'opacity, transform, left, top',
        }}
        aria-hidden="true"
      />

      {/* Water-entry splash — one-shot on first dive */}
      <div
        ref={splashRef}
        className="pointer-events-none"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(186,230,253,0.55) 35%, rgba(125,211,252,0.2) 60%, rgba(125,211,252,0) 80%)',
          border: '2px solid rgba(224,242,254,0.7)',
          boxShadow: '0 0 40px rgba(186,230,253,0.6)',
          mixBlendMode: 'screen',
          opacity: 0,
          display: 'none',
          zIndex: 4,
          willChange: 'transform, opacity',
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
                'radial-gradient(circle, rgba(224,242,254,0.95) 0%, rgba(125,211,252,0.4) 60%, rgba(125,211,252,0) 100%)',
              opacity: 0,
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
    </>,
    portalTarget
  )
}
