"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

/** カスタムカーソル（PCのみ表示） */
export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  // 外側の円はスプリングで追従
  const springX = useSpring(cursorX, { stiffness: 300, damping: 28 })
  const springY = useSpring(cursorY, { stiffness: 300, damping: 28 })

  useEffect(() => {
    // タッチデバイスではカーソルを表示しない
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches
    if (isTouchDevice) return

    setIsVisible(true)

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [cursorX, cursorY])

  if (!isVisible) return null

  return (
    <>
      {/* 中心のドット */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[100] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue mix-blend-difference"
        style={{ x: cursorX, y: cursorY }}
      />
      {/* 外側の円（遅延追従） */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[100] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-blue/50 mix-blend-difference"
        style={{ x: springX, y: springY }}
      />
    </>
  )
}
