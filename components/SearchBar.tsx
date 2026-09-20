'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'chapter' | 'note'
  class: number
  subject: string
  chapter_num: number
  title: string
  language?: string
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const controller = { cancelled: false }

    const fetchResults = async () => {
      setLoading(true)
      try {
        // ✅ FIXED: chapter_notes has ncert_id — must JOIN ncert
        const [chaptersRes, notesRes] = await Promise.all([
          supabase
            .from('ncert')
            .select('class, subject, chapter_num, chapter_title, language')
            .or(`chapter_title.ilike.%${query}%,subject.ilike.%${query}%`)
            .limit(5),
          supabase
            .from('chapter_notes')
            .select(
              'topic, ncert!inner(class, subject, chapter_num, language)'
            )
            .ilike('topic', `%${query}%`)
            .limit(5),
        ])

        if (controller.cancelled) return

        const chapterResults: SearchResult[] = (chaptersRes.data || []).map(
          (c: any) => ({
            type: 'chapter',
            class: c.class,
            subject: c.subject,
            chapter_num: c.chapter_num,
            title: c.chapter_title || `Chapter ${c.chapter_num}`,
            language: c.language,
          })
        )

        const noteResults: SearchResult[] = (notesRes.data || []).map(
          (n: any) => ({
            type: 'note',
            class: n.ncert.class,
            subject: n.ncert.subject,
            chapter_num: n.ncert.chapter_num,
            title: n.topic,
            language: n.ncert.language,
          })
        )

        // Deduplicate by class+subject+chapter_num
        const seen = new Set<string>()
        const combined = [...chapterResults, ...noteResults].filter((r) => {
          const key = `${r.class}-${r.subject}-${r.chapter_num}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })

        setResults(combined.slice(0, 8))
        setIsOpen(true)
      } catch (err) {
        console.error('[search] Error:', err)
        setResults([])
      } finally {
        if (!controller.cancelled) setLoading(false)
      }
    }

    const timeout = setTimeout(fetchResults, 300)
    return () => {
      controller.cancelled = true
      clearTimeout(timeout)
    }
  }, [query])

  const handleResultClick = (item: SearchResult) => {
    const lang = item.language === 'hi' ? '?lang=hi' : ''
    router.push(
      `/ncert/${item.class}/${encodeURIComponent(item.subject)}/${item.chapter_num}${lang}`
    )
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        {loading ? (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-gray-400" />
        )}
        <input
          type="text"
          placeholder="Search chapters, topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="bg-transparent outline-none w-48 lg:w-64 text-sm"
          aria-label="Search"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-11 left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 z-50 max-h-80 overflow-y-auto">
          {results.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleResultClick(item)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <div className="flex items-center gap-2">
                {item.type === 'note' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 uppercase flex-shrink-0">
                    Note
                  </span>
                )}
                <span className="font-medium text-sm truncate">{item.title}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Class {item.class} • {item.subject} • Ch {item.chapter_num}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-11 left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 text-center">
          <p className="text-sm text-gray-500">No results found</p>
        </div>
      )}
    </div>
  )
}