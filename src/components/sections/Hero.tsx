'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import TextReveal from '@/components/ui/TextReveal'
import ScrollIndicator from '@/components/ui/ScrollIndicator'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { profile } from '@/data/profile'

const ParticleField = dynamic(() => import('@/components/webgl/ParticleField'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-bg" />,
})

const TITLE = ['R', 'Y', 'O', 'K', 'E', 'N']

export default function Hero() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const prefersReduced = useReducedMotion()
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (prefersReduced || !titleRef.current) return

    // Animate all chars EXCEPT the R — R is handled by HeroFish (submarine morph)
    // so it must stay at its natural layout position for correct measurement.
    const chars = titleRef.current.querySelectorAll(
      '.hero-char:not(#hero-r-letter)'
    )
    gsap.from(chars, {
      y: 50,
      opacity: 0,
      rotateX: -90,
      stagger: 0.05,
      duration: 0.9,
      ease: 'back.out(1.7)',
      delay: 0.15,
    })
  }, [prefersReduced])

  return (
    <section
      id="hero-trigger"
      className="relative flex min-h-svh items-center justify-center overflow-hidden"
      style={{ zIndex: 0 }}
      aria-label="Hero"
    >
      {isDesktop && <ParticleField className="absolute inset-0" />}

      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-syne font-extrabold tracking-tight"
          aria-label="RYOKEN"
        >
          {TITLE.map((c, i) =>
            i === 0 ? (
              <span
                key={i}
                id="hero-r-letter"
                className="hero-char inline-block"
                style={{ willChange: 'opacity, transform' }}
              >
                {c}
              </span>
            ) : (
              <span key={i} className="hero-char inline-block">
                {c}
              </span>
            )
          )}
        </h1>

        <TextReveal
          tag="p"
          className="text-lg md:text-xl font-space text-muted tracking-widest uppercase"
          scrub={false}
          stagger={0.02}
        >
          {profile.title}
        </TextReveal>

        <div className="mt-16">
          <ScrollIndicator />
        </div>
      </div>
    </section>
  )
}
