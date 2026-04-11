"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

type TimelineItemData = {
  id: string
  title: string
  subtitle: string
  period: string
  description: string
  tags?: string[]
}

type TimelineProps = {
  items: TimelineItemData[]
  className?: string
}

/** スクロール連動タイムライン */
export function Timeline({ items, className }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  })

  // スクロール進捗に連動してラインが伸びる
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* ベースライン（背景） */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-px" />

      {/* アニメーションライン */}
      <motion.div
        className="absolute left-4 top-0 w-px bg-gradient-to-b from-accent-blue to-accent-purple md:left-1/2 md:-translate-x-px"
        style={{ height: lineHeight }}
      />

      {/* タイムラインアイテム */}
      <div className="space-y-12">
        {items.map((item, index) => (
          <TimelineEntry key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  )
}

function TimelineEntry({
  item,
  index,
}: {
  item: TimelineItemData
  index: number
}) {
  const isEven = index % 2 === 0

  return (
    <motion.div
      className={cn(
        "relative flex items-start gap-8 pl-12 md:pl-0",
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      )}
      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* ドット */}
      <div className="absolute left-4 top-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-accent-blue bg-background md:left-1/2" />

      {/* コンテンツ */}
      <div
        className={cn(
          "w-full rounded-2xl border border-border bg-surface p-6 md:w-[calc(50%-2rem)]",
          isEven ? "md:mr-auto" : "md:ml-auto"
        )}
      >
        <span className="text-sm font-medium text-accent-blue">
          {item.period}
        </span>
        <h3 className="mt-1 text-lg font-bold text-text-primary">
          {item.title}
        </h3>
        <p className="text-sm text-text-secondary">{item.subtitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {item.description}
        </p>
        {item.tags && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-xs text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
