import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { projects } from '@/data/projects'
import ReloadOnPop from '@/components/ui/ReloadOnPop'
import BeachDecorations from '@/components/ui/BeachDecorations'
import BackButton from '@/components/ui/BackButton'
import { GitHubIcon } from '@/components/icons/social'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = projects.find((x) => x.slug === slug)
  if (!p) return { title: 'Not Found' }
  return { title: p.title, description: p.description }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = projects.find((x) => x.slug === slug)
  if (!project) notFound()

  const currentIndex = projects.findIndex((p) => p.slug === slug)
  const nextProject = projects[(currentIndex + 1) % projects.length]

  const sections = [
    { label: 'Challenge', content: project.challenge },
    { label: 'Solution', content: project.solution },
    { label: 'Outcome', content: project.outcome },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f5ebd6] via-[#f0e2c4] to-[#e8d4a8] px-6 pt-28 pb-20">
      <ReloadOnPop />
      {/* Subtle sand grain via radial speckle */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.35] mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(rgba(140, 100, 60, 0.18) 1px, transparent 1px), radial-gradient(rgba(160, 120, 80, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px, 13px 13px',
          backgroundPosition: '0 0, 7px 11px',
        }}
        aria-hidden="true"
      />
      <BeachDecorations />
      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Back — plays a reverse wave animation then hard-navigates home. */}
        <BackButton />

        {/* Hero image */}
        <div className="relative mb-10 aspect-video overflow-hidden rounded-xl bg-surface shadow-[0_24px_48px_-20px_rgba(120,80,40,0.45)]">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Title & meta */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-syne font-bold mb-3">{project.title}</h1>
          <p className="text-base text-muted font-noto leading-relaxed">{project.description}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-3 py-0.5 text-xs font-space text-muted"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-space text-muted hover:border-text hover:text-text transition-colors"
                data-cursor="hover"
              >
                <GitHubIcon className="w-5 h-5" />
                GitHub
              </a>
            )}
            {project.links.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-text text-bg px-4 py-2 text-xs font-space hover:bg-accent transition-colors"
                data-cursor="hover"
              >
                Demo &rarr;
              </a>
            )}
          </div>
        </div>

        {/* Detail sections */}
        <hr className="mb-10 border-border" />

        <div className="space-y-10">
          {sections.map((s) => (
            <div key={s.label}>
              <p className="text-xs font-space uppercase tracking-[0.2em] text-muted mb-2">{s.label}</p>
              <p className="text-base leading-relaxed font-noto">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Next project */}
        {nextProject && (
          <div className="mt-20 pt-10 border-t border-border text-center">
            <p className="text-xs font-space uppercase tracking-[0.2em] text-muted mb-4">Next Project</p>
            <Link
              href={`/projects/${nextProject.slug}/`}
              className="text-2xl font-syne font-bold hover:text-accent transition-colors"
              data-cursor="magnetic"
            >
              {nextProject.title}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
