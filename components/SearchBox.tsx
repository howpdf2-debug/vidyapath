'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type SearchResult = {
  type: 'ncert' | 'job' | 'news'
  title: string
  subtitle: string
  href: string
}

export default function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const q = query.trim()

        const [ncertRes, jobsRes, newsRes] = await Promise.all([
          supabase
            .from('ncert')
            .select('chapter_title, class_num, subject')
            .ilike('chapter_title', `%${q}%`)
            .limit(4),
          supabase
            .from('jobs')
            .select('id, title, organization')
            .ilike('title', `%${q}%`)
            .limit(3),
          supabase
            .from('news')
            .select('id, title, category')
            .ilike('title', `%${q}%`)
            .limit(3),
        ])

        const combined: SearchResult[] = []

        ncertRes.data?.forEach((r) =>
          combined.push({
            type: 'ncert',
            title: r.chapter_title,
            subtitle: `Class ${r.class_num} · ${r.subject}`,
            href: `/chapter?class=${r.class_num}&subject=${encodeURIComponent(r.subject)}&chapter=${encodeURIComponent(r.chapter_title)}`,
          })
        )
        jobsRes.data?.forEach((r) =>
          combined.push({
            type: 'job',
            title: r.title,
            subtitle: r.organization ?? 'Sarkari Naukri',
            href: `/sarkari-naukri/${r.id}`,
          })
        )
        newsRes.data?.forEach((r) =>
          combined.push({
            type: 'news',
            title: r.title,
            subtitle: r.category ?? 'News',
            href: `/news`,
          })
        )

        setResults(combined)
        setOpen(combined.length > 0)
        setActiveIndex(-1)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && results[activeIndex]) {
        navigate(results[activeIndex].href)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  function navigate(href: string) {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  const typeIcon: Record<SearchResult['type'], string> = {
    ncert: '📖',
    job: '💼',
    news: '📰',
  }
  const typeLabel: Record<SearchResult['type'], string> = {
    ncert: 'NCERT',
    job: 'Naukri',
    news: 'News',
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xs sm:max-w-sm">
      {/* Input */}
      <div className="relative flex items-center">
        <span className="absolute left-3 text-gray-400 pointer-events-none text-sm select-none">
          🔍
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search chapters, jobs, news..."
          aria-label="Search VidyaPath"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-listbox"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {loading && (
          <span className="absolute right-3 text-gray-400 text-xs animate-pulse">
            ⏳
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <ul
          id="search-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
        >
          {results.map((r, i) => (
            <li
              key={i}
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => navigate(r.href)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                i === activeIndex
                  ? 'bg-blue-50 dark:bg-blue-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="mt-0.5 text-base">{typeIcon[r.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {r.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {r.subtitle}
                </p>
              </div>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded px-1.5 py-0.5 self-center flex-shrink-0">
                {typeLabel[r.type]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}