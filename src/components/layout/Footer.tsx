"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="border-t border-border bg-surface px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:flex-row md:justify-between">
        {/* コピーライト */}
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Your Name. All rights reserved.
        </p>

        {/* 技術バッジ */}
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="rounded-full border border-border px-3 py-1">
            Next.js
          </span>
          <span className="rounded-full border border-border px-3 py-1">
            Tailwind CSS
          </span>
          <span className="rounded-full border border-border px-3 py-1">
            Vercel
          </span>
        </div>
      </div>

      {/* トップに戻るボタン */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            className="fixed bottom-8 right-8 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-elevated text-text-secondary shadow-lg transition-colors hover:text-text-primary hover:border-border-hover"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            aria-label="トップに戻る"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  )
}
