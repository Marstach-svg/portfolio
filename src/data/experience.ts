import type { Experience } from '@/types'

export const experiences: Experience[] = [
  {
    id: 'exp-2',
    company: '株式会社KIYONO',
    companyEn: 'KIYONO Inc.',
    logo: '/images/logos/kiyono.png',
    role: 'ソフトウェアエンジニア (エンジニアユニット開発部門)',
    period: { start: '2025年5月', end: '現在' },
    summary:
      'エンジニアユニット開発部門のソフトウェアエンジニアとしてプロダクト開発に従事。慶應義塾大学を休学し長期インターンとしてフルタイムで参画。',
    tags: ['ソフトウェアエンジニア', '長期インターン', 'フルタイム'],
  },
  {
    id: 'exp-1',
    company: 'TOWN株式会社',
    companyEn: 'TOWN Inc.',
    logo: '/images/logos/town.png',
    role: 'ソフトウェアエンジニア (SaaS事業部)',
    period: { start: '2024年10月', end: '2025年6月' },
    summary:
      'SaaS事業部でソフトウェアエンジニアとして開発業務に従事した長期インターン。',
    tags: ['SaaS', 'ソフトウェアエンジニア', '長期インターン'],
  },
]
