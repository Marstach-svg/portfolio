'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function ScrollIndicator() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const tween = gsap.to(el, {
      y: 12,
      opacity: 0.3,
      duration: 1.2,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
    })

    return () => {
      tween.kill()
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs tracking-[0.2em] uppercase text-muted font-inter">Scroll</span>
      <div ref={ref} className="w-px h-8 bg-muted" />
    </div>
  )
}
