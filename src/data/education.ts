import type { Education } from '@/types'

export const educations: Education[] = [
  {
    id: 'edu-1',
    school: '慶應義塾大学',
    degree: '法学部 法律学科',
    period: { start: '2021年4月', end: '2027年3月 (卒業予定)' },
    summary:
      '法律学を専攻。2024年10月〜2025年10月は休学し、IT 学習と長期インターンでエンジニアとしての基礎を築いた。',
    tags: ['法律学', '休学中にエンジニア転向'],
  },
  {
    id: 'edu-2',
    school: 'RareTECH',
    degree: 'IT スクール (2年間カリキュラム)',
    period: { start: '2024年6月', end: '2026年6月' },
    summary:
      'Web 開発を中心に、フロントエンド・バックエンド・インフラまで一気通貫で学ぶ 2 年間のカリキュラムに所属。',
    tags: ['Web開発', 'フルスタック', '自走力'],
    kind: 'bubble',
  },
  {
    id: 'edu-3',
    school: '慶應義塾高等学校',
    degree: '普通科',
    period: { start: '2018年4月', end: '2021年3月' },
    summary: '高校受験を経て入学。',
    tags: ['高校受験'],
  },
  {
    id: 'edu-4',
    school: '目黒区立第八中学校',
    degree: '',
    period: { start: '2015年4月', end: '2018年3月' },
    summary: '',
    tags: [],
  },
]
