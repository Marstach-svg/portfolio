import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { projects } from '@/data/projects'

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
    <div className="min-h-screen px-6 pt-28 pb-20">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-space text-muted hover:text-text transition-colors"
          data-cursor="hover"
        >
          <span aria-hidden="true">&larr;</span> Back
        </Link>

        {/* Hero image */}
        <div className="relative mb-10 aspect-video overflow-hidden rounded-lg bg-surface">
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
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-space text-muted hover:border-text hover:text-text transition-colors"
                data-cursor="hover"
              >
                GitHub &rarr;
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
