import type { Experience } from "@/types"

// 経歴データ
export const experiences: Experience[] = [
  {
    id: "exp-1",
    company: "株式会社テックカンパニー",
    role: "シニアフロントエンドエンジニア",
    period: { start: "2023年4月", end: "現在" },
    summary:
      "大規模Webアプリケーションのフロントエンドアーキテクチャをリード。React/Next.jsを用いたプロダクト開発、パフォーマンス最適化、チームメンバーの技術メンタリングを担当。",
    tags: ["React", "Next.js", "TypeScript", "チームリード"],
  },
  {
    id: "exp-2",
    company: "スタートアップ株式会社",
    role: "フルスタックエンジニア",
    period: { start: "2021年1月", end: "2023年3月" },
    summary:
      "SaaSプロダクトの0→1開発に従事。バックエンドAPI設計からフロントエンド実装、インフラ構築まで幅広く担当。アジャイル開発でスプリントを推進。",
    tags: ["Node.js", "React", "AWS", "PostgreSQL"],
  },
  {
    id: "exp-3",
    company: "Web制作会社",
    role: "フロントエンドエンジニア",
    period: { start: "2019年4月", end: "2020年12月" },
    summary:
      "企業のコーポレートサイトやLPの制作を担当。レスポンシブデザイン、アクセシビリティ対応、CMS構築の経験を積む。",
    tags: ["HTML/CSS", "JavaScript", "WordPress", "Figma"],
  },
]
