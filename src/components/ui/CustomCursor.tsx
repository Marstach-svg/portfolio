'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!isDesktop || prefersReduced) return

    const dot = dotRef.current!
    const ring = ringRef.current!
    if (!dot || !ring) return

    const pos = { x: 0, y: 0 }
    const mouse = { x: 0, y: 0 }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', onMove)

    const ticker = () => {
      pos.x += (mouse.x - pos.x) * 0.15
      pos.y += (mouse.y - pos.y) * 0.15
      gsap.set(dot, { x: mouse.x, y: mouse.y })
      gsap.set(ring, { x: pos.x, y: pos.y })
    }
    gsap.ticker.add(ticker)

    const targets = document.querySelectorAll('[data-cursor="hover"]')
    targets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        gsap.to(ring, { scale: 2.5, borderColor: '#2563EB', duration: 0.3 })
        gsap.to(dot, { scale: 0, duration: 0.2 })
      })
      el.addEventListener('mouseleave', () => {
        gsap.to(ring, { scale: 1, borderColor: '#1C1917', duration: 0.3 })
        gsap.to(dot, { scale: 1, duration: 0.2 })
      })
    })

    const magnets = document.querySelectorAll('[data-cursor="magnetic"]')
    magnets.forEach((el) => {
      el.addEventListener('mousemove', (e: Event) => {
        const me = e as MouseEvent
        const rect = (el as HTMLElement).getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = (me.clientX - cx) * 0.3
        const dy = (me.clientY - cy) * 0.3
        gsap.to(el, { x: dx, y: dy, duration: 0.3 })
      })
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
      })
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      gsap.ticker.remove(ticker)
    }
  }, [isDesktop, prefersReduced])

  if (!isDesktop || prefersReduced) return null

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-900 mix-blend-difference"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-900 mix-blend-difference"
      />
    </>
  )
}
