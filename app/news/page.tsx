'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface NewsItem {
  id: number
  title: string
  excerpt: string
  category: string
  badge: string | null
  icon: string | null
  is_live: boolean
  date: string | null
}

const categoryFilters = [
  { id: 'all', label: 'सभी' },
  { id: 'results', label: 'परिणाम' },
  { id: 'exams', label: 'परीक्षाएँ' },
  { id: 'jobs', label: 'सरकारी नौकरियाँ' },
  { id: 'cbse', label: 'CBSE/NCERT' },
  { id: 'career', label: 'करियर' },
]

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchNews()
  }, [selectedCategory])

  async function fetchNews() {
    setLoading(true)
    let query = supabase.from('news').select('*').order('created_at', { ascending: false })
    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory)
    }
    const { data, error } = await query
    if (!error && data) setNews(data)
    setLoading(false)
  }

  const getThumbBg = (category: string) => {
    const bgs: Record<string, string> = {
      results: 'bg-red-100',
      exams: 'bg-yellow-100',
      jobs: 'bg-green-100',
      cbse: 'bg-blue-100',
      career: 'bg-purple-100',
      ncert: 'bg-teal-100',
    }
    return bgs[category] || 'bg-gray-100'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">शिक्षा समाचार</span>
      </div>

      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">ताज़ा शिक्षा समाचार & अपडेट</h1>
        <p className="text-blue-100 mt-1">परिणाम, परीक्षाएँ, सरकारी नौकरियाँ – दैनिक ताज़ा सामग्री।</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categoryFilters.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">लोड हो रहा है...</div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border rounded-xl">कोई समाचार नहीं मिला।</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map(item => (
            <div key={item.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer">
              <div className={`h-28 flex items-center justify-center text-4xl ${getThumbBg(item.category)}`}>
                {item.icon || (item.category === 'results' ? '🏆' : '📰')}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_live ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.date && <span className="text-xs text-gray-500">{item.date}</span>}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{item.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}