'use client'

import dynamic from 'next/dynamic'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Projects from '@/components/sections/Projects'
import Contact from '@/components/sections/Contact'
import UnderwaterWrapper from '@/components/sections/UnderwaterWrapper'

const WaveTransition = dynamic(
  () => import('@/components/webgl/WaveTransition'),
  { ssr: false }
)

export default function Home() {
  return (
    <>
      <Hero />

      {/* Wave transition — sticks to viewport, animates on scroll through wave-zone */}
      <div id="wave-zone" className="relative h-[80vh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          <WaveTransition triggerId="wave-zone" className="absolute inset-0" />
        </div>
      </div>

      {/* Underwater sections */}
      <UnderwaterWrapper>
        <About />
        <Projects />
        <Contact />
      </UnderwaterWrapper>
    </>
  )
}
