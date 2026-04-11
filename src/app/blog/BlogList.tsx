"use client"

import { motion } from "framer-motion"
import { Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import type { BlogPost } from "@/types"

type BlogListProps = {
  posts: BlogPost[]
}

/** ブログ記事一覧 */
export function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-text-muted">まだ記事がありません。</p>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <motion.a
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group block rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-border-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          whileHover={{ y: -2 }}
        >
          {/* メタ情報 */}
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
          <h2 className="mt-2 text-xl font-bold text-text-primary group-hover:text-accent-blue transition-colors">
            {post.title}
          </h2>

          {/* 説明 */}
          <p className="mt-2 text-sm text-text-secondary">
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
  )
}
