'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '@/components/ui/TextReveal'
import ProjectCard from '@/components/ui/ProjectCard'
import { projects } from '@/data/projects'

gsap.registerPlugin(ScrollTrigger)

// Triple the list so the middle copy can scroll freely in either direction
// before we silently warp back to the equivalent position.
const loopProjects = [...projects, ...projects, ...projects]
const ORIGINAL_LEN = projects.length

export default function Projects() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const isWarpingRef = useRef(false)
  const [activeDot, setActiveDot] = useState(0)

  // Entrance animation for cards (only the middle copy, to avoid triple-fire)
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const cards = scroller.querySelectorAll('.project-card-wrap')
    const middleCards = Array.from(cards).slice(ORIGINAL_LEN, ORIGINAL_LEN * 2)
    const anim = gsap.from(middleCards, {
      y: 60,
      opacity: 0,
      rotationX: -15,
      stagger: 0.12,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: scroller,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    })

    return () => {
      if (anim.scrollTrigger) anim.scrollTrigger.kill()
    }
  }, [])

  // Initial position: start of the middle copy
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const jumpToMiddle = () => {
      const cardEl = scroller.querySelector('.project-card-wrap') as HTMLElement | null
      if (!cardEl) return
      const cardWidth = cardEl.offsetWidth + 24
      isWarpingRef.current = true
      scroller.scrollLeft = cardWidth * ORIGINAL_LEN
      requestAnimationFrame(() => {
        isWarpingRef.current = false
      })
    }

    jumpToMiddle()
    window.addEventListener('resize', jumpToMiddle)
    return () => window.removeEventListener('resize', jumpToMiddle)
  }, [])

  // Scroll handler: update dot index on every frame, but defer the boundary
  // warp until scrolling has idled. Assigning scrollLeft mid-scroll cancels
  // native smooth/momentum animation and causes a visible flicker.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    let idleTimer: number | null = null

    const tryWarp = () => {
      if (isWarpingRef.current) return
      const cardEl = scroller.querySelector('.project-card-wrap') as HTMLElement | null
      if (!cardEl) return
      const cardWidth = cardEl.offsetWidth + 24
      const setWidth = cardWidth * ORIGINAL_LEN
      const left = scroller.scrollLeft
      if (left >= setWidth * 2) {
        isWarpingRef.current = true
        scroller.scrollLeft = left - setWidth
        requestAnimationFrame(() => {
          isWarpingRef.current = false
        })
      } else if (left < setWidth) {
        isWarpingRef.current = true
        scroller.scrollLeft = left + setWidth
        requestAnimationFrame(() => {
          isWarpingRef.current = false
        })
      }
    }

    const onScroll = () => {
      if (isWarpingRef.current) return
      const cardEl = scroller.querySelector('.project-card-wrap') as HTMLElement | null
      if (cardEl) {
        const cardWidth = cardEl.offsetWidth + 24
        const setWidth = cardWidth * ORIGINAL_LEN
        const idx = Math.round((scroller.scrollLeft - setWidth) / cardWidth)
        const normalized = ((idx % ORIGINAL_LEN) + ORIGINAL_LEN) % ORIGINAL_LEN
        setActiveDot(normalized)
      }
      if (idleTimer != null) window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(tryWarp, 150)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (idleTimer != null) window.clearTimeout(idleTimer)
    }
  }, [])

  // Pre-warp: if about to cross the middle-copy boundary, silently teleport
  // to the equivalent position in the opposite copy BEFORE starting the
  // smooth scroll. Assigning scrollLeft mid-animation cancels smooth scroll
  // and causes a visible flicker, so we must warp first, then scroll.
  const scrollBy = (direction: 1 | -1) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const cardEl = scroller.querySelector('.project-card-wrap') as HTMLElement | null
    if (!cardEl) return
    const cardWidth = cardEl.offsetWidth + 24
    const setWidth = cardWidth * ORIGINAL_LEN
    const left = scroller.scrollLeft

    if (direction === -1 && left - cardWidth < setWidth - 1) {
      isWarpingRef.current = true
      scroller.scrollLeft = left + setWidth
      requestAnimationFrame(() => {
        isWarpingRef.current = false
      })
    } else if (direction === 1 && left + cardWidth >= setWidth * 2 - 1) {
      isWarpingRef.current = true
      scroller.scrollLeft = left - setWidth
      requestAnimationFrame(() => {
        isWarpingRef.current = false
      })
    }

    scroller.scrollBy({ left: direction * cardWidth, behavior: 'smooth' })
  }

  const scrollToDot = (i: number) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const cardEl = scroller.querySelector('.project-card-wrap') as HTMLElement | null
    if (!cardEl) return
    const cardWidth = cardEl.offsetWidth + 24
    const setWidth = cardWidth * ORIGINAL_LEN
    // Pre-warp into the nearest copy so smooth scroll distance stays small
    // and never crosses a boundary mid-animation.
    const target = setWidth + i * cardWidth
    const current = scroller.scrollLeft
    const delta = target - current
    if (Math.abs(delta) > setWidth / 2) {
      isWarpingRef.current = true
      scroller.scrollLeft = current + (delta > 0 ? setWidth : -setWidth)
      requestAnimationFrame(() => {
        isWarpingRef.current = false
      })
    }
    scroller.scrollTo({ left: target, behavior: 'smooth' })
  }

  return (
    <section
      id="projects"
      className="relative py-32 overflow-hidden"
      aria-label="Projects"
    >
      <div className="max-w-[1080px] mx-auto px-6 md:px-10">
        <div ref={headingRef} className="flex items-end justify-between mb-12 md:mb-16 gap-6">
          <TextReveal
            tag="h2"
            className="text-3xl md:text-5xl font-syne font-bold"
            scrub={false}
            underwater
          >
            Projects
          </TextReveal>

          {/* Arrow navigation — always enabled (infinite loop) */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="前のプロジェクト"
              data-cursor="hover"
              className="group w-12 h-12 rounded-full border border-sky-300/30 flex items-center justify-center transition-all hover:bg-sky-300/15 hover:border-sky-300/60 text-sky-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="次のプロジェクト"
              data-cursor="hover"
              className="group w-12 h-12 rounded-full border border-sky-300/30 flex items-center justify-center transition-all hover:bg-sky-300/15 hover:border-sky-300/60 text-sky-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Infinite horizontal carousel */}
      <div className="max-w-[1080px] mx-auto">
        <div
          ref={scrollerRef}
          className="scroll-snap-x flex gap-6 overflow-x-auto pb-8 px-6 md:px-10"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {loopProjects.map((project, i) => {
            const isMiddleCopy = i >= ORIGINAL_LEN && i < ORIGINAL_LEN * 2
            return (
              <div
                key={`${project.slug}-${i}`}
                className="project-card-wrap flex-shrink-0"
                style={{
                  // 2-up on desktop; smaller viewports naturally shrink via clamp
                  width: 'clamp(280px, calc((min(100vw, 1080px) - 5rem - 1.5rem) / 2), 488px)',
                }}
                aria-hidden={isMiddleCopy ? undefined : 'true'}
              >
                {/* Only the middle copy uses WebGL ImagePlane — leading/trailing
                    clones render as plain <img> to stay within the browser's
                    WebGL context budget and keep the water scene alive. */}
                <ProjectCard project={project} underwater useWebgl={isMiddleCopy} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress indicator (dots) — one per unique project */}
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 mt-6">
        <div className="flex items-center gap-2">
          {projects.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => scrollToDot(i)}
              aria-label={`プロジェクト ${i + 1} 番目へ`}
              className={`h-1 rounded-full transition-all ${
                i === activeDot
                  ? 'w-8 bg-sky-300'
                  : 'w-4 bg-sky-300/30 hover:bg-sky-300/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
