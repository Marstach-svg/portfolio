import type { Project } from "@/types"

// プロジェクトデータ
export const projects: Project[] = [
  {
    id: "project-1",
    title: "ECサイトプラットフォーム",
    description: "フルスタックECサイト。リアルタイム在庫管理と決済機能を実装。",
    longDescription:
      "Next.js 15とStripeを使用したフルスタックECプラットフォーム。Server Actionsによるリアルタイム在庫管理、Stripe決済連携、管理ダッシュボードを実装。PostgreSQLでデータ管理し、Vercelにデプロイ。",
    thumbnail: "/images/projects/placeholder.svg",
    techTags: ["Next.js", "TypeScript", "Stripe", "PostgreSQL", "Tailwind CSS"],
    category: "Web App",
    githubUrl: "https://github.com",
    demoUrl: "https://example.com",
    featured: true,
  },
  {
    id: "project-2",
    title: "タスク管理アプリ",
    description:
      "チーム向けプロジェクト管理ツール。ドラッグ&ドロップでタスクを整理。",
    longDescription:
      "React + Node.jsで構築したカンバンボード形式のタスク管理アプリ。WebSocketによるリアルタイム同期、ドラッグ&ドロップUI、チームメンバー招待機能を実装。",
    thumbnail: "/images/projects/placeholder.svg",
    techTags: ["React", "Node.js", "Socket.io", "MongoDB", "Docker"],
    category: "Web App",
    githubUrl: "https://github.com",
    featured: true,
  },
  {
    id: "project-3",
    title: "天気予報モバイルアプリ",
    description: "位置情報ベースの天気予報アプリ。7日間予報と気象アラート対応。",
    longDescription:
      "React Nativeで開発したクロスプラットフォーム天気予報アプリ。OpenWeather APIと連携し、現在地の天気情報をリアルタイム表示。プッシュ通知による気象警報機能も実装。",
    thumbnail: "/images/projects/placeholder.svg",
    techTags: ["React Native", "TypeScript", "Expo", "REST API"],
    category: "Mobile",
    githubUrl: "https://github.com",
    demoUrl: "https://example.com",
    featured: false,
  },
  {
    id: "project-4",
    title: "CLIツールキット",
    description: "開発効率を上げるCLIツール集。テンプレート生成やコード整形に対応。",
    longDescription:
      "Node.jsで構築したCLIツールキット。プロジェクトテンプレートの自動生成、コードフォーマッター、Git操作の自動化など、日常の開発作業を効率化するコマンド群を提供。",
    thumbnail: "/images/projects/placeholder.svg",
    techTags: ["Node.js", "TypeScript", "Commander.js", "Inquirer"],
    category: "OSS",
    githubUrl: "https://github.com",
    featured: false,
  },
  {
    id: "project-5",
    title: "ポートフォリオサイト",
    description: "このサイト。Next.js 15 + Framer Motionで構築したモダンなポートフォリオ。",
    longDescription:
      "Next.js 15のApp Routerを使用したポートフォリオサイト。Tailwind CSS v4によるスタイリング、Framer Motionによるアニメーション、MDXによるブログ機能を実装。Vercelにデプロイ。",
    thumbnail: "/images/projects/placeholder.svg",
    techTags: ["Next.js", "Tailwind CSS", "Framer Motion", "MDX"],
    category: "Web App",
    githubUrl: "https://github.com",
    demoUrl: "https://example.com",
    featured: true,
  },
]
