'use client'

import { useState } from 'react'
import TextReveal from '@/components/ui/TextReveal'
import { profile } from '@/data/profile'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <section id="contact" className="py-32 px-6 md:px-12 lg:px-24" aria-label="Contact">
      <div className="max-w-4xl mx-auto text-center">
        <TextReveal
          tag="h2"
          className="text-4xl md:text-6xl lg:text-7xl font-syne font-extrabold mb-8"
          scrub={false}
          stagger={0.03}
          underwater
        >
          Let&apos;s work together
        </TextReveal>

        <TextReveal
          tag="p"
          className="text-lg font-noto mb-16 max-w-lg mx-auto"
          scrub
          underwater
        >
          お気軽にご連絡ください。新しいプロジェクトやコラボレーションのお話をお待ちしています。
        </TextReveal>

        {/* Email */}
        <div className="mb-12">
          <button
            onClick={copyEmail}
            className="inline-block text-xl md:text-2xl font-space font-medium border-b-2 border-sky-200/50 text-sky-100 pb-1 hover:border-sky-300 hover:text-white transition-colors"
            data-cursor="magnetic"
          >
            {copied ? 'Copied!' : profile.email}
          </button>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-8">
          {profile.social.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-space uppercase tracking-wider text-sky-300/60 hover:text-sky-100 transition-colors"
              data-cursor="magnetic"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-sky-300/15">
          <p className="text-xs text-sky-300/40 font-space">
            &copy; {new Date().getFullYear()} RYOKEN. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  )
}
