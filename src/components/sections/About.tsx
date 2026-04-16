'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '@/components/ui/TextReveal'
import { profile } from '@/data/profile'
import { skills } from '@/data/skills'
import { experiences } from '@/data/experience'
import { educations } from '@/data/education'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const rootRef = useRef<HTMLElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const educationRef = useRef<HTMLDivElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const triggers: ScrollTrigger[] = []

    // Photo: float-in with tilt + halo pulse
    if (photoRef.current) {
      const photo = photoRef.current
      const frame = photo.querySelector('.photo-frame')
      const halo = photo.querySelector('.photo-halo')

      if (frame) {
        const anim = gsap.from(frame, {
          y: 60,
          opacity: 0,
          rotation: -8,
          scale: 0.9,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: photo,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
        if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
      }

      if (halo) {
        gsap.to(halo, {
          scale: 1.08,
          opacity: 0.65,
          duration: 2.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }
    }

    // Skills — pop in
    if (skillsRef.current) {
      const tags = skillsRef.current.querySelectorAll('.skill-tag')
      const anim = gsap.fromTo(
        tags,
        { y: 30, opacity: 0, scale: 0.85 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.04,
          duration: 0.7,
          ease: 'back.out(2)',
          immediateRender: false,
          scrollTrigger: {
            trigger: skillsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      )
      if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
    }

    // Shared timeline animator — used by both Education and Experience
    const animateTimeline = (container: HTMLDivElement) => {
      const line = container.querySelector('.timeline-line')
      const items = container.querySelectorAll('.timeline-item')

      if (line) {
        const lineAnim = gsap.from(line, {
          scaleY: 0,
          transformOrigin: 'top',
          scrollTrigger: {
            trigger: container,
            start: 'top 70%',
            end: 'bottom 50%',
            scrub: 1,
          },
        })
        if (lineAnim.scrollTrigger) triggers.push(lineAnim.scrollTrigger)
      }

      const itemsAnim = gsap.from(items, {
        x: -40,
        opacity: 0,
        rotationY: -25,
        stagger: 0.18,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      })
      if (itemsAnim.scrollTrigger) triggers.push(itemsAnim.scrollTrigger)

      // Pulse the dots on each item
      items.forEach((item) => {
        const dot = item.querySelector('.timeline-dot')
        if (dot) {
          gsap.to(dot, {
            scale: 1.4,
            opacity: 0.7,
            duration: 1.6,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: Math.random() * 1.2,
          })
        }
      })
    }

    if (educationRef.current) animateTimeline(educationRef.current)
    if (experienceRef.current) animateTimeline(experienceRef.current)

    return () => {
      triggers.forEach((t) => t.kill())
    }
  }, [])

  const categories = [...new Set(skills.map((s) => s.category))]

  return (
    <section
      ref={rootRef}
      id="about"
      className="relative py-32 px-6 md:px-12 lg:px-24"
      aria-label="About"
    >
      <div className="max-w-5xl mx-auto">
        {/* ===== Heading ===== */}
        <TextReveal
          tag="h2"
          className="text-3xl md:text-5xl font-syne font-bold mb-16"
          scrub={false}
          underwater
        >
          About
        </TextReveal>

        {/* ===== Photo + Intro (2-column) ===== */}
        <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center mb-24">
          {/* Photo frame */}
          <div ref={photoRef} className="relative mx-auto md:mx-0 flex-shrink-0">
            {/* Animated halo glow */}
            <div
              className="photo-halo absolute inset-0 -m-6 rounded-full blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(56,189,248,0.5) 0%, rgba(14,165,233,0.25) 40%, rgba(14,165,233,0) 70%)',
                opacity: 0.4,
              }}
            />
            {/* Rotating decorative ring */}
            <div
              className="absolute inset-0 -m-3 rounded-full border border-sky-300/30"
              style={{ animation: 'hero-ring-spin 18s linear infinite' }}
            />
            <div
              className="absolute inset-0 -m-5 rounded-full border border-sky-400/15 border-dashed"
              style={{ animation: 'hero-ring-spin 28s linear infinite reverse' }}
            />
            {/* Photo */}
            <div
              className="photo-frame relative w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-sky-300/40"
              style={{
                boxShadow:
                  '0 0 60px rgba(56,189,248,0.35), inset 0 0 30px rgba(14,116,144,0.35)',
              }}
            >
              <img
                src={profile.photo ?? '/images/profile/icon_SANDBOX.png'}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              {/* Subtle caustic overlay */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
                style={{
                  background:
                    'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.6) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(14,165,233,0.6) 0%, transparent 45%)',
                }}
              />
            </div>
          </div>

          {/* Intro text */}
          <div className="space-y-6">
            <p className="text-sm font-space uppercase tracking-[0.25em] text-sky-300/60">
              {profile.title}
            </p>
            <h3 className="text-2xl md:text-3xl font-syne font-bold text-sky-100">
              {profile.name}
            </h3>
            {profile.introduction.map((text, i) => (
              <TextReveal
                key={i}
                tag="p"
                className="text-base md:text-lg leading-relaxed font-noto"
                scrub
                stagger={0.01}
                underwater
              >
                {text}
              </TextReveal>
            ))}
          </div>
        </div>

        {/* ===== Skills ===== */}
        <div className="mb-24" ref={skillsRef}>
          <h3 className="text-sm font-space uppercase tracking-[0.2em] text-sky-300/60 mb-8">
            Skills
          </h3>
          <div className="space-y-10">
            {categories.map((cat) => {
              const normal = skills.filter((s) => s.category === cat && s.kind !== 'bubble')
              const bubbles = skills.filter((s) => s.category === cat && s.kind === 'bubble')
              return (
                <div key={cat}>
                  <p className="text-xs font-space uppercase tracking-wider text-sky-300/40 mb-5">
                    {cat}
                  </p>
                  <div className="flex flex-wrap items-start gap-x-8 gap-y-8">
                    {/* 通常スキル */}
                    {normal.map((skill) => (
                      <div
                        key={skill.name}
                        className="skill-tag flex flex-col items-center w-14 transition-transform hover:scale-110"
                      >
                        <div className="flex h-14 w-14 items-center justify-center shrink-0">
                          {skill.icon ? (
                            <img
                              src={skill.icon}
                              alt={skill.name}
                              width={48}
                              height={48}
                              className="object-contain w-12 h-12 min-h-12"
                            />
                          ) : (
                            <span className="text-4xl leading-none text-sky-200/60">?</span>
                          )}
                        </div>
                        <span className="mt-1.5 text-[11px] font-space text-sky-200/80 text-center leading-tight">
                          {skill.name}
                        </span>
                      </div>
                    ))}
                    {/* 泡スキル — 同じ行に泡カードとして配置 */}
                    {bubbles.length > 0 && (
                      <div
                        className="skill-tag relative flex items-center gap-4 self-center rounded-2xl border border-sky-300/25 bg-gradient-to-br from-sky-400/10 via-sky-300/5 to-cyan-400/10 px-5 py-3 backdrop-blur-sm transition-transform hover:scale-105"
                        style={{
                          boxShadow:
                            '0 0 24px rgba(56,189,248,0.15), inset 0 0 16px rgba(125,211,252,0.08)',
                        }}
                      >
                        {/* 装飾バブル */}
                        <div className="pointer-events-none absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-sky-300/40 blur-[1px]" aria-hidden="true" />
                        <div className="pointer-events-none absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-cyan-300/40 blur-[1px]" aria-hidden="true" />
                        {bubbles.map((skill) => (
                          <div key={skill.name} className="flex flex-col items-center">
                            <div className="flex h-10 w-10 items-center justify-center">
                              {skill.icon && (
                                <img
                                  src={skill.icon}
                                  alt={skill.name}
                                  width={32}
                                  height={32}
                                  className="object-contain w-8 h-8"
                                />
                              )}
                            </div>
                            <span className="mt-1 text-[10px] font-space text-sky-300/60 text-center leading-tight">
                              {skill.name}
                            </span>
                          </div>
                        ))}
                        <span className="text-[9px] font-space text-sky-300/35 writing-vertical-rl">
                          {bubbles[0].proficiency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ===== Education ===== */}
        <div className="mb-24" ref={educationRef}>
          <h3 className="text-sm font-space uppercase tracking-[0.2em] text-sky-300/60 mb-8">
            Education
          </h3>

          {/* Standard timeline education */}
          <div className="relative pl-8">
            <div className="timeline-line absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-sky-300/10 via-sky-300/40 to-sky-300/10" />
            <div className="space-y-12">
              {educations
                .filter((e) => e.kind !== 'bubble')
                .map((edu) => (
                  <div key={edu.id} className="timeline-item relative">
                    <div className="timeline-dot absolute -left-[34px] top-1.5 w-3 h-3 rounded-full bg-sky-400 ring-4 ring-sky-400/20" />
                    <p className="text-xs font-space uppercase tracking-wider text-sky-300/50 mb-1">
                      {edu.period.start} — {edu.period.end}
                    </p>
                    <h4 className="text-lg font-syne font-semibold text-sky-100">
                      {edu.school}
                    </h4>
                    {edu.degree && (
                      <p className="text-sm text-sky-300/60 font-noto mb-2">
                        {edu.degree}
                      </p>
                    )}
                    {edu.summary && (
                      <p className="text-sm leading-relaxed font-noto text-sky-200/70">
                        {edu.summary}
                      </p>
                    )}
                    {edu.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {edu.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs rounded border border-sky-300/20 px-2 py-0.5 text-sky-300/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Bubble cards — non-timeline "extracurricular" education */}
          {educations.some((e) => e.kind === 'bubble') && (
            <div className="mt-10 flex flex-wrap gap-6">
              {educations
                .filter((e) => e.kind === 'bubble')
                .map((edu) => (
                  <div
                    key={edu.id}
                    className="edu-bubble relative max-w-md rounded-[2rem] border border-sky-300/30 bg-gradient-to-br from-sky-400/10 via-sky-300/5 to-cyan-400/10 p-6 backdrop-blur-sm"
                    style={{
                      boxShadow:
                        '0 0 40px rgba(56,189,248,0.25), inset 0 0 30px rgba(125,211,252,0.12)',
                    }}
                  >
                    {/* Decorative bubbles */}
                    <div
                      className="pointer-events-none absolute -top-3 -right-3 h-6 w-6 rounded-full bg-sky-300/40 blur-[2px]"
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-cyan-300/40 blur-[2px]"
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute top-6 -left-4 h-2 w-2 rounded-full bg-sky-200/50"
                      aria-hidden="true"
                    />
                    <p className="text-[10px] font-space uppercase tracking-[0.25em] text-sky-300/70 mb-2">
                      Extracurricular
                    </p>
                    <h4 className="text-lg font-syne font-semibold text-sky-100">
                      {edu.school}
                    </h4>
                    <p className="text-sm text-sky-300/60 font-noto mb-2">
                      {edu.degree}
                    </p>
                    <p className="text-xs font-space uppercase tracking-wider text-sky-300/50 mb-3">
                      {edu.period.start} — {edu.period.end}
                    </p>
                    <p className="text-sm leading-relaxed font-noto text-sky-200/75">
                      {edu.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {edu.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs rounded-full border border-sky-300/30 bg-sky-400/5 px-2.5 py-0.5 text-sky-200/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ===== Work Experience ===== */}
        <div ref={experienceRef}>
          <h3 className="text-sm font-space uppercase tracking-[0.2em] text-sky-300/60 mb-8">
            Work Experience
          </h3>
          <div className="relative pl-8">
            <div className="timeline-line absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-sky-300/10 via-sky-300/40 to-sky-300/10" />
            <div className="space-y-12">
              {experiences.map((exp) => (
                <div key={exp.id} className="timeline-item relative">
                  <div className="timeline-dot absolute -left-[34px] top-1.5 w-3 h-3 rounded-full bg-sky-400 ring-4 ring-sky-400/20" />
                  <p className="text-xs font-space uppercase tracking-wider text-sky-300/50 mb-1">
                    {exp.period.start} — {exp.period.end}
                  </p>
                  <h4 className="text-lg font-syne font-semibold text-sky-100">
                    {exp.company}
                  </h4>
                  <p className="text-sm text-sky-300/60 font-noto mb-2">
                    {exp.role}
                  </p>
                  <p className="text-sm leading-relaxed font-noto text-sky-200/70">
                    {exp.summary}
                  </p>
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
