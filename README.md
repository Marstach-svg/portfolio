# Portfolio

個人ポートフォリオサイト。Next.js 16 (App Router) + Tailwind CSS v4 + Framer Motion で構築。

## 技術スタック

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 (CSS-first 設定)
- Framer Motion (スクロールアニメーション、ページ遷移)
- MDX (next-mdx-remote/rsc) によるブログ機能
- Lucide React (アイコン)
- Geist + Noto Sans JP (フォント)
- pnpm (パッケージマネージャー)

## ページ構成

### トップページ (/)

1セクション1コンポーネントの構成で、縦スクロールで各セクションを閲覧できる。

- **Hero** -- フルスクリーン。名前と肩書きを大きなタイポグラフィで表示。グラデーション背景とグリッドパターン。
- **About** -- 自己紹介テキストとプロフィール画像。経験年数・プロジェクト数などの統計カード。
- **Skills** -- Bento Grid レイアウトでスキルカードを配置。カテゴリ (Frontend / Backend / Tools / Other) でフィルタリング可能。
- **Projects** -- プロジェクトカードのグリッド表示。カテゴリフィルタとモーダルによる詳細表示。GitHub / デモリンク付き。
- **Experience** -- 縦タイムライン形式の職歴表示。スクロールに連動してラインが伸びるアニメーション。
- **Blog** -- 最新3件のブログ記事プレビュー。
- **Contact** -- メールアドレス (コピーボタン付き)、SNS リンク、コンタクトフォーム。

### ブログ (/blog)

- 記事一覧ページと記事詳細ページ
- MDX ファイルによるコンテンツ管理
- 読了時間の自動算出
- カスタムコンポーネントによるスタイリング

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx              ルートレイアウト (フォント、メタデータ、Header/Footer)
│   ├── page.tsx                トップページ (全セクション呼び出し)
│   ├── globals.css             グローバルスタイル、Tailwind v4 デザイントークン
│   ├── sitemap.ts              サイトマップ生成
│   ├── robots.ts               robots.txt 生成
│   └── blog/
│       ├── page.tsx            ブログ一覧
│       ├── BlogList.tsx        一覧表示コンポーネント
│       └── [slug]/
│           ├── page.tsx        記事詳細
│           └── mdx-components.tsx  MDX カスタムコンポーネント
├── components/
│   ├── layout/
│   │   ├── Header.tsx          ナビゲーション (固定ヘッダー、モバイルメニュー)
│   │   └── Footer.tsx          フッター (コピーライト、トップに戻るボタン)
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Skills.tsx
│   │   ├── Projects.tsx
│   │   ├── Experience.tsx
│   │   ├── BlogPreview.tsx
│   │   └── Contact.tsx
│   └── ui/
│       ├── Button.tsx          ボタン (primary / secondary / ghost)
│       ├── Badge.tsx           技術タグ用バッジ
│       ├── Card.tsx            ホバーリフト付きカード
│       ├── BentoGrid.tsx       Bento Grid レイアウト
│       ├── Timeline.tsx        スクロール連動タイムライン
│       ├── SectionWrapper.tsx  スクロールフェードイン共通ラッパー
│       ├── CustomCursor.tsx    カスタムカーソル (PC のみ)
│       └── PageTransition.tsx  ページ遷移アニメーション
├── content/
│   ├── skills.ts               スキルデータ
│   ├── projects.ts             プロジェクトデータ
│   ├── experience.ts           経歴データ
│   └── blog/                   MDX ブログ記事
│       ├── hello-world.mdx
│       ├── nextjs-15-features.mdx
│       └── framer-motion-tips.mdx
├── lib/
│   ├── mdx.ts                  MDX 処理ユーティリティ
│   └── utils.ts                cn() ヘルパー
└── types/
    └── index.ts                型定義
```

## セットアップ

```bash
# 依存パッケージのインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバーの起動
pnpm start

# リント
pnpm lint
```

## コンテンツの編集

すべてのテキストはプレースホルダーになっている。以下のファイルを編集して自分の情報に差し替える。

| 対象 | ファイル |
|------|----------|
| 名前・肩書き | `src/components/sections/Hero.tsx` |
| 自己紹介文 | `src/components/sections/About.tsx` |
| スキル一覧 | `src/content/skills.ts` |
| プロジェクト一覧 | `src/content/projects.ts` |
| 職歴 | `src/content/experience.ts` |
| メールアドレス・SNS | `src/components/sections/Contact.tsx` |
| プロフィール画像 | `src/components/sections/About.tsx` 内の画像部分を `next/image` に差し替え |
| プロジェクト画像 | `public/images/projects/` に配置し `src/content/projects.ts` のパスを更新 |
| ブログ記事 | `src/content/blog/` に MDX ファイルを追加 |
| サイト名・説明文 | `src/app/layout.tsx` の `metadata` |
| サイトURL | `src/app/sitemap.ts` と `src/app/robots.ts` の `BASE_URL` |

## デザイン

- ダークモードベース (背景: #0a0a0a)
- アクセントカラー: ブルーからパープルへのグラデーション (#3b82f6 -> #8b5cf6)
- グレインノイズとグリッドパターンによるテクスチャ
- モバイルファーストのレスポンシブ対応

## デプロイ

Vercel での運用を前提としている。リポジトリを Vercel に接続すれば、追加の設定なしでデプロイできる。

## ライセンス

MIT
