"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type SectionWrapperProps = {
  children: React.ReactNode
  id?: string
  title?: string
  subtitle?: string
  className?: string
}

/** スクロールフェードイン付きセクションラッパー */
export function SectionWrapper({
  children,
  id,
  title,
  subtitle,
  className,
}: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      className={cn("px-6 py-24 md:px-12 lg:px-24", className)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mx-auto max-w-6xl">
        {title && (
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="gradient-text">{title}</span>
            </h2>
            {subtitle && (
              <p className="mt-4 text-text-secondary">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </motion.section>
  )
}
