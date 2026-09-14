'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminHeader } from '@/components/AdminHeader'
import { ArrowLeft } from 'lucide-react'

export default function AdminRojgarSamachar() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    pdf_url: '',
    published_date: '',
    language: 'en',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('rojgar_samachar').insert({
      title: form.title,
      description: form.description,
      pdf_url: form.pdf_url,
      published_date: form.published_date,
      language: form.language,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('News added!')
      setForm({ title: '', description: '', pdf_url: '', published_date: '', language: 'en' })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back to Dashboard */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <AdminHeader title="📰 Manage Rojgar Samachar" />

      <form onSubmit={handleSubmit} className="space-y-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <input
          type="text"
          placeholder="Title (e.g., UPSC Civil Services 2026)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
          rows={3}
        />
        <input
          type="text"
          placeholder="PDF URL (Official link only)"
          value={form.pdf_url}
          onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="date"
          value={form.published_date}
          onChange={(e) => setForm({ ...form, published_date: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <select
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add News'}
        </button>
      </form>
    </div>
  )
}