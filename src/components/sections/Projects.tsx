'use client'

import TextReveal from '@/components/ui/TextReveal'
import ProjectCard from '@/components/ui/ProjectCard'
import { projects } from '@/data/projects'

export default function Projects() {
  return (
    <section id="projects" className="relative py-32 px-6 md:px-12 lg:px-24" aria-label="Projects">
      <div className="max-w-5xl mx-auto">
        <TextReveal
          tag="h2"
          className="text-3xl md:text-5xl font-syne font-bold mb-16"
          scrub={false}
          underwater
        >
          Projects
        </TextReveal>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} underwater />
          ))}
        </div>
      </div>
    </section>
  )
}
