'use client'

import dynamic from 'next/dynamic'
import TextReveal from '@/components/ui/TextReveal'
import ScrollIndicator from '@/components/ui/ScrollIndicator'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { profile } from '@/data/profile'

const ParticleField = dynamic(() => import('@/components/webgl/ParticleField'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-bg" />,
})

export default function Hero() {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <section
      className="relative flex min-h-svh items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {isDesktop && <ParticleField className="absolute inset-0" />}

      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <TextReveal
          tag="h1"
          className="text-6xl md:text-8xl lg:text-9xl font-syne font-extrabold tracking-tight"
          scrub={false}
          stagger={0.04}
        >
          RYOKEN
        </TextReveal>

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
