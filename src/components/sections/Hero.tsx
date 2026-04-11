"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/Button"

// スタガーアニメーション用バリアント
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      {/* 背景レイヤー */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* ラジアルグラデーション */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 blur-[120px]" />
        {/* グリッドパターン */}
        <div className="grid-pattern absolute inset-0 opacity-40" />
      </div>

      {/* コンテンツ */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* バッジ */}
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-1.5 text-sm text-text-secondary backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Available for work
          </span>
        </motion.div>

        {/* 名前 */}
        <motion.h1
          variants={item}
          className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span className="gradient-text">Your Name</span>
        </motion.h1>

        {/* 肩書き */}
        <motion.p
          variants={item}
          className="max-w-xl text-lg text-text-secondary sm:text-xl md:text-2xl"
        >
          Full-Stack Engineer &amp; Creative Developer
        </motion.p>

        {/* CTAボタン */}
        <motion.div variants={item} className="flex gap-4 pt-4">
          <Button href="#projects">View Projects</Button>
          <Button variant="secondary" href="#contact">
            Contact Me
          </Button>
        </motion.div>
      </motion.div>

      {/* スクロールインジケータ */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-text-muted" />
        </motion.div>
      </motion.div>
    </section>
  )
}
