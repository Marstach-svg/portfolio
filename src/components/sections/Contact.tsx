"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Copy, Check, Code2, BookOpen, Link2 } from "lucide-react"
import { X as XIcon } from "lucide-react"
import { SectionWrapper } from "@/components/ui/SectionWrapper"
import { Button } from "@/components/ui/Button"

// SNSリンク
const socialLinks = [
  { icon: Code2, label: "GitHub", href: "https://github.com" },
  { icon: XIcon, label: "X / Twitter", href: "https://x.com" },
  { icon: Link2, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: BookOpen, label: "Zenn", href: "https://zenn.dev" },
]

const EMAIL = "your@email.com"

export function Contact() {
  const [copied, setCopied] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  // メールアドレスをクリップボードにコピー
  const copyEmail = async () => {
    await navigator.clipboard.writeText(EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // フォーム送信（プレースホルダー）
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Resend or EmailJS で送信処理を実装
    setSubmitted(true)
  }

  return (
    <SectionWrapper id="contact" title="Contact" subtitle="お問い合わせ">
      <div className="grid gap-12 md:grid-cols-2">
        {/* 左カラム: メールとSNS */}
        <div className="space-y-8">
          {/* メールアドレス */}
          <div>
            <p className="mb-3 text-sm text-text-muted">メールアドレス</p>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-accent-blue" />
              <span className="text-lg font-medium text-text-primary">
                {EMAIL}
              </span>
              <button
                onClick={copyEmail}
                className="rounded-lg border border-border p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
                aria-label="メールアドレスをコピー"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            {copied && (
              <motion.p
                className="mt-2 text-sm text-green-400"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                コピーしました！
              </motion.p>
            )}
          </div>

          {/* SNSリンク */}
          <div>
            <p className="mb-4 text-sm text-text-muted">SNS</p>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-text-muted transition-colors hover:border-border-hover hover:text-accent-blue"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* 右カラム: コンタクトフォーム */}
        <div>
          {submitted ? (
            <motion.div
              className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Check className="mb-4 h-12 w-12 text-green-400" />
              <h3 className="text-xl font-bold text-text-primary">
                送信しました！
              </h3>
              <p className="mt-2 text-text-secondary">
                お問い合わせありがとうございます。折り返しご連絡いたします。
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-border bg-surface p-6"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-text-secondary"
                >
                  お名前
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  placeholder="山田 太郎"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-text-secondary"
                >
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) =>
                    setFormState({ ...formState, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-text-secondary"
                >
                  メッセージ
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={(e) =>
                    setFormState({ ...formState, message: e.target.value })
                  }
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  placeholder="お気軽にメッセージをお送りください"
                />
              </div>
              <Button type="submit" className="w-full">
                <Mail className="h-4 w-4" />
                送信する
              </Button>
            </form>
          )}
        </div>
      </div>
    </SectionWrapper>
  )
}
