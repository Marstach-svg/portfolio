import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import { getAllPosts, getPostBySlug } from "@/lib/mdx"
import { Badge } from "@/components/ui/Badge"
import { mdxComponents } from "./mdx-components"

type Props = {
  params: Promise<{ slug: string }>
}

// 静的パラメータ生成
export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

// 動的メタデータ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: "Not Found" }

  return {
    title: post.meta.title,
    description: post.meta.description,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 pt-32 pb-24 md:px-12">
      {/* 戻るリンク */}
      <a
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        記事一覧に戻る
      </a>

      {/* ヘッダー */}
      <header className="mb-12">
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {post.meta.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {post.meta.readingTime}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          {post.meta.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.meta.tags.map((tag: string) => (
            <Badge key={tag} variant="accent">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      {/* 本文 */}
      <div className="prose-custom">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>
    </article>
  )
}
