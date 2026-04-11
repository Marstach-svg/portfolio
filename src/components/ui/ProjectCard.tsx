'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { Project } from '@/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const ImagePlane = dynamic(() => import('@/components/webgl/ImagePlane'), {
  ssr: false,
  loading: () => <div className="w-full aspect-[16/9] bg-sky-200/10 animate-pulse rounded-lg" />,
})

interface Props {
  project: Project
  underwater?: boolean
}

export default function ProjectCard({ project, underwater = false }: Props) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const cardStyles = underwater
    ? {
        title: 'text-sky-100 group-hover:text-sky-300',
        year: 'text-sky-300/50',
        desc: 'text-sky-200/60',
        tag: 'border-sky-300/20 text-sky-300/50',
        thumb: 'bg-sky-200/10',
      }
    : {
        title: 'group-hover:text-accent',
        year: 'text-muted',
        desc: 'text-muted',
        tag: 'border-border text-muted',
        thumb: 'bg-surface',
      }

  return (
    <Link
      href={`/projects/${project.slug}/`}
      className="group block"
      data-cursor="hover"
    >
      <article className="space-y-4">
        {/* Thumbnail */}
        {isDesktop ? (
          <ImagePlane
            src={project.thumbnail}
            alt={project.title}
            className="aspect-[16/9] w-full overflow-hidden rounded-lg"
          />
        ) : (
          <div className={`aspect-[16/9] w-full overflow-hidden rounded-lg ${cardStyles.thumb}`}>
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-syne font-semibold transition-colors ${cardStyles.title}`}>
              {project.title}
            </h3>
            <span className={`text-xs font-space ${cardStyles.year}`}>{project.year}</span>
          </div>

          <p className={`text-sm font-noto leading-relaxed line-clamp-2 ${cardStyles.desc}`}>
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs rounded border px-2 py-0.5 font-space ${cardStyles.tag}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  )
}
