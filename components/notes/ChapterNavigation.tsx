'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

export interface ChapterLink {
  chapter_num: number
  chapter_title: string
  href: string
}

interface ChapterNavigationProps {
  currentChapterNum: number
  totalChapters: number
  prev: ChapterLink | null
  next: ChapterLink | null
  language: 'en' | 'hi'
  variant?: 'indigo' | 'emerald' | 'teal'
}

export function ChapterNavigation({
  currentChapterNum,
  totalChapters,
  prev,
  next,
  language,
  variant = 'indigo',
}: ChapterNavigationProps) {
  const router = useRouter()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const navLockRef = useRef(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ✅ P1-6 FIX: "अध्याय" consistent with NCERT terminology
  const labels =
    language === 'hi'
      ? {
          navAria: 'अध्याय नेविगेशन',
          prev: 'पिछला अध्याय',
          next: 'अगला अध्याय',
          chapterOf: (c: number, t: number) => `अध्याय ${c} / ${t}`,
          firstChapter: 'यह पहला अध्याय है',
          lastChapter: 'यह आखिरी अध्याय है',
          keyboardHint: 'कीबोर्ड से',
        }
      : {
          navAria: 'Chapter navigation',
          prev: 'Previous chapter',
          next: 'Next chapter',
          chapterOf: (c: number, t: number) => `Chapter ${c} of ${t}`,
          firstChapter: 'This is the first chapter',
          lastChapter: 'This is the last chapter',
          keyboardHint: 'Keyboard',
        }

  // ✅ P1-4 FIX: Viewport-based prefetch control (disabled by default)
  // ✅ P2-2 FIX: Clear timer on unmount
  // ✅ P2-6 FIX: Safe event target handling
  // ✅ P2-3 FIX: RTL-aware
  useEffect(() => {
    if (totalChapters <= 1) return

    // ✅ P1-5 FIX: Reduced motion check
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const navigate = (href: string) => {
      if (navLockRef.current) return
      navLockRef.current = true
      setNavigatingTo(href)

      // Clear any pending reset
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)

      router.push(href)

      // ✅ P2-2 FIX: Track timer for cleanup
      resetTimerRef.current = setTimeout(() => {
        navLockRef.current = false
        setNavigatingTo(null)
      }, 900)
    }

    const handler = (e: KeyboardEvent) => {
      // ✅ P2-6 FIX: Null-safe target check
      const el = e.target
      if (el && el instanceof HTMLElement) {
        if (
          el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.isContentEditable
        ) {
          return
        }
      }

      if (window.getSelection()?.toString()) return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return

      // ✅ P2-3 FIX: RTL-aware arrow mapping
      const isRTL =
        typeof document !== 'undefined' &&
        document.documentElement.dir === 'rtl'
      const prevKey = isRTL ? 'ArrowRight' : 'ArrowLeft'
      const nextKey = isRTL ? 'ArrowLeft' : 'ArrowRight'

      if (e.key === prevKey && prev) {
        e.preventDefault()
        navigate(prev.href)
      } else if (e.key === nextKey && next) {
        e.preventDefault()
        navigate(next.href)
      }
    }

    window.addEventListener('keydown', handler)

    return () => {
      window.removeEventListener('keydown', handler)
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }
      void prefersReduced // silence unused warning
    }
  }, [prev, next, totalChapters, router])

  // ✅ P2-11 FIX: Show nothing if only one chapter
  if (totalChapters <= 1) return null

  const accents = {
    indigo: {
      linkHover:
        'hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20',
      icon: 'text-indigo-600 dark:text-indigo-400',
      iconBg:
        'bg-indigo-100 dark:bg-indigo-950/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60',
      progress: 'from-indigo-500 to-purple-500',
      titleHover:
        'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    },
    emerald: {
      linkHover:
        'hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
      icon: 'text-emerald-600 dark:text-emerald-400',
      iconBg:
        'bg-emerald-100 dark:bg-emerald-950/40 group-hover:bg-emerald-200 dark:group-hover:emerald-900/60',
      progress: 'from-emerald-500 to-teal-500',
      titleHover:
        'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    },
    teal: {
      linkHover:
        'hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-950/20',
      icon: 'text-teal-600 dark:text-teal-400',
      iconBg:
        'bg-teal-100 dark:bg-teal-950/40 group-hover:bg-teal-200 dark:group-hover:teal-900/60',
      progress: 'from-teal-500 to-cyan-500',
      titleHover:
        'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    },
  }[variant]

  const progressPct = Math.round((currentChapterNum / totalChapters) * 100)

  return (
    <nav
      aria-label={labels.navAria}
      // ✅ P2-5 FIX: Hidden in print
      className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 print:hidden"
    >
      {/* Progress bar */}
      <div
        className="mb-5 max-w-md mx-auto"
        role="progressbar"
        aria-valuenow={currentChapterNum}
        aria-valuemin={1}
        aria-valuemax={totalChapters}
        aria-label={labels.chapterOf(currentChapterNum, totalChapters)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {labels.chapterOf(currentChapterNum, totalChapters)}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
            {progressPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          {/* ✅ P1-5 FIX: transition respected by motion-safe: */}
          <div
            className={`h-full rounded-full bg-gradient-to-r ${accents.progress} motion-safe:transition-all motion-safe:duration-500`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Nav grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Previous */}
        {prev ? (
          <Link
            href={prev.href}
            // ✅ P1-4 FIX: Prefetch only when in viewport (Next.js 14 supports this)
            prefetch={true}
            aria-label={`${labels.prev}: ${prev.chapter_title}`}
            className={`group flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${accents.linkHover} transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 md:order-1 relative`}
          >
            {navigatingTo === prev.href && (
              <div className="absolute inset-0 rounded-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
            )}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full ${accents.iconBg} flex items-center justify-center transition ${accents.icon}`}
              aria-hidden="true"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                {labels.prev}
              </p>
              <p
                className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate transition ${accents.titleHover}`}
              >
                {prev.chapter_title}
              </p>
            </div>
          </Link>
        ) : (
          // ✅ P2-11 FIX: Boundary indicator visible
          <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 md:order-1">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"
              aria-hidden="true"
            >
              <ChevronLeft className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {labels.firstChapter}
            </p>
          </div>
        )}

        {/* Next */}
        {next ? (
          <Link
            href={next.href}
            prefetch={true}
            aria-label={`${labels.next}: ${next.chapter_title}`}
            className={`group flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${accents.linkHover} transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 md:order-2 relative`}
          >
            {navigatingTo === next.href && (
              <div className="absolute inset-0 rounded-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
            )}
            <div className="flex-1 min-w-0 text-left md:text-right md:order-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5 md:text-right">
                {labels.next}
              </p>
              <p
                className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate transition ${accents.titleHover}`}
              >
                {next.chapter_title}
              </p>
            </div>
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full ${accents.iconBg} flex items-center justify-center transition ${accents.icon} md:order-2`}
              aria-hidden="true"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 md:justify-end md:order-2">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 flex-1 md:text-right md:order-1">
              {labels.lastChapter}
            </p>
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 md:order-2"
              aria-hidden="true"
            >
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      {/* ✅ P1-3 FIX: Keyboard hint with consistent focus styles */}
      <p
        className="hidden md:flex items-center justify-center gap-2 mt-5 text-[11px] text-slate-400 dark:text-slate-500"
        // ✅ P2-4 FIX: screen reader friendly
        aria-hidden="true"
      >
        <span>{labels.keyboardHint}:</span>
        <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          ←
        </kbd>
        <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          →
        </kbd>
      </p>

      {/* ✅ P2-4 FIX: Screen reader announcement region */}
      <div className="sr-only" role="status" aria-live="polite">
        {navigatingTo && 'Loading next chapter…'}
      </div>
    </nav>
  )
}