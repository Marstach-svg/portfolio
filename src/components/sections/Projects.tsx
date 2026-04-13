'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '@/components/ui/TextReveal'
import ProjectCard from '@/components/ui/ProjectCard'
import { projects } from '@/data/projects'

gsap.registerPlugin(ScrollTrigger)

export default function Projects() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const [scrollIndex, setScrollIndex] = useState(0)
  const [maxIndex, setMaxIndex] = useState(0)

  // Entrance animation for cards
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const cards = scroller.querySelectorAll('.project-card-wrap')
    const anim = gsap.from(cards, {
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

  // Track scroll position for button state
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const update = () => {
      const cardEl = scroller.querySelector('.project-card-wrap') as HTMLElement | null
      if (!cardEl) return
      const cardWidth = cardEl.offsetWidth + 24 // gap
      const idx = Math.round(scroller.scrollLeft / cardWidth)
      setScrollIndex(idx)
      const max = Math.max(0, projects.length - 3)
      setMaxIndex(max)
    }

    update()
    scroller.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      scroller.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const scrollTo = (direction: 1 | -1) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const cardEl = scroller.querySelector('.project-card-wrap') as HTMLElement | null
    if (!cardEl) return
    const cardWidth = cardEl.offsetWidth + 24
    scroller.scrollBy({ left: direction * cardWidth, behavior: 'smooth' })
  }

  const canPrev = scrollIndex > 0
  const canNext = scrollIndex < maxIndex

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

          {/* Arrow navigation */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => scrollTo(-1)}
              disabled={!canPrev}
              aria-label="前のプロジェクト"
              data-cursor="hover"
              className={`group w-12 h-12 rounded-full border border-sky-300/30 flex items-center justify-center transition-all ${
                canPrev
                  ? 'hover:bg-sky-300/15 hover:border-sky-300/60 text-sky-200'
                  : 'opacity-30 cursor-not-allowed text-sky-300/40'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollTo(1)}
              disabled={!canNext}
              aria-label="次のプロジェクト"
              data-cursor="hover"
              className={`group w-12 h-12 rounded-full border border-sky-300/30 flex items-center justify-center transition-all ${
                canNext
                  ? 'hover:bg-sky-300/15 hover:border-sky-300/60 text-sky-200'
                  : 'opacity-30 cursor-not-allowed text-sky-300/40'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal carousel — exactly 3 cards visible inside narrow container */}
      <div className="max-w-[1080px] mx-auto">
        <div
          ref={scrollerRef}
          className="scroll-snap-x flex gap-6 overflow-x-auto pb-8 px-6 md:px-10"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {projects.map((project) => (
            <div
              key={project.slug}
              className="project-card-wrap flex-shrink-0"
              style={{
                // Original wider card width
                width: 'clamp(240px, calc((min(100vw, 1080px) - 5rem - 3rem) / 3), 300px)',
              }}
            >
              <ProjectCard project={project} underwater />
            </div>
          ))}
          {/* Trailing spacer so last card can snap-align to the left padding */}
          <div className="flex-shrink-0 w-1" aria-hidden="true" />
        </div>
      </div>

      {/* Progress indicator (dots) */}
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 mt-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const scroller = scrollerRef.current
                const cardEl = scroller?.querySelector('.project-card-wrap') as HTMLElement | null
                if (!scroller || !cardEl) return
                scroller.scrollTo({ left: i * (cardEl.offsetWidth + 24), behavior: 'smooth' })
              }}
              aria-label={`プロジェクト ${i + 1} 番目へ`}
              className={`h-1 rounded-full transition-all ${
                i === scrollIndex
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
