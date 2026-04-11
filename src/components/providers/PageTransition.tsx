'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, ReactNode } from 'react'
import gsap from 'gsap'

interface Props {
  children: ReactNode
}

export default function PageTransition({ children }: Props) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const overlay = overlayRef.current
    const container = containerRef.current
    if (!overlay || !container) return

    const tl = gsap.timeline()

    tl.fromTo(
      overlay,
      { scaleY: 0, transformOrigin: 'bottom' },
      { scaleY: 1, duration: 0.5, ease: 'power3.inOut' }
    )

    tl.fromTo(
      overlay,
      { transformOrigin: 'top' },
      { scaleY: 0, duration: 0.5, ease: 'power3.inOut', delay: 0.1 }
    )

    tl.fromTo(
      container,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    )
  }, [pathname])

  return (
    <>
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[9990] origin-bottom scale-y-0 bg-text"
      />
      <div ref={containerRef}>{children}</div>
    </>
  )
}
