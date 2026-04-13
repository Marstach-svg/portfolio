import type { Project } from '@/types'

export const projects: Project[] = [
  {
    slug: 'ec-platform',
    title: 'ECサイトプラットフォーム',
    description: 'フルスタックECサイト。リアルタイム在庫管理と決済機能を実装。',
    thumbnail: '/images/projects/placeholder.svg',
    tags: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL'],
    challenge: '既存ECサイトのページ遷移が多く、購入完了までの離脱率が高い。',
    solution:
      'Next.js App RouterでSPAライクな購入フローを実装。SSR/SSGによるSEOとStripeでPCI DSS準拠の決済を実現。',
    outcome: '購入完了率30%向上、Lighthouseスコア95点達成。',
    links: { demo: 'https://example.com', github: 'https://github.com' },
    screenshots: [],
    year: 2024,
  },
  {
    slug: 'task-management',
    title: 'タスク管理アプリ',
    description: 'チーム向けカンバンボード。ドラッグ&ドロップとリアルタイム同期。',
    thumbnail: '/images/projects/placeholder.svg',
    tags: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
    challenge: 'チーム内のタスク管理が属人化していた。',
    solution:
      'カンバンボード形式のUIとWebSocketリアルタイム同期を実装。React + dnd-kitでD&D、Socket.ioで安定したリアルタイム通信。',
    outcome: 'チームで日常的に使用されるツールに。',
    links: { github: 'https://github.com' },
    screenshots: [],
    year: 2023,
  },
  {
    slug: 'portfolio-site',
    title: 'ポートフォリオサイト',
    description: 'WebGL・GSAPアニメーションを駆使したインタラクティブポートフォリオ。',
    thumbnail: '/images/projects/placeholder.svg',
    tags: ['Next.js', 'GSAP', 'OGL', 'Tailwind CSS'],
    challenge: '採用担当者の印象に残るユニークなポートフォリオが必要だった。',
    solution:
      '7つの先端グラフィック技術（WebGLシェーダー、パーティクル、カスタムカーソル等）を実装し、技術力を直接示すポートフォリオを構築。',
    outcome: '唯一無二のインタラクティブポートフォリオを実現。',
    links: { demo: 'https://example.com', github: 'https://github.com' },
    screenshots: [],
    year: 2026,
  },
  {
    slug: 'data-dashboard',
    title: 'リアルタイムダッシュボード',
    description:
      '時系列データの可視化とアラート機能を備えたBIダッシュボード。',
    thumbnail: '/images/projects/placeholder.svg',
    tags: ['React', 'D3.js', 'WebSocket', 'TimescaleDB'],
    challenge: '数百万行の時系列データをブラウザでスムーズに可視化する必要があった。',
    solution:
      'D3.jsとCanvasレンダリングを組み合わせ、データ集約とLOD (Level of Detail) を実装。WebSocketで差分更新。',
    outcome: '60fps描画を維持しつつ、数値データのリアルタイム監視を実現。',
    links: { github: 'https://github.com' },
    screenshots: [],
    year: 2023,
  },
  {
    slug: 'ai-chat',
    title: 'AIチャットアプリ',
    description:
      'LLM APIを活用した業務特化型チャットUI。ストリーミング対応。',
    thumbnail: '/images/projects/placeholder.svg',
    tags: ['Next.js', 'OpenAI API', 'Vercel AI SDK', 'Edge Runtime'],
    challenge:
      '長文のレスポンスでユーザーを待たせないインタラクションが必要だった。',
    solution:
      'Server-Sent Eventsとストリーミングレスポンスで逐次表示を実装。Edge Runtimeで低レイテンシ。',
    outcome: '初回表示まで200ms以内。会話体験の自然さで社内評価高。',
    links: { demo: 'https://example.com' },
    screenshots: [],
    year: 2024,
  },
  {
    slug: 'mobile-fitness',
    title: 'フィットネス記録アプリ',
    description:
      'トレーニング記録と進捗グラフ、PWA対応のモバイルファーストアプリ。',
    thumbnail: '/images/projects/placeholder.svg',
    tags: ['React Native', 'Expo', 'SQLite', 'PWA'],
    challenge: 'オフライン環境でも記録を取れる必要があった。',
    solution:
      'SQLiteローカルストレージ + バックグラウンド同期で、オフラインファーストなデータモデルを構築。',
    outcome: 'App Store / Google Play 両対応、1,000+ DL 達成。',
    links: { github: 'https://github.com' },
    screenshots: [],
    year: 2022,
  },
]
