'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AdminHeader } from '@/components/AdminHeader'
import { ArrowLeft, Trash2, Edit, PlusCircle } from 'lucide-react'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export default function AdminNotes() {
  const [notes, setNotes] = useState<any[]>([])
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [form, setForm] = useState({
    class: '',
    subject: '',
    chapter_num: '',
    topic: '',
    difficulty_level: 'medium',
    content_html: '',
    order_index: 0,
  })

  useEffect(() => {
    fetchNotes()
    fetchChapters()
  }, [])

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/admin/notes')
      if (!res.ok) {
        const text = await res.text()
        console.error('API error response:', text)
        toast.error(`Server error: ${res.status}`)
        return
      }
      const result = await res.json()
      setNotes(result.data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error('Failed to fetch notes')
    }
  }

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from('ncert')
      .select('class, subject, chapter_num')
      .order('class')
      .order('subject')
      .order('chapter_num')
    if (error) toast.error('Error fetching chapters for dropdown')
    else setChapters(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      class: parseInt(form.class),
      subject: form.subject,
      chapter_num: parseInt(form.chapter_num),
      topic: form.topic,
      difficulty_level: form.difficulty_level,
      content_html: form.content_html,
      order_index: parseInt(form.order_index.toString()) || 0,
    }

    const url = '/api/admin/notes'
    const method = editingId ? 'PUT' : 'POST'
    const body = editingId ? { ...payload, id: editingId } : payload

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await res.json()

      if (res.ok) {
        toast.success(editingId ? 'Note updated!' : 'Note added!')
        setForm({
          class: '',
          subject: '',
          chapter_num: '',
          topic: '',
          difficulty_level: 'medium',
          content_html: '',
          order_index: 0,
        })
        setEditingId(null)
        fetchNotes()
      } else {
        toast.error(result.error || 'Failed to save note')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (id: number) => {
    if (!confirm('Delete this note?')) return
    const res = await fetch(`/api/admin/notes?id=${id}`, { method: 'DELETE' })
    const result = await res.json()
    if (res.ok) {
      toast.success('Note deleted')
      fetchNotes()
    } else {
      toast.error(result.error || 'Delete failed')
    }
  }

  const editNote = (n: any) => {
    setEditingId(n.id)
    setForm({
      class: n.class.toString(),
      subject: n.subject,
      chapter_num: n.chapter_num.toString(),
      topic: n.topic,
      difficulty_level: n.difficulty_level || 'medium',
      content_html: n.content_html || '',
      order_index: n.order_index || 0,
    })
  }

  // Build dropdown options
  const uniqueClasses = [...new Set(chapters.map(c => c.class))].sort((a, b) => a - b)
  const subjectsForClass = form.class
    ? [...new Set(chapters.filter(c => c.class === parseInt(form.class)).map(c => c.subject))]
    : []
  const chaptersForSubject = form.class && form.subject
    ? chapters.filter(c => c.class === parseInt(form.class) && c.subject === form.subject)
    : []

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <AdminHeader title="📝 Manage Chapter Notes" />

      {/* ========== Existing Notes Table ========== */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-8">
        <h2 className="text-lg font-bold mb-4">Existing Notes ({notes.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="p-2">Class</th>
                <th className="p-2">Subject</th>
                <th className="p-2">Ch.</th>
                <th className="p-2">Topic</th>
                <th className="p-2">Difficulty</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => (
                <tr
                  key={n.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="p-2">{n.class}</td>
                  <td className="p-2">{n.subject}</td>
                  <td className="p-2">{n.chapter_num}</td>
                  <td className="p-2 max-w-xs truncate">{n.topic}</td>
                  <td className="p-2 capitalize">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        n.difficulty_level === 'easy'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : n.difficulty_level === 'hard'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}
                    >
                      {n.difficulty_level}
                    </span>
                  </td>
                  <td className="p-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => editNote(n)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {notes.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No notes found. Add one using the form below.
          </p>
        )}
      </div>

      {/* ========== Add/Edit Note Form ========== */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          {editingId ? 'Edit Note' : 'Add New Note'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
              <select
                value={form.class}
                onChange={(e) => {
                  setForm({ ...form, class: e.target.value, subject: '', chapter_num: '' })
                }}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">Select Class</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value, chapter_num: '' })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                disabled={!form.class}
              >
                <option value="">Select Subject</option>
                {subjectsForClass.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chapter</label>
              <select
                value={form.chapter_num}
                onChange={(e) => setForm({ ...form, chapter_num: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                disabled={!form.subject}
              >
                <option value="">Select Chapter</option>
                {chaptersForSubject.map(ch => (
                  <option key={ch.chapter_num} value={ch.chapter_num}>
                    Chapter {ch.chapter_num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
              <input
                type="text"
                placeholder="e.g., Introduction to Real Numbers"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty Level</label>
              <select
                value={form.difficulty_level}
                onChange={(e) => setForm({ ...form, difficulty_level: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Order Index (optional – lower numbers appear first)
            </label>
            <input
              type="number"
              placeholder="0"
              value={form.order_index}
              onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes Content (HTML)</label>
            <div className="prose prose-lg max-w-none">
              <ReactQuill
                theme="snow"
                value={form.content_html}
                onChange={(content) => setForm({ ...form, content_html: content })}
                placeholder="Write notes in Hindi/English... (HTML supported)"
                className="h-64"
              />
            </div>
          </div>

          {/* ✅ FIX: Button now has more space above with mt-16 and a divider line */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {loading ? 'Saving...' : editingId ? 'Update Note' : 'Add Note'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm({
                      class: '',
                      subject: '',
                      chapter_num: '',
                      topic: '',
                      difficulty_level: 'medium',
                      content_html: '',
                      order_index: 0,
                    })
                  }}
                  className="px-6 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}