'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Presentation } from 'lucide-react'
import { SlideView } from './SlideView'
import type { NoteLevel } from '@/lib/db-types'

interface NotesReaderProps {
  contentHtml: string
  title: string
  level: NoteLevel
  language: 'hi' | 'en'
  chapterId: number
  userId?: string | null
  children: React.ReactNode
}

type ViewMode = 'scroll' | 'slide'

export function NotesReader({
  contentHtml,
  title,
  level,
  language,
  chapterId,
  userId,
  children,
}: NotesReaderProps) {
  const [mode, setMode] = useState<ViewMode>('slide')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('notes-view-mode') as ViewMode | null
      if (saved === 'scroll' || saved === 'slide') setMode(saved)
    } catch {}
  }, [])

  const switchMode = (newMode: ViewMode) => {
    setMode(newMode)
    try {
      localStorage.setItem('notes-view-mode', newMode)
    } catch {}
  }

  if (!mounted) {
    return <div className="min-h-[400px]" />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="View mode"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800"
        >
          <button
            role="tab"
            aria-selected={mode === 'scroll'}
            onClick={() => switchMode('scroll')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              mode === 'scroll'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Scroll
          </button>
          <button
            role="tab"
            aria-selected={mode === 'slide'}
            onClick={() => switchMode('slide')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              mode === 'slide'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" aria-hidden="true" />
            Slide
          </button>
        </div>
      </div>

      {mode === 'slide' ? (
        <SlideView
          contentHtml={contentHtml}
          title={title}
          level={level}
          language={language}
          chapterId={chapterId}
          userId={userId}
          onSwitchToScroll={() => switchMode('scroll')}
        />
      ) : (
        <div>{children}</div>
      )}
    </div>
  )
}