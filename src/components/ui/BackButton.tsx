'use client'

import { useRouter } from 'next/navigation'
import { MouseEvent } from 'react'

const COVER_MS = 520

/**
 * Back link for the project detail page.
 *
 * On click, dispatches a cover-reverse event so PageTransition fades in
 * its overlay on the CURRENT (detail) page, then uses Next.js router.push
 * to navigate home without a hard reload. PageTransition then picks up
 * the pathname change and plays the reverse reveal (wave rises from below)
 * while scrolling to the Projects section underneath.
 */
export default function BackButton() {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('pt-cover-reverse'))
    window.setTimeout(() => {
      router.push('/', { scroll: false })
    }, COVER_MS - 40)
  }

  return (
    <a
      href="/"
      onClick={handleClick}
      className="mb-8 inline-flex items-center gap-2 text-sm font-space text-muted hover:text-text transition-colors"
      data-cursor="hover"
    >
      <span aria-hidden="true">&larr;</span> Back
    </a>
  )
}
