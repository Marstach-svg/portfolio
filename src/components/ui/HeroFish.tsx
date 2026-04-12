'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * The "R" in RYOKEN morphs into a small submarine that dives and
 * then travels side-to-side as the user scrolls. Uses rotationY (3D
 * Y-axis flip) instead of z-rotation for direction changes so the
 * submarine never goes upside-down.
 *
 * Emits small bubbles from the rear as it moves.
 *
 * Rendered via createPortal into document.body so no transformed
 * ancestor can break its `position: fixed` containing block.
 */

type Keyframe = {
  scroll: number
  x: number
  y: number
  rotation: number // z-axis pitch (for diving angle)
  rotationY: number // y-axis flip (for left/right direction)
  opacity: number
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const BUBBLE_POOL_SIZE = 14

export default function HeroFish() {
  const subRef = useRef<HTMLDivElement>(null)
  const bubblesRef = useRef<HTMLDivElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    setPortalTarget(document.body)
  }, [])

  useEffect(() => {
    if (prefersReduced || !portalTarget || !subRef.current) return

    const sub = subRef.current
    const bubbleContainer = bubblesRef.current
    let bubbleEls: HTMLDivElement[] = []
    if (bubbleContainer) {
      bubbleEls = Array.from(
        bubbleContainer.querySelectorAll<HTMLDivElement>('.sub-bubble')
      )
    }

    let attempts = 0
    let rafId = 0
    let trigger: ScrollTrigger | null = null
    let settleId: number | null = null
    let resizeHandler: (() => void) | null = null

    // Size the sub from the R letter height (aspect ~1.55:1)
    const computeSize = (r: DOMRect) => {
      const h = Math.max(r.height * 1.0, 90)
      const w = h * 1.55
      return { w, h }
    }

    const place = (r: DOMRect) => {
      const { w, h } = computeSize(r)
      const centerX = r.left + r.width / 2
      const centerY = r.top + r.height / 2
      gsap.set(sub, {
        left: centerX - w / 2,
        top: centerY - h / 2,
        width: w,
        height: h,
        transformPerspective: 1000,
        transformOrigin: '50% 50%',
      })
      return { centerX, centerY, w, h }
    }

    const docTop = (el: HTMLElement | null) => {
      if (!el) return 0
      return el.getBoundingClientRect().top + window.scrollY
    }

    // Keyframes + interpolation lookup
    let keyframes: Keyframe[] = []
    const getStateAt = (scroll: number): Keyframe => {
      if (keyframes.length === 0)
        return { scroll, x: 0, y: 0, rotation: 0, rotationY: 0, opacity: 0 }
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
            opacity: lerp(a.opacity, b.opacity, t),
          }
        }
      }
      return keyframes[keyframes.length - 1]
    }

    const buildKeyframes = (rCenterX: number, rCenterY: number) => {
      const vh = window.innerHeight
      const vw = window.innerWidth

      // Target viewport positions for right / left "presentation" spots
      const rightTargetX = vw - 150
      const leftTargetX = 150
      const rightX = rightTargetX - rCenterX
      const leftX = leftTargetX - rCenterX

      // Base Y = center of viewport relative to R's initial center
      const midY = vh / 2 - rCenterY

      // Section positions (document-absolute)
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

      const contactTop = docTop(contactEl)
      const contactH = contactEl?.offsetHeight ?? vh

      keyframes = [
        // 0: start, invisible at R
        { scroll: heroTop, x: 0, y: 0, rotation: 0, rotationY: 0, opacity: 0 },
        // 1: gentle crossfade from R — 12% of Hero height to give the morph time
        { scroll: heroTop + heroH * 0.12, x: 0, y: 5, rotation: 5, rotationY: 0, opacity: 1 },
        // 2: diving mid-Hero — sub has left the R position, descending at a gentle angle
        { scroll: heroTop + heroH * 0.55, x: rightX * 0.2, y: midY + 60, rotation: 12, rotationY: 20, opacity: 1 },
        // 3: end of Hero — sub moving toward right side of viewport, facing left (ready for About)
        { scroll: heroBottom, x: rightX * 0.7, y: midY + 120, rotation: 10, rotationY: 120, opacity: 1 },
        // 4: About top — settles at right side, facing left
        { scroll: aboutTop + aboutH * 0.15, x: rightX, y: midY + 60, rotation: 8, rotationY: 180, opacity: 1 },
        // 5: About bottom — swam gently downward while at right
        { scroll: aboutTop + aboutH * 0.85, x: rightX, y: midY + 180, rotation: 14, rotationY: 180, opacity: 1 },
        // 6: Projects top — crossed diagonally to left side, facing right (rotationY 360 = 0)
        { scroll: projectsTop + projectsH * 0.15, x: leftX, y: midY + 120, rotation: 8, rotationY: 360, opacity: 1 },
        // 7: Projects bottom — descended at left
        { scroll: projectsTop + projectsH * 0.85, x: leftX, y: midY + 240, rotation: 14, rotationY: 360, opacity: 1 },
        // 8: Contact top — crossed back to right, facing left (rotationY 540)
        { scroll: contactTop + contactH * 0.15, x: rightX, y: midY + 180, rotation: 8, rotationY: 540, opacity: 1 },
        // 9: Contact bottom
        { scroll: contactTop + contactH * 0.85, x: rightX, y: midY + 240, rotation: 14, rotationY: 540, opacity: 1 },
      ]
    }

    // --- Bubble trail emission ---
    let bubbleIndex = 0
    let lastBubbleTime = 0
    let lastBubbleScroll = -Infinity
    let lastScrollForDelta = window.scrollY

    const emitBubble = (facingLeft: boolean) => {
      if (!bubbleEls.length) return
      const bubble = bubbleEls[bubbleIndex % bubbleEls.length]
      bubbleIndex++

      const subRect = sub.getBoundingClientRect()
      // Rear position in viewport coordinates
      // Facing right → rear is on the LEFT of the bounding box
      // Facing left → rear is on the RIGHT of the bounding box
      const rearX = facingLeft
        ? subRect.right - subRect.width * 0.18
        : subRect.left + subRect.width * 0.18
      const rearY = subRect.top + subRect.height * 0.55 + (Math.random() - 0.5) * 8
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

    const applyState = (scroll: number) => {
      const state = getStateAt(scroll)
      const tNow = performance.now() * 0.001
      const wiggleY = Math.sin(tNow * 1.2) * 3
      const wiggleR = Math.sin(tNow * 1.6) * 1.5

      gsap.set(sub, {
        opacity: state.opacity,
        x: state.x,
        y: state.y + wiggleY,
        rotation: state.rotation + wiggleR,
        rotationY: state.rotationY,
        scale: 0.85 + state.opacity * 0.15,
      })

      // Fade R letter and shrink slightly during morph
      const rEl = document.getElementById('hero-r-letter')
      if (rEl) {
        rEl.style.opacity = String(1 - state.opacity)
        rEl.style.transform = `scale(${1 - state.opacity * 0.25})`
        rEl.style.display = 'inline-block'
        rEl.style.transformOrigin = 'center center'
      }

      // Emit bubbles when underwater and the user is scrolling
      if (state.opacity > 0.6) {
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
      const { centerX: rCenterX, centerY: rCenterY } = place(rect)
      gsap.set(sub, {
        opacity: 0,
        x: 0,
        y: 0,
        rotation: 0,
        rotationY: 0,
        scale: 0.85,
      })

      buildKeyframes(rCenterX, rCenterY)
      // Immediate apply so sub is in correct state before any scroll event
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

      // Re-measure after layout settles
      settleId = window.setTimeout(() => {
        if (window.scrollY > window.innerHeight * 0.1) return
        const el = document.getElementById('hero-r-letter')
        if (!el) return
        const newRect = el.getBoundingClientRect()
        if (
          Math.abs(newRect.left - rect.left) > 1 ||
          Math.abs(newRect.top - rect.top) > 1
        ) {
          const placed = place(newRect)
          buildKeyframes(placed.centerX, placed.centerY)
          ScrollTrigger.refresh()
          applyState(window.scrollY)
        }
      }, 500)

      resizeHandler = () => {
        const el = document.getElementById('hero-r-letter')
        if (!el) return
        if (window.scrollY > window.innerHeight * 0.1) {
          const curRect = el.getBoundingClientRect()
          buildKeyframes(
            curRect.left + curRect.width / 2,
            curRect.top + curRect.height / 2
          )
        } else {
          const newRect = el.getBoundingClientRect()
          const placed = place(newRect)
          buildKeyframes(placed.centerX, placed.centerY)
        }
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
    }
  }, [prefersReduced, portalTarget])

  if (prefersReduced || !portalTarget) return null

  return createPortal(
    <>
      {/* Submarine */}
      <div
        ref={subRef}
        className="pointer-events-none"
        style={{
          position: 'fixed',
          zIndex: 2,
          opacity: 0,
          willChange: 'transform, opacity',
        }}
        aria-hidden="true"
      >
        <SubmarineSVG />
      </div>

      {/* Bubble trail pool — siblings of sub so they're in world space */}
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

function SubmarineSVG() {
  return (
    <svg
      viewBox="0 0 200 130"
      className="w-full h-full"
      style={{ overflow: 'visible' }}
    >
      {/* ===== PROPELLER (left side) ===== */}
      <g transform="translate(28, 70)">
        <ellipse cx="0" cy="-16" rx="8" ry="14" fill="#ef4444" />
        <ellipse cx="0" cy="-16" rx="8" ry="14" fill="#ef4444" transform="rotate(120)" />
        <ellipse cx="0" cy="-16" rx="8" ry="14" fill="#ef4444" transform="rotate(-120)" />
        <circle r="6" fill="#fcd34d" />
        <circle r="3" fill="#f97316" />
      </g>

      {/* ===== TAIL CONNECTOR ===== */}
      <path d="M 35 52 L 58 50 L 62 92 L 35 88 Z" fill="#ef4444" />
      <path d="M 38 54 L 55 52 L 55 62 L 38 64 Z" fill="#fca5a5" opacity="0.7" />
      <path d="M 40 82 L 60 86 L 60 92 L 40 88 Z" fill="#b91c1c" opacity="0.6" />

      {/* ===== MAIN BODY ===== */}
      <g transform="rotate(-4 115 72)">
        <ellipse cx="115" cy="72" rx="78" ry="36" fill="#facc15" />
        <ellipse cx="115" cy="45" rx="55" ry="5" fill="#fef08a" opacity="0.7" />
        <ellipse cx="115" cy="100" rx="68" ry="6" fill="#ca8a04" opacity="0.55" />

        <g fill="#854d0e">
          <circle cx="55" cy="100" r="1.1" />
          <circle cx="70" cy="104" r="1.1" />
          <circle cx="85" cy="106" r="1.1" />
          <circle cx="100" cy="107" r="1.1" />
          <circle cx="115" cy="108" r="1.1" />
          <circle cx="130" cy="107" r="1.1" />
          <circle cx="145" cy="106" r="1.1" />
          <circle cx="160" cy="104" r="1.1" />
          <circle cx="172" cy="100" r="1.1" />
        </g>

        <path
          d="M 70 52 Q 110 44 155 52"
          stroke="#fef9c3"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Porthole 1 */}
        <circle cx="88" cy="74" r="12" fill="#ea580c" />
        <circle cx="88" cy="74" r="9" fill="#2dd4bf" />
        <circle cx="88" cy="74" r="9" fill="none" stroke="#0f766e" strokeWidth="0.6" />
        <ellipse cx="85" cy="71" rx="2.5" ry="3" fill="#a7f3d0" opacity="0.85" />
        <g fill="#7c2d12">
          <circle cx="88" cy="61" r="0.9" />
          <circle cx="101" cy="74" r="0.9" />
          <circle cx="88" cy="87" r="0.9" />
          <circle cx="75" cy="74" r="0.9" />
        </g>

        {/* Porthole 2 */}
        <circle cx="122" cy="74" r="12" fill="#ea580c" />
        <circle cx="122" cy="74" r="9" fill="#2dd4bf" />
        <circle cx="122" cy="74" r="9" fill="none" stroke="#0f766e" strokeWidth="0.6" />
        <ellipse cx="119" cy="71" rx="2.5" ry="3" fill="#a7f3d0" opacity="0.85" />
        <g fill="#7c2d12">
          <circle cx="122" cy="61" r="0.9" />
          <circle cx="135" cy="74" r="0.9" />
          <circle cx="122" cy="87" r="0.9" />
          <circle cx="109" cy="74" r="0.9" />
        </g>

        {/* Front cockpit window */}
        <ellipse cx="165" cy="74" rx="18" ry="24" fill="#2dd4bf" />
        <ellipse cx="165" cy="74" rx="18" ry="24" fill="none" stroke="#0f766e" strokeWidth="1.2" />
        <ellipse cx="157" cy="62" rx="3.5" ry="6" fill="#a7f3d0" opacity="0.85" />
        <ellipse cx="161" cy="58" rx="1.5" ry="2" fill="#f0fdfa" opacity="0.9" />
      </g>

      {/* ===== CONNING TOWER ===== */}
      <path
        d="M 88 42 Q 90 24 108 22 Q 128 20 130 38 Q 130 46 128 48 L 88 46 Z"
        fill="#facc15"
      />
      <path d="M 90 40 Q 108 36 128 40" stroke="#eab308" strokeWidth="2" fill="none" />
      <path
        d="M 92 32 Q 108 28 120 32"
        stroke="#fef08a"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />

      <rect
        x="115"
        y="28"
        width="10"
        height="7"
        rx="1.5"
        fill="#2dd4bf"
        stroke="#0f766e"
        strokeWidth="0.6"
      />

      {/* Periscope */}
      <path
        d="M 112 22 Q 116 4 130 2"
        stroke="#facc15"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 112 22 Q 116 4 130 2"
        stroke="#eab308"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="132" cy="2" r="4" fill="#facc15" stroke="#eab308" strokeWidth="1" />
      <circle cx="132" cy="2" r="2.2" fill="#14b8a6" />
      <circle cx="131" cy="1" r="0.8" fill="#a7f3d0" />
    </svg>
  )
}
