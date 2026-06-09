'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, GraduationCap, BookOpen } from 'lucide-react'

// ✅ Sabhi nav links — apni site ke hisaab se
const navLinks = [
  { href: '/ncert',         label: 'NCERT',          emoji: '📚' },
  { href: '/cbse',          label: 'CBSE',            emoji: '📝' },
  { href: '/state-boards',  label: 'State Boards',    emoji: '🗺️' },
  { href: '/icse',          label: 'ICSE',            emoji: '🏫' },
  { href: '/results',       label: 'Results',         emoji: '🏆' },
  { href: '/sarkari-naukri',label: 'Sarkari Naukri',  emoji: '💼' },
  { href: '/career',        label: 'Career',          emoji: '🎯' },
  { href: '/news',          label: 'News',            emoji: '📰' },
  { href: '/worksheets',    label: 'Worksheets',      emoji: '📋' },
  { href: '/books',         label: 'Books',           emoji: '📖' },
  { href: '/tools',         label: 'Tools',           emoji: '🛠️' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // ✅ Route change par menu band ho jaaye
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // ✅ Mobile menu open hone par body scroll band karo
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // ✅ Escape key se menu band ho
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">

            {/* ✅ Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-indigo-600 dark:text-indigo-400 shrink-0"
              onClick={() => setMenuOpen(false)}
            >
              <GraduationCap size={22} className="shrink-0" />
              <span>VidyaPath</span>
            </Link>

            {/* ✅ Desktop nav — md screen se upar */}
            <nav
              className="hidden md:flex items-center gap-0.5 flex-wrap"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* ✅ Mobile hamburger button — sirf mobile par dikhega */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={menuOpen ? 'Menu band karo' : 'Menu kholo'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>

        {/* ✅ Mobile menu — hamburger click pe open hoga */}
        <div
          id="mobile-menu"
          className={`md:hidden transition-all duration-200 ${
            menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
          aria-hidden={!menuOpen}
        >
          <nav
            className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 max-h-[calc(100vh-56px)] overflow-y-auto"
            aria-label="Mobile navigation"
          >
            {/* ✅ Mobile mein 2-column grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span aria-hidden="true">{link.emoji}</span>
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* ✅ Mobile footer — optional branding */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 text-xs text-gray-400">
              <BookOpen size={12} />
              <span>VidyaPath — Free study portal for Indian students</span>
            </div>
          </nav>
        </div>
      </header>

      {/* ✅ Dark overlay — mobile menu ke peeche */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}