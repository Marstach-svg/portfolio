'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  children: string
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  stagger?: number
  scrub?: boolean
  underwater?: boolean
}

// Color pairs: [initial, target]
const COLORS = {
  default: { initial: '#78716C', target: '#1C1917' },
  underwater: { initial: '#6a88a8', target: '#ffffff' },
}

export default function TextReveal({
  children,
  tag: Tag = 'p',
  className = '',
  stagger = 0.02,
  scrub = true,
  underwater = false,
}: Props) {
  const containerRef = useRef<HTMLElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const palette = underwater ? COLORS.underwater : COLORS.default

    if (prefersReduced) {
      el.style.color = palette.target
      return
    }

    const text = el.textContent || ''
    el.innerHTML = ''

    const chars: HTMLSpanElement[] = []
    for (const char of text) {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char
      span.style.display = 'inline-block'
      span.style.color = palette.initial
      el.appendChild(span)
      chars.push(span)
    }

    const triggers: ScrollTrigger[] = []

    if (scrub) {
      const anim = gsap.to(chars, {
        color: palette.target,
        stagger: stagger,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1,
        },
      })
      if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
    } else {
      const anim = gsap.from(chars, {
        y: 40,
        opacity: 0,
        rotateX: -90,
        stagger: stagger,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
      if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
    }

    return () => {
      triggers.forEach((t) => t.kill())
    }
  }, [children, stagger, scrub, prefersReduced, underwater])

  const composed = underwater
    ? `${className} underwater-text`.trim()
    : className

  // @ts-expect-error — dynamic tag
  return <Tag ref={containerRef} className={composed}>{children}</Tag>
}
