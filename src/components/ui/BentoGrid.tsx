"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type BentoGridProps = {
  children: React.ReactNode
  className?: string
}

/** Bento Grid レイアウトコンテナ */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  )
}

type BentoItemProps = {
  children: React.ReactNode
  className?: string
  size?: "small" | "medium" | "large"
}

/** Bento Grid アイテム */
export function BentoItem({
  children,
  className,
  size = "small",
}: BentoItemProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 transition-colors",
        size === "large" && "sm:col-span-2 sm:row-span-2",
        size === "medium" && "sm:col-span-2 lg:col-span-1",
        className
      )}
      whileHover={{
        y: -4,
        borderColor: "rgba(255, 255, 255, 0.16)",
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}
