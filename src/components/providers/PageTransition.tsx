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

// Scroll position saved when navigating forward, restored on reverse.
const SCROLL_KEY = 'pt-scroll-y'

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
  const coverPlayedRef = useRef(false)
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

  // Disable browser scroll restoration so it doesn't fight our custom logic.
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  // --- cover events (from ForwardLink / BackButton) -------------------
  useEffect(() => {
    const forwardHandler = () => {
      try { sessionStorage.setItem(SCROLL_KEY, String(window.scrollY)) } catch {}
      setDirection('forward')
      directionRef.current = 'forward'
      coverPlayedRef.current = true
      playAnim(COVER_FRAMES, COVER_MS, 'ease-out')
    }
    const reverseHandler = () => {
      setDirection('reverse')
      directionRef.current = 'reverse'
      coverPlayedRef.current = true
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
      // Prefer the hash target (nav-link reverse: About / Projects / Contact)
      // over the sessionStorage position (BackButton reverse).
      let top = 0
      const hash = window.location.hash
      if (hash && hash.length > 1) {
        const target = document.querySelector(hash)
        if (target) {
          top = (target as HTMLElement).getBoundingClientRect().top + window.scrollY
        }
      }
      if (!top) {
        try {
          const saved = sessionStorage.getItem(SCROLL_KEY)
          if (saved) top = Number(saved)
        } catch {}
      }
      // Fallback: calculate from the Projects section if nothing else.
      if (!top) {
        const el = document.getElementById('projects')
        if (el) top = el.getBoundingClientRect().top + window.scrollY
      }
      if (lenis?.stop) lenis.stop()
      window.scrollTo(0, top)
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
      return
    }
    // Respect hash navigation (e.g., nav link to /#about from a detail page).
    let top = 0
    const hash = window.location.hash
    if (hash && hash.length > 1) {
      const target = document.querySelector(hash)
      if (target) {
        top = (target as HTMLElement).getBoundingClientRect().top + window.scrollY
      }
    }
    // Apply via window first (synchronous) so child gsap ScrollTriggers
    // registered in their own useEffects compute against the correct scroll.
    window.scrollTo(0, top)
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
  }, [pathname])

  // --- pathname change: play the reveal ------------------------------
  // The cover has already been played on the previous page via the
  // cover event, so the overlay starts this effect already fully opaque.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Child useEffects (Hero/About/Projects/TextReveal) just registered
    // their gsap.from entrance tweens which leave targets at opacity:0 /
    // translated until a ScrollTrigger fires. On any cross-page nav (cover
    // or plain nav link) we want the destination to render fully visible
    // immediately — kill those entrance tweens and force natural state.
    const transformSelectors = [
      '.hero-char',
      '.skill-tag',
      '.timeline-item',
      '.timeline-line',
      '.timeline-dot',
      '.photo-frame',
      '.photo-halo',
      '.project-card-wrap',
      '.underwater-text span',
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
    document
      .querySelectorAll('.underwater-text span')
      .forEach((el) => {
        ;(el as HTMLElement).style.color = '#ffffff'
      })

    // Re-assert hash-based scroll a few times to beat late reflows (images,
    // fonts, Lenis internal sync) that could shift the target's position
    // after our initial useLayoutEffect scroll.
    const reassertHashScroll = () => {
      const hash = window.location.hash
      if (!hash || hash.length <= 1) return
      const target = document.querySelector(hash)
      if (!target) return
      const top = (target as HTMLElement).getBoundingClientRect().top + window.scrollY
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis
      window.scrollTo(0, top)
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
    }

    // Nav-link navigations (without a cover event) should not flash the
    // overlay. Only play the reveal if a cover was played first.
    if (!coverPlayedRef.current) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        reassertHashScroll()
      })
      window.setTimeout(reassertHashScroll, 80)
      window.setTimeout(reassertHashScroll, 250)
      return
    }
    coverPlayedRef.current = false

    const dir = directionRef.current

    if (dir === 'reverse') {
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis

      ScrollTrigger.refresh()

      // Re-assert the scroll position. Prefer hash target (nav-link reverse)
      // over the saved value (BackButton reverse).
      let savedTop = 0
      try {
        const saved = sessionStorage.getItem(SCROLL_KEY)
        if (saved) savedTop = Number(saved)
      } catch {}
      const hashForReverse = window.location.hash
      const scrollToSaved = () => {
        let top = 0
        if (hashForReverse && hashForReverse.length > 1) {
          const target = document.querySelector(hashForReverse)
          if (target) {
            top = (target as HTMLElement).getBoundingClientRect().top + window.scrollY
          }
        }
        if (!top) top = savedTop
        if (!top) {
          const el = document.getElementById('projects')
          if (el) top = el.getBoundingClientRect().top + window.scrollY
        }
        if (!top) return
        window.scrollTo(0, top)
        if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
      }
      scrollToSaved()
      requestAnimationFrame(scrollToSaved)
      window.setTimeout(scrollToSaved, 80)
      window.setTimeout(scrollToSaved, 200)
      window.setTimeout(() => {
        scrollToSaved()
        if (lenis?.start) lenis.start()
        // Re-assert immediately after Lenis restarts so its internal
        // target matches the actual scroll position.
        scrollToSaved()
        ScrollTrigger.refresh()
      }, 300)
      // Extra assertions during the reveal animation window to catch
      // any late reflows or Lenis drift after restart.
      window.setTimeout(scrollToSaved, 500)
      window.setTimeout(scrollToSaved, 800)
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
