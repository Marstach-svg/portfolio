# Portfolio

インタラクティブな WebGL 演出を備えたクリエイティブ・テック・ポートフォリオ。Hero からスクロールすると波が立ち上がり、水中に潜って潜水艦が各コンテンツを案内する体験型サイト。

## 技術スタック

- **Next.js 16** (App Router, TypeScript, Static Export)
- **Tailwind CSS v4** (CSS-first config)
- **GSAP + ScrollTrigger** — スクロール連動アニメーション
- **Three.js** — WebGL シェーダー (波, 泡, パーティクル, 画像歪み) + 3D 潜水艦モデル
- **Lenis** — 慣性スムーズスクロール
- **pnpm**
- **Cloudflare Pages** 対応 (`output: 'export'`)

## 実装されている演出

| # | 技術 | コンポーネント |
|---|------|---------------|
| 1 | WebGL シェーダー (画像ディストーション + 色収差) | `webgl/ImagePlane.tsx` |
| 2 | テキストアニメーション (SplitText + スクロール連動) | `ui/TextReveal.tsx` |
| 3 | カスタムカーソル (dot + ring + magnetic) | `ui/CustomCursor.tsx` |
| 4 | スムーズスクロール (Lenis + GSAP ticker) | `providers/SmoothScrollProvider.tsx` |
| 5 | パーティクルフィールド (Hero 背景) | `webgl/ParticleField.tsx` |
| 6 | ページ遷移アニメーション (オーバーレイワイプ) | `providers/PageTransition.tsx` |
| 7 | 波のシーン遷移 (Hero → 水中) | `webgl/WaterScene.tsx` |
| 8 | 水中の泡 (screen-space NDC) | `webgl/BubbleField.tsx` |
| 9 | R の文字 → Three.js 3D 潜水艦モーフィング + セクション案内 | `ui/HeroFish.tsx` |

## スクロール体験

| スクロール位置 | 演出 |
|---|---|
| Hero | RYOKEN タイトル + パーティクル + 下に「Scroll」インジケーター |
| Hero 10% | 波が画面下から立ち上がり始める、R が潜水艦に変化 |
| Hero 100% | 波が画面全体を覆い、水中へ。潜水艦は画面下付近に潜航 |
| About | 潜水艦が画面右から About を紹介、泡が浮上 |
| Projects | 潜水艦が画面左に移動して反転、Projects を紹介 |
| Contact | 潜水艦が画面右に戻って反転、Contact を紹介 |

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── projects/[slug]/page.tsx
├── components/
│   ├── providers/          # SmoothScroll, PageTransition
│   ├── sections/           # Hero, About, Projects, Contact
│   ├── ui/                 # Nav, CustomCursor, TextReveal, HeroFish, etc
│   └── webgl/              # WaterScene, BubbleField, ParticleField, ImagePlane, WaterBackground
├── data/                   # profile, projects, skills, experience
├── hooks/                  # useMediaQuery, useReducedMotion
├── lib/                    # utils
└── types/                  # TypeScript types
```

## デザイン

- **カラーパレット** (水上): `#FAFAF9` 背景, `#1C1917` テキスト, `#78716C` muted, `#2563EB` accent
- **カラーパレット** (水中): `#0a1a3a` → `#02081a` のグラデーション, スカイブルー系テキスト
- **フォント**: Syne (英字タイトル) + Space Grotesk (英字本文) + Inter (UI) + Noto Sans JP (日本語)
- **波のシェーダー**: multi-frequency sine waves + caustics + light rays + foam crest
- **泡**: screen-space NDC 6 個、細い輪郭 + 立体的ハイライト (二乗スケールでメリハリ)

## セットアップ

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # static export to out/
pnpm lint
```

## コンテンツの編集

| 対象 | ファイル |
|------|----------|
| 名前・肩書き・SNS | `src/data/profile.ts` |
| スキル | `src/data/skills.ts` |
| プロジェクト | `src/data/projects.ts` |
| 職歴 | `src/data/experience.ts` |
| サイト名 / metadata | `src/app/layout.tsx` |

## パフォーマンス & アクセシビリティ

- WebGL コンポーネントは `dynamic(..., { ssr: false })` で遅延ロード
- `prefers-reduced-motion` で全アニメーションを無効化
- カスタムカーソルは `md:` ブレークポイント以上のみ
- WebGL キャンバスに `role="img"` + `aria-label`
- Static Export + Cloudflare Pages 対応 (`_headers`, `_redirects`)

## ライセンス

MIT
