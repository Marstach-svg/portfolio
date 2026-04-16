'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState, ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  children: ReactNode
}

type LenisLike = {
  scrollTo: (
    target: number | string | HTMLElement,
    opts?: { immediate?: boolean; force?: boolean }
  ) => void
  stop?: () => void
  start?: () => void
}

type Direction = 'forward' | 'reverse'

const COVER_MS = 520
const HOLD_MS = 160
const REVEAL_MS = 900

// Cover animation keyframes (fade from 0 to fully covered).
const COVER_FRAMES: Keyframe[] = [
  { opacity: 0, transform: 'translateY(0)' },
  { opacity: 1, transform: 'translateY(0)' },
]

// Forward reveal: hold covered, then slide down past viewport bottom.
const FORWARD_REVEAL_FRAMES: Keyframe[] = [
  { opacity: 1, transform: 'translateY(0)', offset: 0 },
  { opacity: 1, transform: 'translateY(0)', offset: HOLD_MS / (HOLD_MS + REVEAL_MS) },
  { opacity: 1, transform: 'translateY(104%)', offset: 1 },
]

// Reverse reveal: hold covered, then slide up past viewport top.
const REVERSE_REVEAL_FRAMES: Keyframe[] = [
  { opacity: 1, transform: 'translateY(0)', offset: 0 },
  { opacity: 1, transform: 'translateY(0)', offset: HOLD_MS / (HOLD_MS + REVEAL_MS) },
  { opacity: 1, transform: 'translateY(-104%)', offset: 1 },
]

