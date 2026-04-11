'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return

    if (isOpen) {
      gsap.fromTo(
        menu,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      )
    }
  }, [isOpen])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] mix-blend-difference"
      style={{ viewTransitionName: 'site-header' }}
    >
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link
          href="/"
          className="text-sm font-syne font-bold tracking-wider text-white uppercase"
          data-cursor="magnetic"
        >
          RYOKEN
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              {isHome ? (
                <a
                  href={item.href}
                  className="text-sm text-white/80 hover:text-white transition-colors font-space tracking-wide"
                  data-cursor="hover"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={`/${item.href}`}
                  className="text-sm text-white/80 hover:text-white transition-colors font-space tracking-wide"
                  data-cursor="hover"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <span
            className={`block w-6 h-px bg-white transition-transform duration-300 ${
              isOpen ? 'translate-y-[3.5px] rotate-45' : ''
            }`}
          />
          <span
            className={`block w-6 h-px bg-white transition-transform duration-300 ${
              isOpen ? '-translate-y-[3.5px] -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="md:hidden fixed inset-0 top-16 bg-stone-900/95 backdrop-blur-sm"
        >
          <ul className="flex flex-col items-center justify-center gap-8 pt-20">
            {navItems.map((item) => (
              <li key={item.href}>
                {isHome ? (
                  <a
                    href={item.href}
                    className="text-2xl font-syne text-white/90"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={`/${item.href}`}
                    className="text-2xl font-syne text-white/90"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
