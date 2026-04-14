'use client'

import dynamic from 'next/dynamic'

const WaterScene = dynamic(() => import('@/components/webgl/WaterScene'), { ssr: false })

/**
 * Fixed full-viewport water background.
 * Wave rises and covers Hero as user scrolls through it.
 * Bubbles, fish silhouettes, and floating motes are now rendered in the
 * unified 3D scene owned by RyokenSubmarine, so they share the same
 * camera, fog, and depth as the submarine.
 */
export default function WaterBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      <WaterScene triggerId="hero-trigger" className="absolute inset-0" />
    </div>
  )
}
