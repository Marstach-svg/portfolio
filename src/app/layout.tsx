import type { Metadata } from 'next'
import { Syne, Space_Grotesk, Inter, Noto_Sans_JP } from 'next/font/google'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import PageTransition from '@/components/providers/PageTransition'
import CustomCursor from '@/components/ui/CustomCursor'
import Nav from '@/components/ui/Nav'
import './globals.css'

const syne = Syne({ variable: '--font-syne-var', subsets: ['latin'], weight: ['400', '600', '700', '800'] })
const space = Space_Grotesk({ variable: '--font-space-var', subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })
const inter = Inter({ variable: '--font-inter-var', subsets: ['latin'], weight: ['400', '500'] })
const notoSansJP = Noto_Sans_JP({ variable: '--font-noto-var', subsets: ['latin'], weight: ['400', '500', '700'] })

export const metadata: Metadata = {
  title: { template: '%s | RYOKEN', default: 'RYOKEN | Creative Developer' },
  description: 'フロントエンドエンジニアのポートフォリオ。WebGL、アニメーション、インタラクティブデザインを駆使した作品を紹介。',
  openGraph: {
    title: 'RYOKEN | Creative Developer',
    description: 'フロントエンドエンジニアのポートフォリオ',
    images: ['/og.jpg'],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${syne.variable} ${space.variable} ${inter.variable} ${notoSansJP.variable}`}
    >
      <body className="min-h-screen">
        <SmoothScrollProvider>
          <CustomCursor />
          <Nav />
          <PageTransition>
            <main>{children}</main>
          </PageTransition>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
