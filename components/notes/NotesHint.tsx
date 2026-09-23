'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, X, ArrowRight } from 'lucide-react'

interface NotesHintProps {
  href: string
  count: number
  language: 'en' | 'hi'
  chapterId: string | number
}

const DISMISS_DAYS = 7

export function NotesHint({
  href,
  count,
  language,
  chapterId,
}: NotesHintProps) {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const key = `notes-hint-dismissed:${chapterId}`
      const raw = localStorage.getItem(key)
      if (raw) {
        const ts = parseInt(raw, 10)
        const maxAge = DISMISS_DAYS * 24 * 60 * 60 * 1000
        if (!isNaN(ts) && Date.now() - ts < maxAge) {
          return
        }
        localStorage.removeItem(key)
      }
      setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [chapterId])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(
        `notes-hint-dismissed:${chapterId}`,
        String(Date.now())
      )
    } catch {}
  }

  if (!mounted || !visible) return null

  const text =
    language === 'hi'
      ? `${count} detailed notes उपलब्ध हैं`
      : `${count} detailed notes available`

  const cta = language === 'hi' ? 'देखें' : 'View'

  return (
    <>
      {/* ✅ N1 FIX: Desktop sticky — top-14 mobile, top-16 desktop matches header */}
      {/* ✅ N3 FIX: z-30 (same as admin topbar, above breadcrumb) */}
      <div
        className="hidden md:block sticky top-16 z-30"
        role="complementary"
        aria-label="Notes available"
      >
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-800/60 backdrop-blur-sm shadow-sm">
          <BookOpen
            className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100 flex-1 truncate">
            📚 {text}
          </span>
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1"
          >
            {cta}
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="p-1 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Dismiss hint"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ✅ N2 FIX: Mobile — bottom-20 (well above scroll-to-top at bottom-6) */}
      <div
        className="md:hidden fixed bottom-20 left-4 right-4 z-30"
        role="complementary"
        aria-label="Notes available"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 shadow-2xl shadow-indigo-500/20 backdrop-blur-lg">
          <BookOpen
            className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0"
            aria-hidden="true"
          />
          <Link
            href={href}
            className="flex-1 text-sm font-semibold text-slate-900 dark:text-white truncate"
          >
            📚 {text}
          </Link>
          <Link
            href={href}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {cta}
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Dismiss hint"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  )
}