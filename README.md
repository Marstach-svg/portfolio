# Portfolio -- ジブリの図書館

ジブリ映画のような世界観と大きな図書館を探索する体験を融合させたポートフォリオサイト。スクロールすると図書館の中を歩き回るように各セクションが展開する。

## 技術スタック

- Next.js 16 (App Router, TypeScript, Static Export)
- Tailwind CSS v4
- GSAP + ScrollTrigger (スクロール連動アニメーション)
- Framer Motion (UIトランジション)
- Lucide React
- Playfair Display + Noto Serif JP + Inter
- pnpm
- Cloudflare Pages対応 (output: 'export')

## スクロール体験

スクロール = 図書館を歩く体験。GSAP ScrollTrigger の pin + scrub でスクロール量に連動したアニメーションを実現。

| セクション | 図書館の場所 | アニメーション |
|---|---|---|
| Hero | 図書館の入口 | 木の扉がスクロールで左右に開く (pin + scrub) |
| About | 閲覧室 | 額縁写真 + テキストが stagger フェードイン |
| Skills | 魔法の書棚 | 本が1冊ずつ棚から飛び出す (stagger) |
| Projects | 研究室のデスク | ポラロイド風カードが回転しながら置かれる |
| Experience | 年代記の巻物 | タイムラインの線がスクロールで伸びる (scrub) |
| Contact | 図書館の受付 | 来館者カード風メール表示 |

## デザイン

- カラー: アイボリー (#F5F0E8) 背景、こげ茶 (#2C1810) テキスト
- アクセント: フォレストグリーン (#4A7C59) + ゴールド (#D4A843)
- 紙テクスチャ + 水彩風グラデーション
- Playfair Display (セリフ見出し) + Noto Serif JP (明朝体本文) + Inter (UI)
- 葉っぱのパララックス浮遊要素
- 右端にスクロール進捗インジケーター

## セットアップ

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

## コンテンツの編集

| 対象 | ファイル |
|------|----------|
| 名前・肩書き・SNS | `src/content/profile.ts` |
| スキル | `src/content/skills.ts` |
| プロジェクト | `src/content/projects.ts` |
| 職歴 | `src/content/experience.ts` |
| サイト名 | `src/app/layout.tsx` の metadata |

## ライセンス

MIT
