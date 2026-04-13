import type { Education } from '@/types'

export const educations: Education[] = [
  {
    id: 'edu-1',
    school: '〇〇大学 大学院',
    degree: '情報工学研究科 修士課程',
    period: { start: '2017年4月', end: '2019年3月' },
    summary:
      'Webシステム・HCI分野で研究に従事。ユーザー体験とパフォーマンス最適化をテーマに修士論文を執筆。',
    tags: ['HCI', 'Web Systems', '研究'],
  },
  {
    id: 'edu-2',
    school: '〇〇大学',
    degree: '工学部 情報工学科',
    period: { start: '2013年4月', end: '2017年3月' },
    summary:
      'コンピュータサイエンスの基礎 (アルゴリズム、データ構造、ネットワーク) を学習。在学中にWeb開発のインターンを経験。',
    tags: ['CS基礎', 'Web開発', 'インターン'],
  },
]
