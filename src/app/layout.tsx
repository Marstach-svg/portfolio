import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Noto_Sans_JP } from "next/font/google"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CustomCursor } from "@/components/ui/CustomCursor"
import "./globals.css"

// フォント設定
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

// メタデータ
export const metadata: Metadata = {
  title: {
    template: "%s | Portfolio",
    default: "Your Name | Portfolio",
  },
  description:
    "フルスタックエンジニアのポートフォリオサイト。Web開発、モバイルアプリ、OSSプロジェクトを紹介しています。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "Portfolio",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable}`}
    >
      <body className="min-h-screen bg-background text-text-primary antialiased">
        {/* グレインノイズオーバーレイ */}
        <div className="grain-overlay" aria-hidden="true" />
        {/* カスタムカーソル（PCのみ） */}
        <CustomCursor />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
