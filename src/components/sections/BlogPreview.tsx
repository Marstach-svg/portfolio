"use client"

import { motion } from "framer-motion"
import { ArrowRight, Calendar, Clock } from "lucide-react"
import { SectionWrapper } from "@/components/ui/SectionWrapper"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import type { BlogPost } from "@/types"

// プレースホルダー記事データ（後でMDXから動的に取得）
const previewPosts: BlogPost[] = [
  {
    slug: "hello-world",
    title: "ブログを始めました",
    date: "2026-04-01",
    description:
      "ポートフォリオサイトにブログ機能を追加しました。技術記事やプロジェクトの振り返りを発信していきます。",
    tags: ["お知らせ"],
    readingTime: "2 min",
  },
  {
    slug: "nextjs-15-features",
    title: "Next.js 15の新機能まとめ",
    date: "2026-03-20",
    description:
      "Next.js 15で追加された主要な新機能を解説します。App RouterやServer Actionsの改善点について。",
    tags: ["Next.js", "React"],
    readingTime: "5 min",
  },
  {
    slug: "framer-motion-tips",
    title: "Framer Motionで作るスムーズなアニメーション",
    date: "2026-03-10",
    description:
      "Webサイトに滑らかなアニメーションを実装するためのFramer Motionの実践テクニックを紹介します。",
    tags: ["Animation", "React"],
    readingTime: "8 min",
  },
]

export function BlogPreview() {
  return (
    <SectionWrapper id="blog" title="Blog" subtitle="ブログ記事">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {previewPosts.map((post, index) => (
          <motion.a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-border-hover"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            {/* 日付と読了時間 */}
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime}
              </span>
            </div>

            {/* タイトル */}
            <h3 className="mt-3 text-lg font-bold text-text-primary group-hover:text-accent-blue transition-colors">
              {post.title}
            </h3>

            {/* 説明 */}
            <p className="mt-2 text-sm text-text-secondary line-clamp-2">
              {post.description}
            </p>

            {/* タグ */}
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </motion.a>
        ))}
      </div>

      {/* すべて見るリンク */}
      <div className="mt-10 text-center">
        <Button variant="secondary" href="/blog">
          すべての記事を見る
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  )
}
