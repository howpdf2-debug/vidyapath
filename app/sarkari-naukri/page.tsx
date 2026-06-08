'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Job {
  id: string
  org: string
  org_short: string
  title: string
  posts: number
  qual: string[]
  age_min: number | null
  age_max: number | null
  sal_min: number | null
  sal_max: number | null
  last_date: string
  apply_url: string
  status: string
  category: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedQual, setSelectedQual] = useState('all')

  const categories = [
    { id: 'all', label: 'सभी' },
    { id: 'railway', label: 'रेलवे' },
    { id: 'banking', label: 'बैंकिंग' },
    { id: 'ssc', label: 'SSC' },
    { id: 'teaching', label: 'शिक्षक' },
    { id: 'police', label: 'पुलिस' },
    { id: 'postal', label: 'डाक विभाग' },
  ]

  const qualifications = [
    { id: 'all', label: 'सभी' },
    { id: '10th', label: '10वीं पास' },
    { id: '12th', label: '12वीं पास' },
    { id: 'graduate', label: 'स्नातक' },
  ]

  useEffect(() => {
    fetchJobs()
  }, [selectedCategory, selectedQual])

  async function fetchJobs() {
    setLoading(true)
    let query = supabase.from('jobs').select('*').eq('status', 'open')

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory)
    }
    if (selectedQual !== 'all') {
      query = query.contains('qual', [selectedQual])
    }

    const { data, error } = await query.order('last_date', { ascending: true })
    if (!error && data) setJobs(data)
    setLoading(false)
  }

  function formatSalary(min: number | null, max: number | null) {
    if (!min && !max) return 'वेतन उपलब्ध नहीं'
    const minK = min ? Math.round(min / 1000) : ''
    const maxK = max ? Math.round(max / 1000) : ''
    if (minK && maxK) return `₹${minK}K–${maxK}K/माह`
    if (minK) return `₹${minK}K+/माह`
    if (maxK) return `₹${maxK}K तक/माह`
    return 'अधिसूचना देखें'
  }

  function daysLeft(lastDate: string) {
    const diff = Math.ceil((new Date(lastDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'बंद'
    if (diff === 0) return 'आखिरी दिन!'
    return `${diff} दिन शेष`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">सरकारी नौकरी</span>
      </div>

      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">सरकारी नौकरी 2025</h1>
        <p className="text-green-100 mt-1">रेलवे, बैंकिंग, SSC, पुलिस – प्रतिदिन नई अपडेट्स। सीधे आवेदन लिंक के साथ।</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-white p-3 rounded-xl text-center shadow-sm border">
          <div className="text-xl font-bold text-green-600">{jobs.length}+</div>
          <div className="text-xs text-gray-500">सक्रिय भर्तियाँ</div>
        </div>
        <div className="bg-white p-3 rounded-xl text-center shadow-sm border">
          <div className="text-xl font-bold text-purple-600">
            {jobs.reduce((sum, j) => sum + (j.posts || 0), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500">कुल पद</div>
        </div>
        <div className="bg-white p-3 rounded-xl text-center shadow-sm border">
          <div className="text-xl font-bold text-amber-600">
            {jobs.filter(j => new Date(j.last_date) > new Date() && new Date(j.last_date) < new Date(Date.now() + 7*86400000)).length}
          </div>
          <div className="text-xs text-gray-500">इस सप्ताह बंद होने वाली</div>
        </div>
        <div className="bg-white p-3 rounded-xl text-center shadow-sm border">
          <div className="text-xl font-bold text-red-600">
            {jobs.length ? new Date(Math.min(...jobs.map(j => new Date(j.last_date).getTime()))).toLocaleDateString('en-IN') : '-'}
          </div>
          <div className="text-xs text-gray-500">निकटतम अंतिम तिथि</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map(cat => (
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
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-500 mr-1">योग्यता:</span>
          {qualifications.map(q => (
            <button
              key={q.id}
              onClick={() => setSelectedQual(q.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedQual === q.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs grid */}
      {loading ? (
        <div className="text-center py-12">लोड हो रहा है...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border rounded-xl">
          कोई नौकरी नहीं मिली। फ़िल्टर बदलकर देखें।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition p-4">
              <div className="text-xs font-semibold text-purple-600 mb-1">{job.org}</div>
              <div className="font-bold text-gray-900 text-base mb-2">
                {job.title} — {job.posts?.toLocaleString('en-IN')} पद
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {job.qual?.map(q => (
                  <span key={q} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{q}</span>
                ))}
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  आयु: {job.age_min ?? '?'}–{job.age_max ?? '?'}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {formatSalary(job.sal_min, job.sal_max)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs font-semibold text-red-600">{daysLeft(job.last_date)}</span>
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="bg-green-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-green-700"
                >
                  आवेदन करें ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}