'use client'

import { useRouter } from 'next/navigation'
import { MouseEvent, ReactNode } from 'react'

const COVER_MS = 520

interface Props {
  href: string
  className?: string
  children: ReactNode
  'data-cursor'?: string
}

/**
 * Link that plays the PageTransition cover animation on the CURRENT page
 * before navigating, then lets PageTransition pick up the reveal. Doing
 * the cover before navigation avoids any frame of the new page being
 * visible underneath the fading overlay.
 */
export default function ForwardLink({
  href,
  className,
  children,
  'data-cursor': dataCursor,
}: Props) {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('pt-cover-forward'))
    window.setTimeout(() => {
      router.push(href, { scroll: false })
    }, COVER_MS - 40)
  }

  return (
    <a href={href} onClick={handleClick} className={className} data-cursor={dataCursor}>
      {children}
    </a>
  )
}
