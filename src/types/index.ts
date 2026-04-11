// プロジェクトの型定義

/** プロジェクトカード */
export type Project = {
  id: string
  title: string
  description: string
  longDescription: string
  thumbnail: string
  techTags: string[]
  category: "Web App" | "Mobile" | "OSS" | "Other"
  githubUrl?: string
  demoUrl?: string
  featured: boolean
}

/** 経歴タイムラインエントリ */
export type Experience = {
  id: string
  company: string
  role: string
  period: { start: string; end: string }
  summary: string
  tags: string[]
}

/** スキルカード */
export type Skill = {
  name: string
  icon: string
  category: "Frontend" | "Backend" | "Tools" | "Other"
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  size: "small" | "medium" | "large"
}

/** ブログ記事のフロントマター */
export type BlogPost = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  readingTime: string
}

/** ナビゲーションアイテム */
export type NavItem = {
  label: string
  href: string
}
