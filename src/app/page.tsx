import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Projects from '@/components/sections/Projects'
import Contact from '@/components/sections/Contact'
import WaterBackground from '@/components/webgl/WaterBackground'
import HeroFish from '@/components/ui/HeroFish'

export default function Home() {
  return (
    <>
      {/* Fixed full-viewport water canvas — behind content, above page bg */}
      <WaterBackground />

      <Hero />

      {/* Fish morphs in from the "R" letter and swims downward */}
      <HeroFish />

      {/* Underwater sections — layered above the fixed water */}
      <div className="relative" style={{ zIndex: 10 }}>
        <About />
        <Projects />
        <Contact />
      </div>
    </>
  )
}
