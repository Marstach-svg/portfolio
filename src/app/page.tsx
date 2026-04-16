import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Projects from '@/components/sections/Projects'
import Contact from '@/components/sections/Contact'
import WaterBackground from '@/components/webgl/WaterBackground'
import RyokenSubmarine from '@/components/ui/RyokenSubmarine'
import ScrollTriggerRefresher from '@/components/ui/ScrollTriggerRefresher'

export default function Home() {
  return (
    <>
      <ScrollTriggerRefresher />

      {/* Fixed full-viewport water canvas — behind content, above page bg */}
      <WaterBackground />

      <Hero />

      {/* The "R" in RYOKEN morphs into a 3D submarine and swims down */}
      <RyokenSubmarine />

      {/* Underwater sections — layered above the fixed water */}
      <div className="relative" style={{ zIndex: 10 }}>
        <About />
        <Projects />
        <Contact />
      </div>
    </>
  )
}