export default function PageTransition({ children }: Props) {
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  const currentAnimRef = useRef<Animation | null>(null)
  const directionRef = useRef<Direction>('forward')
  const [direction, setDirection] = useState<Direction>('forward')

  // keep ref in sync for effects that read direction at fire time
  directionRef.current = direction

  // --- helpers ---------------------------------------------------------
  const playAnim = (frames: Keyframe[], duration: number, easing: string) => {
    const overlay = overlayRef.current
    if (!overlay) return null
    if (currentAnimRef.current) {
      currentAnimRef.current.cancel()
    }
    const anim = overlay.animate(frames, {
      duration,
      easing,
      fill: 'forwards',
    })
    currentAnimRef.current = anim
    return anim
  }

  const resetOverlay = () => {
    if (currentAnimRef.current) {
      currentAnimRef.current.cancel()
      currentAnimRef.current = null
    }
    const overlay = overlayRef.current
    if (!overlay) return
    overlay.style.opacity = '0'
    overlay.style.transform = 'translateY(0)'
  }

  // --- cover events (from ForwardLink / BackButton) -------------------
  useEffect(() => {
    const forwardHandler = () => {
      setDirection('forward')
      directionRef.current = 'forward'
      playAnim(COVER_FRAMES, COVER_MS, 'ease-out')
    }
    const reverseHandler = () => {
      setDirection('reverse')
      directionRef.current = 'reverse'
      playAnim(COVER_FRAMES, COVER_MS, 'ease-out')
    }
    window.addEventListener('pt-cover-forward', forwardHandler)
    window.addEventListener('pt-cover-reverse', reverseHandler)
    return () => {
      window.removeEventListener('pt-cover-forward', forwardHandler)
      window.removeEventListener('pt-cover-reverse', reverseHandler)
    }
  }, [])

  // --- pathname change: scroll prep ----------------------------------
  // Runs synchronously before paint. Children have been committed to the
  // DOM at this point so document.getElementById finds them.
  useLayoutEffect(() => {
    if (isFirstRender.current) return
    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis
    if (directionRef.current === 'reverse') {
      // Scroll to the Projects section BEFORE paint so the first painted
      // frame of the new page is already showing the right position
      // (covered by the overlay, so the user won't see the scroll change).
      const el = document.getElementById('projects')
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY
        if (lenis?.stop) lenis.stop()
        window.scrollTo(0, top)
        if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
      }
      return
    }
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  // --- pathname change: play the reveal ------------------------------
  // The cover has already been played on the previous page via the
  // cover event, so the overlay starts this effect already fully opaque.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const dir = directionRef.current

    if (dir === 'reverse') {
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis

      // Child useEffects (Hero/About/Projects/TextReveal) ran just before
      // this parent useEffect and registered their entrance tweens. Kill
      // them and force every entrance target to its natural visible state.
      const transformSelectors = [
        '.hero-char',
        '.skill-tag',
        '.timeline-item',
        '.timeline-line',
        '.timeline-dot',
        '.photo-frame',
        '.photo-halo',
        '.project-card-wrap',
        '.underwater-text > span',
      ]
      const nodes = document.querySelectorAll(transformSelectors.join(','))
      nodes.forEach((el) => {
        gsap.killTweensOf(el)
        gsap.set(el, {
          opacity: 1,
          x: 0,
          y: 0,
          rotation: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          scaleY: 1,
        })
      })
      // Force TextReveal character spans to their final color.
      document
        .querySelectorAll('.underwater-text > span')
        .forEach((el) => {
          ;(el as HTMLElement).style.color = '#ffffff'
        })

      ScrollTrigger.refresh()

      // Re-assert the scroll position in case tween kills triggered reflow.
      // Retry a few times across the next frames because Lenis may animate
      // back to a stale target otherwise.
      const scrollToProjects = () => {
        const el = document.getElementById('projects')
        if (!el) return
        const top = el.getBoundingClientRect().top + window.scrollY
        window.scrollTo(0, top)
        if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
      }
      scrollToProjects()
      requestAnimationFrame(scrollToProjects)
      window.setTimeout(scrollToProjects, 80)
      window.setTimeout(scrollToProjects, 200)
      window.setTimeout(() => {
        if (lenis?.start) lenis.start()
        ScrollTrigger.refresh()
      }, 300)
    } else {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    }

    const frames = dir === 'reverse' ? REVERSE_REVEAL_FRAMES : FORWARD_REVEAL_FRAMES
    const anim = playAnim(
      frames,
      HOLD_MS + REVEAL_MS,
      'cubic-bezier(0.3, 0, 0.2, 1)'
    )
    if (anim) {
      anim.addEventListener('finish', () => {
        resetOverlay()
      })
    }
  }, [pathname])

  const isReverse = direction === 'reverse'

  return (
    <>
      <div
        ref={overlayRef}
        data-pt-overlay=""
        className="pointer-events-none fixed inset-0 z-[9990] will-change-transform"
        style={{ opacity: 0, transform: 'translateY(0)' }}
        aria-hidden="true"
      >
        <div
          className={
            isReverse
              ? 'absolute inset-0 bg-gradient-to-t from-[#2e9ea8] via-[#0d3861] to-[#031026]'
              : 'absolute inset-0 bg-gradient-to-b from-[#2e9ea8] via-[#0d3861] to-[#031026]'
          }
        />
        {isReverse ? (
          <svg
            className="absolute left-0 right-0 w-full block"
            style={{ bottom: 'calc(-4vh + 1px)', height: '4vh' }}
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,0 L 0,6 C 18,16 36,0 54,10 S 86,18 100,6 L 100,0 Z"
              fill="#2e9ea8"
            />
          </svg>
        ) : (
          <svg
            className="absolute left-0 right-0 w-full block"
            style={{ top: 'calc(-4vh + 1px)', height: '4vh' }}
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,20 L 0,14 C 18,4 36,20 54,10 S 86,2 100,14 L 100,20 Z"
              fill="#2e9ea8"
            />
          </svg>
        )}
      </div>

      {/* key={pathname} forces the subtree to remount on every route change
          so section useEffects re-run and gsap.from entrance animations
          replay from scratch. */}
      <div ref={containerRef} key={pathname}>{children}</div>
    </>
  )
}
