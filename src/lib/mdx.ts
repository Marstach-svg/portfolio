// MDX処理ユーティリティ

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"
import type { BlogPost } from "@/types"

// ブログ記事のディレクトリ
const BLOG_DIR = path.join(process.cwd(), "src/content/blog")

/** すべてのブログ記事のメタデータを取得（日付降順） */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"))

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "")
    const filePath = path.join(BLOG_DIR, filename)
    const source = fs.readFileSync(filePath, "utf-8")
    const { data, content } = matter(source)
    const stats = readingTime(content)

    return {
      slug,
      title: data.title ?? "",
      date: data.date ?? "",
      description: data.description ?? "",
      tags: data.tags ?? [],
      readingTime: stats.text,
    } satisfies BlogPost
  })

  // 日付降順でソート
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

/** スラッグからブログ記事のソースを取得 */
export function getPostBySlug(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const source = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(source)
  const stats = readingTime(content)

  return {
    meta: {
      slug,
      title: data.title ?? "",
      date: data.date ?? "",
      description: data.description ?? "",
      tags: data.tags ?? [],
      readingTime: stats.text,
    } satisfies BlogPost,
    content,
  }
}
