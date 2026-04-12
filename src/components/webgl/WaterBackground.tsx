'use client'

import dynamic from 'next/dynamic'

const WaterScene = dynamic(() => import('@/components/webgl/WaterScene'), { ssr: false })
const BubbleField = dynamic(() => import('@/components/webgl/BubbleField'), { ssr: false })

/**
 * Fixed full-viewport water background.
 * Wave rises and covers Hero as user scrolls through it.
 * Bubbles fade in as the wave rises.
 */
export default function WaterBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      <WaterScene triggerId="hero-trigger" className="absolute inset-0" />
      <BubbleField triggerId="hero-trigger" className="absolute inset-0" />
    </div>
  )
}
