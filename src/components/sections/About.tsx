'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '@/components/ui/TextReveal'
import { profile } from '@/data/profile'
import { skills } from '@/data/skills'
import { experiences } from '@/data/experience'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const skillsRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const triggers: ScrollTrigger[] = []

    if (skillsRef.current) {
      const tags = skillsRef.current.querySelectorAll('.skill-tag')
      const anim = gsap.from(tags, {
        y: 20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: skillsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
      if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
    }

    if (timelineRef.current) {
      const line = timelineRef.current.querySelector('.timeline-line')
      const items = timelineRef.current.querySelectorAll('.timeline-item')

      if (line) {
        const lineAnim = gsap.from(line, {
          scaleY: 0,
          transformOrigin: 'top',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 70%',
            end: 'bottom 50%',
            scrub: 1,
          },
        })
        if (lineAnim.scrollTrigger) triggers.push(lineAnim.scrollTrigger)
      }

      const itemsAnim = gsap.from(items, {
        x: -30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      })
      if (itemsAnim.scrollTrigger) triggers.push(itemsAnim.scrollTrigger)
    }

    return () => {
      triggers.forEach((t) => t.kill())
    }
  }, [])

  const categories = [...new Set(skills.map((s) => s.category))]

  return (
    <section id="about" className="py-32 px-6 md:px-12 lg:px-24" aria-label="About">
      <div className="max-w-4xl mx-auto">
        {/* Introduction */}
        <div className="mb-24 space-y-6">
          <TextReveal tag="h2" className="text-3xl md:text-5xl font-syne font-bold mb-12" scrub={false} underwater>
            About
          </TextReveal>

          {profile.introduction.map((text, i) => (
            <TextReveal
              key={i}
              tag="p"
              className="text-lg md:text-xl leading-relaxed font-noto"
              scrub
              stagger={0.01}
              underwater
            >
              {text}
            </TextReveal>
          ))}
        </div>

        {/* Skills */}
        <div className="mb-24" ref={skillsRef}>
          <h3 className="text-sm font-space uppercase tracking-[0.2em] text-sky-300/60 mb-8">Skills</h3>
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat}>
                <p className="text-xs font-space uppercase tracking-wider text-sky-300/40 mb-3">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {skills
                    .filter((s) => s.category === cat)
                    .map((skill) => (
                      <span
                        key={skill.name}
                        className={`skill-tag inline-block rounded-full border px-4 py-1.5 text-sm font-space ${
                          skill.size === 'large'
                            ? 'bg-sky-200/15 border-sky-300/30 text-sky-100 font-medium'
                            : skill.size === 'medium'
                              ? 'bg-sky-200/8 border-sky-300/20 text-sky-200/80'
                              : 'border-sky-300/15 text-sky-300/50'
                        }`}
                      >
                        {skill.name}
                        <span className="ml-1.5 text-xs opacity-50">{skill.proficiency}</span>
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div ref={timelineRef}>
          <h3 className="text-sm font-space uppercase tracking-[0.2em] text-sky-300/60 mb-8">Experience</h3>
          <div className="relative pl-8">
            <div className="timeline-line absolute left-0 top-0 bottom-0 w-px bg-sky-300/20" />
            <div className="space-y-12">
              {experiences.map((exp) => (
                <div key={exp.id} className="timeline-item relative">
                  <div className="absolute -left-8 top-1.5 w-2 h-2 rounded-full bg-sky-400" />
                  <p className="text-xs font-space uppercase tracking-wider text-sky-300/50 mb-1">
                    {exp.period.start} — {exp.period.end}
                  </p>
                  <h4 className="text-lg font-syne font-semibold text-sky-100">{exp.role}</h4>
                  <p className="text-sm text-sky-300/60 font-noto mb-2">{exp.company}</p>
                  <p className="text-sm leading-relaxed font-noto text-sky-200/70">{exp.summary}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs rounded border border-sky-300/20 px-2 py-0.5 text-sky-300/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
