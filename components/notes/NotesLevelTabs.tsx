'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { NotesReader } from './NotesReader'
import { NoteCard } from './NoteCard'
import {
  LEVEL_META,
  NOTE_LEVELS,
  type NoteRow,
  type NoteLevel,
} from '@/lib/db-types'

interface NotesLevelTabsProps {
  notes: NoteRow[]
  chapterId: number
  language: 'hi' | 'en'
  userId?: string | null
  defaultLevel?: NoteLevel
}

export function NotesLevelTabs({
  notes,
  chapterId,
  language,
  userId,
  defaultLevel = 'basic',
}: NotesLevelTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // ✅ G1 FIX: Only PUBLISHED notes visible to users
  const notesByLevel = useMemo(
    () =>
      NOTE_LEVELS.reduce(
        (acc, lvl) => {
          acc[lvl] = notes.filter(
            (n) => n.level === lvl && n.status === 'published'
          )
          return acc
        },
        {} as Record<NoteLevel, NoteRow[]>
      ),
    [notes]
  )

  const availableLevels = useMemo(
    () => NOTE_LEVELS.filter((lvl) => notesByLevel[lvl].length > 0),
    [notesByLevel]
  )

  const urlLevel = searchParams.get('level') as NoteLevel | null

  const [activeLevel, setActiveLevel] = useState<NoteLevel>(() => {
    if (urlLevel && NOTE_LEVELS.includes(urlLevel)) return urlLevel
    return availableLevels[0] ?? defaultLevel
  })

  // ✅ G2 FIX: Reset activeLevel when chapter changes
  useEffect(() => {
    const newLevel =
      urlLevel && NOTE_LEVELS.includes(urlLevel)
        ? urlLevel
        : availableLevels[0] ?? defaultLevel
    setActiveLevel(newLevel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId])

  useEffect(() => {
    setMounted(true)
    if (!urlLevel && chapterId) {
      try {
        const saved = localStorage.getItem(
          'preferred-note-level'
        ) as NoteLevel | null
        if (saved && availableLevels.includes(saved)) {
          setActiveLevel(saved)
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId])

  const switchLevel = (lvl: NoteLevel) => {
    setActiveLevel(lvl)
    try {
      localStorage.setItem('preferred-note-level', lvl)
    } catch {}
    const url = new URL(window.location.href)
    url.searchParams.set('level', lvl)
    router.replace(url.pathname + url.search, { scroll: false })
  }

  if (!mounted) {
    return (
      <div className="space-y-5" aria-hidden="true">
        <div className="flex gap-2">
          {NOTE_LEVELS.map((lvl) => (
            <div
              key={lvl}
              className="h-11 w-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    )
  }

  if (availableLevels.length === 0) return null

  const activeNotes = notesByLevel[activeLevel]

  return (
    <div className="space-y-5">
      {/* Level tabs */}
      <div
        role="tablist"
        aria-label="Notes level"
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin"
      >
        {NOTE_LEVELS.map((lvl) => {
          const meta = LEVEL_META[lvl]
          const available = notesByLevel[lvl].length > 0
          const isActive = activeLevel === lvl

          return (
            <button
              key={lvl}
              role="tab"
              aria-selected={isActive}
              aria-controls={`level-panel-${lvl}`}
              disabled={!available}
              onClick={() => available && switchLevel(lvl)}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? `${meta.bg} ${meta.color} border-2 ${meta.border} shadow-sm`
                  : available
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-transparent'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800 cursor-not-allowed'
              }`}
            >
              <span className="text-base" aria-hidden="true">
                {meta.emoji}
              </span>
              <span>{meta.label}</span>
              {available && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20">
                  {notesByLevel[lvl].length}
                </span>
              )}
              {!available && (
                <span className="text-[10px] font-normal opacity-60">
                  soon
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active level content */}
      <div
        role="tabpanel"
        id={`level-panel-${activeLevel}`}
        aria-labelledby={`level-tab-${activeLevel}`}
      >
        {activeNotes.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3">
              <span className="text-3xl" role="img" aria-label="Coming soon">
                📝
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {LEVEL_META[activeLevel].label} notes coming soon
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              इस level के notes तैयार किए जा रहे हैं। तब तक दूसरा level try करें।
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {activeNotes.map((note) => (
              <NotesReader
                key={note.id}
                contentHtml={note.content_html || ''}
                title={note.topic}
                level={note.level}
                language={language}
                chapterId={chapterId}
                userId={userId}
              >
                <NoteCard note={note} language={language} />
              </NotesReader>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}