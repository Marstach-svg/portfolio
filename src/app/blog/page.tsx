import type { Metadata } from "next"
import { getAllPosts } from "@/lib/mdx"
import { BlogList } from "./BlogList"

export const metadata: Metadata = {
  title: "Blog",
  description: "技術記事やプロジェクトの振り返りを発信しています。",
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="mx-auto max-w-4xl px-6 pt-32 pb-24 md:px-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          <span className="gradient-text">Blog</span>
        </h1>
        <p className="mt-4 text-text-secondary">
          技術記事やプロジェクトの振り返り
        </p>
      </div>

      <BlogList posts={posts} />
    </div>
  )
}
