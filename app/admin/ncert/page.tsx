'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { AdminHeader } from '@/components/AdminHeader'
import { ArrowLeft, Trash2, Edit } from 'lucide-react'

export default function AdminNcert() {
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [form, setForm] = useState({
    class: '',
    subject: '',
    chapter_num: '',
    chapter_title: '',
    pdf_url: '',
    language: 'english',
  })

  // Fetch chapters on mount
  useEffect(() => {
    fetchChapters()
  }, [])

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from('ncert')
      .select('*')
      .order('class', { ascending: true })
      .order('subject')
      .order('chapter_num')
    if (error) toast.error('Error fetching chapters')
    else setChapters(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      class: parseInt(form.class),
      subject: form.subject,
      chapter_num: parseInt(form.chapter_num),
      chapter_title: form.chapter_title,
      pdf_url: form.pdf_url || null,
      language: form.language,
    }

    let query
    if (editingId) {
      query = supabase.from('ncert').update(payload).eq('id', editingId)
    } else {
      query = supabase.from('ncert').insert([payload])
    }

    const { error } = await query
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(editingId ? 'Chapter updated!' : 'Chapter added!')
      setForm({ class: '', subject: '', chapter_num: '', chapter_title: '', pdf_url: '', language: 'english' })
      setEditingId(null)
      fetchChapters()
    }
    setLoading(false)
  }

  const deleteChapter = async (id: number) => {
    if (!confirm('Delete this chapter?')) return
    const { error } = await supabase.from('ncert').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Chapter deleted')
      fetchChapters()
    }
  }

  const editChapter = (ch: any) => {
    setEditingId(ch.id)
    setForm({
      class: ch.class.toString(),
      subject: ch.subject,
      chapter_num: ch.chapter_num.toString(),
      chapter_title: ch.chapter_title,
      pdf_url: ch.pdf_url || '',
      language: ch.language || 'english',
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <AdminHeader title="📚 Manage NCERT Chapters" />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Class (e.g., 10)"
            value={form.class}
            onChange={(e) => setForm({ ...form, class: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Subject (e.g., Mathematics)"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <input
            type="number"
            placeholder="Chapter Number"
            value={form.chapter_num}
            onChange={(e) => setForm({ ...form, chapter_num: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Chapter Title"
            value={form.chapter_title}
            onChange={(e) => setForm({ ...form, chapter_title: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <input
            type="text"
            placeholder="PDF URL (optional)"
            value={form.pdf_url}
            onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            {editingId ? 'Update Chapter' : 'Add Chapter'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm({ class: '', subject: '', chapter_num: '', chapter_title: '', pdf_url: '', language: 'english' })
              }}
              className="px-6 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-bold mb-4">Existing Chapters ({chapters.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="p-2">Class</th>
                <th className="p-2">Subject</th>
                <th className="p-2">Ch.</th>
                <th className="p-2">Title</th>
                <th className="p-2">Lang</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((ch) => (
                <tr key={ch.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-2">{ch.class}</td>
                  <td className="p-2">{ch.subject}</td>
                  <td className="p-2">{ch.chapter_num}</td>
                  <td className="p-2 max-w-xs truncate">{ch.chapter_title}</td>
                  <td className="p-2 capitalize">{ch.language || 'english'}</td>
                  <td className="p-2 text-right flex justify-end gap-2">
                    <button onClick={() => editChapter(ch)} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteChapter(ch.id)} className="text-red-600 hover:text-red-800" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {chapters.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No chapters found. Add one using the form above.</p>
        )}
      </div>
    </div>
  )
}