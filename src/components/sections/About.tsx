"use client"

import { motion } from "framer-motion"
import { Code2, Briefcase, Zap } from "lucide-react"
import { SectionWrapper } from "@/components/ui/SectionWrapper"

// 統計データ
const stats = [
  { icon: Briefcase, value: "5+", label: "Years Experience" },
  { icon: Code2, value: "30+", label: "Projects Completed" },
  { icon: Zap, value: "15+", label: "Technologies" },
]

export function About() {
  return (
    <SectionWrapper id="about" title="About" subtitle="自己紹介">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        {/* プロフィール画像 */}
        <motion.div
          className="relative mx-auto w-64 md:w-full md:max-w-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* 装飾的グラデーションリング */}
          <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-accent-blue/30 to-accent-purple/30 blur-xl" />
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface">
            {/* プレースホルダー: 実際の画像に差し替え */}
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <div className="text-center">
                <div className="mx-auto mb-2 h-20 w-20 rounded-full bg-surface-elevated" />
                <span className="text-sm">Your Photo</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* テキスト */}
        <div className="space-y-6">
          <motion.p
            className="text-lg leading-relaxed text-text-secondary"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            はじめまして。フルスタックエンジニアとして、Webアプリケーションの設計・開発に携わっています。
            ユーザー体験を大切にしたプロダクト開発が好きです。
          </motion.p>
          <motion.p
            className="text-lg leading-relaxed text-text-secondary"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            フロントエンドではReact/Next.jsを中心に、バックエンドではNode.jsやPythonを活用しています。
            新しい技術のキャッチアップと、チームの生産性向上に常に取り組んでいます。
          </motion.p>

          {/* 統計カード */}
          <motion.div
            className="grid grid-cols-3 gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-surface p-4 text-center"
              >
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-accent-blue" />
                <div className="text-2xl font-bold text-text-primary">
                  {stat.value}
                </div>
                <div className="text-xs text-text-muted">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  )
}
