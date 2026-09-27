'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import {
  Search,
  X,
  Clock,
  ListOrdered,
  BookOpen,
  SlidersHorizontal,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { NOTE_LEVELS, type NoteLevel } from '@/lib/db-types'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
type LevelCounts = Partial<Record<NoteLevel, number>> & {
  all?: number
}

interface Props {
  levelCounts: LevelCounts
  lang: 'hi' | 'en'
  totalCount?: number
  filteredCount?: number
}

// ─── Sort options ───
const SORT_OPTIONS = [
  { value: 'chapter', hi: 'अध्याय', en: 'Chapter', icon: BookOpen },
  { value: 'time', hi: 'समय', en: 'Time', icon: Clock },
  { value: 'notes', hi: 'नोट्स', en: 'Notes', icon: ListOrdered },
] as const

type SortValue = typeof SORT_OPTIONS[number]['value']
const DEFAULT_SORT: SortValue = 'chapter'

// ─── Level labels + gradients ───
const LEVEL_UI: Record<
  NoteLevel,
  {
    hi: string
    en: string
    emoji: string
    activeGradient: string
    activeShadow: string
  }
> = {
  basic: {
    hi: 'बेसिक',
    en: 'Basic',
    emoji: '🟢',
    activeGradient: 'from-emerald-500 to-green-500',
    activeShadow: 'shadow-emerald-500/30',
  },
  advance: {
    hi: 'एडवांस',
    en: 'Advance',
    emoji: '🟠',
    activeGradient: 'from-amber-500 to-orange-500',
    activeShadow: 'shadow-amber-500/30',
  },
  pro: {
    hi: 'प्रो',
    en: 'Pro',
    emoji: '🔴',
    activeGradient: 'from-rose-500 to-red-500',
    activeShadow: 'shadow-rose-500/30',
  },
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function NotesFilterBar({
  levelCounts,
  lang,
  totalCount = 0,
  filteredCount,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentLevel = sp.get('level') ?? 'all'
  const currentSort = (sp.get('sort') ?? DEFAULT_SORT) as SortValue
  const currentQ = sp.get('q') ?? ''

  // ─── Sync search input with URL (back/forward fix) ───
  const [searchValue, setSearchValue] = useState(currentQ)
  useEffect(() => {
    setSearchValue(currentQ)
  }, [currentQ])

  // ─── Cleanup debounce on unmount ───
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // ─── Esc to clear search ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        document.activeElement === searchInputRef.current
      ) {
        setSearchValue('')
        if (debounceRef.current) clearTimeout(debounceRef.current)
        pushParams({ q: '' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Safe param updater ───
  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(sp.toString())
      for (const [k, v] of Object.entries(updates)) {
        const isDefault =
          v === '' ||
          v === 'all' ||
          (k === 'sort' && v === DEFAULT_SORT)
        if (isDefault) next.delete(k)
        else next.set(k, v)
      }
      const qs = next.toString()
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, {
          scroll: false,
        })
      })
    },
    [sp, pathname, router]
  )

  const updateParam = useCallback(
    (key: string, value: string) => pushParams({ [key]: value }),
    [pushParams]
  )

  // ─── Debounced search ───
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushParams({ q: value.trim() })
    }, 350)
  }

  const clearSearch = () => {
    setSearchValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    pushParams({ q: '' })
    searchInputRef.current?.focus()
  }

  const resetAll = () => {
    const langParam = sp.get('lang')
    const next = new URLSearchParams()
    if (langParam) next.set('lang', langParam)
    const qs = next.toString()
    setSearchValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  // ─── Active filter detection ───
  const hasActiveFilter =
    currentLevel !== 'all' ||
    currentSort !== DEFAULT_SORT ||
    currentQ.trim() !== ''

  const t =
    lang === 'hi'
      ? {
          filter: 'स्तर',
          sort: 'क्रम',
          searchPlaceholder: 'अध्याय या विषय खोजें...',
          clear: 'साफ़ करें',
          all: 'सभी',
        }
      : {
          filter: 'Level',
          sort: 'Sort',
          searchPlaceholder: 'Search chapters or topics...',
          clear: 'Clear',
          all: 'All',
        }

  const showFilteredCount =
    filteredCount !== undefined && filteredCount !== totalCount

  return (
    <div
      role="region"
      aria-label={t.filter}
      className={`rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-opacity duration-200 ${
        isPending ? 'opacity-75' : 'opacity-100'
      }`}
    >
      {/* ═══ Search section ═══ */}
      <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="text"
            inputMode="search"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-12 pr-12 py-3 text-sm font-medium rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            aria-label={t.searchPlaceholder}
          />
          {isPending && searchValue ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5">
              <Loader2
                className="w-4 h-4 text-emerald-500 animate-spin"
                aria-hidden="true"
              />
            </div>
          ) : searchValue ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
              aria-label={t.clear}
            >
              <X
                className="w-4 h-4 text-gray-600 dark:text-gray-300"
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>

        {/* ─── Filter feedback (fixed Hindi word order + aria-live) ─── */}
        {showFilteredCount && (
          <p
            className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            aria-live="polite"
          >
            {lang === 'hi' ? (
              <>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {totalCount}
                </span>{' '}
                में से{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {filteredCount}
                </span>{' '}
                दिखा रहे हैं
              </>
            ) : (
              <>
                Showing{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {filteredCount}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                  {totalCount}
                </span>
              </>
            )}
          </p>
        )}
      </div>

      {/* ═══ Level section ═══ */}
      <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 mb-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <SlidersHorizontal
            className="w-4 h-4 text-emerald-500"
            aria-hidden="true"
          />
          {t.filter}
        </div>

        <div role="group" aria-label={t.filter} className="flex flex-wrap gap-2">
          {/* ─── All chip ─── */}
          <button
            type="button"
            onClick={() => updateParam('level', 'all')}
            aria-pressed={currentLevel === 'all'}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
              currentLevel === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:scale-[1.02]'
            }`}
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>{t.all}</span>
            {typeof levelCounts.all === 'number' && levelCounts.all > 0 && (
              <CountBadge
                count={levelCounts.all}
                active={currentLevel === 'all'}
              />
            )}
          </button>

          {/* ─── Level chips ─── */}
          {NOTE_LEVELS.map((lvl) => {
            const meta = LEVEL_UI[lvl as NoteLevel]
            const count = levelCounts[lvl as NoteLevel] ?? 0
            const active = currentLevel === lvl
            const disabled = count === 0

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => !disabled && updateParam('level', lvl)}
                disabled={disabled}
                aria-pressed={active}
                aria-label={`${lang === 'hi' ? meta.hi : meta.en} ${t.filter} — ${count}`}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
                  active
                    ? `bg-gradient-to-r ${meta.activeGradient} text-white shadow-lg ${meta.activeShadow} scale-105`
                    : disabled
                    ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-300 dark:text-gray-600 cursor-not-allowed border border-dashed border-gray-200 dark:border-gray-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:scale-[1.02]'
                }`}
              >
                <span
                  className="inline-flex items-center justify-center text-base leading-none"
                  style={{ fontSize: '16px', lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {meta.emoji}
                </span>
                <span>{lang === 'hi' ? meta.hi : meta.en}</span>
                {count > 0 && <CountBadge count={count} active={active} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══ Sort section ═══ */}
      <div className="p-3 sm:p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <ListOrdered
              className="w-4 h-4 text-emerald-500"
              aria-hidden="true"
            />
            {t.sort}
          </div>

          <div role="group" aria-label={t.sort} className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const active = currentSort === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateParam('sort', opt.value)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:scale-[1.02]'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {lang === 'hi' ? opt.hi : opt.en}
                </button>
              )
            })}
          </div>
        </div>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-all"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            {t.clear}
          </button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Sub-component: CountBadge
// ═══════════════════════════════════════════════════════════════
function CountBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold tabular-nums ${
        active
          ? 'bg-white/25 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      }`}
      aria-hidden="true"
    >
      {count}
    </span>
  )
}