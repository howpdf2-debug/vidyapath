'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      const { data: chapters } = await supabase
        .from('ncert')
        .select('class, subject, chapter_num, chapter_title')
        .or(`chapter_title.ilike.%${query}%, subject.ilike.%${query}%`)
        .limit(5)

      const { data: notes } = await supabase
        .from('chapter_notes')
        .select('class, subject, chapter_num, topic')
        .ilike('topic', `%${query}%`)
        .limit(5)

      const combined = [...(chapters || []), ...(notes || [])].slice(0, 10)
      setResults(combined)
      setIsOpen(true)
    }

    const timeout = setTimeout(fetchResults, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const handleResultClick = (item: any) => {
    router.push(`/ncert/${item.class}/${encodeURIComponent(item.subject)}/${item.chapter_num}`)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search chapters, topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="bg-transparent outline-none w-48 lg:w-64 text-sm"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-10 left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 z-50 max-h-72 overflow-y-auto">
          {results.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleResultClick(item)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              {item.chapter_title ? (
                <div>
                  <span className="font-medium">{item.chapter_title}</span>
                  <span className="text-xs text-gray-500 ml-2">Class {item.class} {item.subject} Ch.{item.chapter_num}</span>
                </div>
              ) : (
                <div>
                  <span className="font-medium">{item.topic}</span>
                  <span className="text-xs text-gray-500 ml-2">Class {item.class} {item.subject} Ch.{item.chapter_num}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}