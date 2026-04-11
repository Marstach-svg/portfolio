import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/mdx"

// サイトのベースURL（デプロイ時に変更）
const BASE_URL = "https://your-portfolio.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  // ブログ記事のURL
  const blogUrls = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogUrls,
  ]
}
