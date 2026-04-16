import type { Project } from '@/types'

export const projects: Project[] = [
  {
    slug: 'ideaxis',
    title: 'Ideaxis',
    description:
      'アバターとのチャットでアイデアを発散・収束させるブレストアプリ。ハッカソンで優秀賞受賞。',
    thumbnail: '/images/projects/Ideaxis.png',
    tags: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'Hono'],
    challenge:
      'アイデア出しの会議では発散と収束の切り替えが難しく、議論が散漫になりがちだった。',
    solution:
      'アバターとのチャットUIでアイデアを引き出し、ドキュメントアップロード→付箋化したカンバンボード→カテゴリ分けという流れで整理。要件定義書・フローチャート・UIイメージまで自動生成し、発散から収束を一気通貫で支援。',
    outcome:
      '2026年 Progate主催 AWSハッカソンで優秀賞を受賞。チャット機能のフロント・バックを担当。',
    links: { github: 'https://github.com/Ryomachi/Ideaxis' },
    screenshots: [],
    year: 2026,
  },
  {
    slug: 'maple',
    title: 'maple',
    description:
      '地図上に旅行先のピンを刺して、行った場所・行ってない場所を可視化する旅行ログアプリ。',
    thumbnail: '/images/projects/maple.png',
    tags: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Hono'],
    challenge:
      '旅行の記録が写真やメモに散在し、自分がどこへ行ったかを俯瞰できなかった。',
    solution:
      'マップ上にピンを刺すだけで訪問履歴を残せるUIを設計。Next.js + Hono構成で軽量に実装し、一目で行動範囲を把握できるようにした。',
    outcome: '現在開発中の個人プロジェクト。',
    links: { github: 'https://github.com/Marstach-svg/maple' },
    screenshots: [],
    year: 2026,
  },
  {
    slug: 'mimemo',
    title: 'mimemo',
    description:
      '会議音声をリアルタイムで文字起こしし、議事録として保存・管理・出力できるアプリ。',
    thumbnail: '/images/projects/mimemo.png',
    tags: ['Python', 'Django', 'Tailwind CSS', 'SQLite'],
    challenge:
      '会議の議事録を手作業で取るのが大変で、議論への集中を妨げていた。',
    solution:
      'ブラウザで動作するリアルタイム文字起こしと、内容の保存・管理・議事録出力機能を実装。自分専用のためSQLiteで軽量に構築。',
    outcome:
      'Claude Codeを使い始めてすぐに作った、初めてAIエージェントと共に作り上げた個人アプリ。',
    links: { github: 'https://github.com/Marstach-svg/mimemo' },
    screenshots: [],
    year: 2025,
  },
  {
    slug: 'sandbox',
    title: 'SandBox',
    description:
      '文系出身エンジニアのための情報共有コミュニティアプリ。初めて自力で作ったWebアプリ。',
    thumbnail: '/images/projects/SandBox.png',
    tags: ['Python', 'Flask', 'HTML', 'Bootstrap', 'MySQL'],
    challenge:
      '文系学部からエンジニアを目指す過程で、同じ境遇向けの情報が圧倒的に少なかった。',
    solution:
      'テックブログ・YouTube・SNSに助けられた経験から、文系エンジニア向けの情報が集まるコミュニティを設計。Flask + MySQLで基礎から構築した。',
    outcome:
      'AIエージェントに頼らず、自力で最後まで作り切った初めてのアプリ。Web開発の原体験となった。',
    links: { github: 'https://github.com/Marstach-svg/SandBox' },
    screenshots: [],
    year: 2024,
  },
  {
    slug: 'studyhub',
    title: 'StudyHub',
    description:
      '学習場所の検索・学習内容の管理・学習時間の記録を1つにまとめた学習プラットフォーム。',
    thumbnail: '/images/projects/StudyHub.png',
    tags: ['Python', 'Django', 'JavaScript', 'Tailwind CSS', 'MySQL'],
    challenge:
      '学習場所探し・進捗管理・時間計測で複数のツールを使い分けるのが煩雑だった。',
    solution:
      '近隣の学習場所検索、学習内容・時間の管理を1つのアプリに統合。フロント・バック両方を担当し、特にマップ機能の実装をリード。',
    outcome:
      'ITスクールRareTECH主催ハッカソンでチーム開発したアプリ。',
    links: { github: 'https://github.com/Hackathon-Practice-D/StudyHub' },
    screenshots: [],
    year: 2025,
  },
  {
    slug: 'raretech-link',
    title: 'RareTECH Link',
    description:
      '受講生のテックブログをXへ自動投稿し、クリック率・CVRを分析する運営者向け分析アプリ。',
    thumbnail: '/images/projects/RareTECH%20Link.png',
    tags: ['React', 'JavaScript', 'Tailwind CSS', 'Bun', 'Vite', 'Biome', 'Python', 'FastAPI'],
    challenge:
      '受講生のQiita投稿からスクール入会までのファネルで、どこがボトルネックか定量的に把握できていなかった。',
    solution:
      'Qiitaのテックブログを自動でX投稿し、クリック率・いいね数・CVRを測定。ファネル分析で離脱要因を可視化する運営者向けダッシュボードを設計。フロントエンドを担当。',
    outcome:
      'RareTECHチャレンジコース（買い取り提案型ハッカソン）で開発。費用対効果の見積りとLLMO時代への対応という学びを得た。',
    links: { github: 'https://github.com/Challenge-Course-Summer-2025/raretech-ui' },
    screenshots: [],
    year: 2025,
  },
  {
    slug: 'bartender-confidant',
    title: 'bartender confidant',
    description:
      'アバターとの会話で社内のお困りごと・ニーズを聞き取り、Notion DBに蓄積するヒアリングアプリ。',
    thumbnail: '/images/projects/bartendar%20confidant.png',
    tags: ['React', 'TypeScript', 'Notion API'],
    challenge:
      '社内のお困りごとや要望が拾いきれず、改善サイクルを回しづらかった。',
    solution:
      'バーテンダー風のアバターとの会話形式で心理的ハードルを下げつつヒアリングを実施。得られた内容はNotionデータベースへ自動で蓄積し、後から分析できるようにした。',
    outcome:
      'インターン先にてアプリ側を一人で担当し、リリースまで完遂。',
    links: {},
    screenshots: [],
    year: 2025,
  },
]
