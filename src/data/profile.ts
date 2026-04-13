import type { Profile } from '@/types'

export const profile: Profile = {
  name: '山田 太郎',
  nameEn: 'Taro Yamada',
  title: 'Frontend Engineer',
  introduction: [
    'Webフロントエンドを中心に、ユーザー体験を大切にしたプロダクト開発に取り組んでいます。React / Next.js を使った開発が得意で、パフォーマンスとアクセシビリティの両立を意識しています。',
    'チーム開発ではコードレビューや技術選定にも積極的に関わり、開発プロセスの改善にも興味があります。',
  ],
  email: 'your@email.com',
  photo: '/images/profile/me.svg',
  social: [
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'X', href: 'https://x.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Zenn', href: 'https://zenn.dev' },
  ],
}
