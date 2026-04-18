import type { Profile } from '@/types'

export const profile: Profile = {
  name: 'Ryoken',
  title: 'Software Engineer',
  introduction: [
    'Webフロントエンドを中心に、ユーザー体験を大切にしたプロダクト開発に取り組んでいます。React / Next.js を使った開発が得意で、パフォーマンスとアクセシビリティの両立を意識しています。',
    'チーム開発ではコードレビューや技術選定にも積極的に関わり、開発プロセスの改善にも興味があります。',
  ],
  email: 'ryoken.102388@gmail.com',
  photo: '/images/profile/icon_SANDBOX.png',
  social: [
    { label: 'GitHub', href: 'https://github.com/Marstach-svg' },
    // { label: 'X', href: 'https://x.com' },
    // { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Qiita', href: 'https://qiita.com/Marstach' },
  ],
}
