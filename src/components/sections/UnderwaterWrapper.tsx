'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const UnderwaterOverlay = dynamic(
  () => import('@/components/webgl/UnderwaterOverlay'),
  { ssr: false }
)

const BubbleField = dynamic(
  () => import('@/components/webgl/BubbleField'),
  { ssr: false }
)

interface Props {
  children: ReactNode
}

export default function UnderwaterWrapper({ children }: Props) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <div id="underwater" className="relative">
      {/* Underwater background & effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base water color for all devices */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a3a] via-[#071230] to-[#030a1e]" />

        {/* WebGL caustics overlay — desktop only */}
        {isDesktop && (
          <UnderwaterOverlay className="absolute inset-0" />
        )}

        {/* Bubbles — desktop only */}
        {isDesktop && (
          <BubbleField className="absolute inset-0" />
        )}
      </div>

      {/* Content with adjusted colors for underwater readability */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
