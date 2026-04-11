"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type CardProps = {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

/** ホバーリフトエフェクト付きカード */
export function Card({
  children,
  className,
  hover = true,
  onClick,
}: CardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 transition-colors",
        hover && "cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      whileHover={
        hover
          ? {
              y: -4,
              borderColor: "rgba(255, 255, 255, 0.16)",
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }
          : undefined
      }
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
