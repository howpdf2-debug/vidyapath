'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AdminHeader } from '@/components/AdminHeader'
import {
  ArrowLeft, Trash2, Edit, PlusCircle, Search, X,
  Save, AlertCircle, FileText, RefreshCw, Languages,
  Copy, Eye, Filter, AlertTriangle, Loader2, CheckCircle2,
} from 'lucide-react'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════
interface NoteRow {
  id: number
  ncert_id: number
  topic: string
  content_html: string
  content_excerpt: string
  content_length: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  order_index: number
  created_at: string
  ncert?: {
    id: number
    class: number
    subject: string
    chapter_num: number
    chapter_title: string
    language: string
  } | null
}

interface ChapterOpt {
  class: number
  subject: string
  chapter_num: number
  language: string
}

interface FormState {
  class: string
  subject: string
  chapter_num: string
  language: 'en' | 'hi'
  topic: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  content_html: string
  order_index: number
}

const INITIAL_FORM: FormState = {
  class: '',
  subject: '',
  chapter_num: '',
  language: 'en',
  topic: '',
  difficulty_level: 'medium',
  content_html: '',
  order_index: 0,
}

const MAX_TOPIC_LENGTH = 300
const MAX_CONTENT_LENGTH = 500_000
const AUTOSAVE_KEY = 'vidyapath-admin-notes-draft'

// ═══════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════
export default function AdminNotes() {
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [chapters, setChapters] = useState<ChapterOpt[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<NoteRow | null>(null)
  const [classFilter, setClassFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'topic'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ═══════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    fetchNotes()
    fetchChapters()
    restoreDraft()
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  // Autosave
  useEffect(() => {
    if (!form.topic && !form.content_html && !editingId) return

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(form))
      } catch {}
    }, 1500)

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [form, editingId])

  // ═══════════════════════════════════════════════════════
  // FETCH
  // ═══════════════════════════════════════════════════════
  const fetchNotes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notes?limit=200')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || `Server error: ${res.status}`)
        return
      }
      const result = await res.json()
      setNotes(result.data || [])
    } catch {
      toast.error('Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from('ncert')
      .select('class, subject, chapter_num, language')
      .gte('class', 6)
      .lte('class', 12)
      .order('class')
      .order('subject')
      .order('chapter_num')

    if (error) {
      toast.error('Error fetching chapters')
    } else {
      setChapters((data || []) as ChapterOpt[])
    }
  }

  // ═══════════════════════════════════════════════════════
  // DRAFT
  // ═══════════════════════════════════════════════════════
  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY)
      if (!raw) return

      const draft = JSON.parse(raw) as FormState
      if (!draft.topic && !draft.content_html) return

      setForm(draft)
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm">Draft restore kiya?</span>
            <button
              onClick={() => {
                setForm(INITIAL_FORM)
                localStorage.removeItem(AUTOSAVE_KEY)
                toast.dismiss(t.id)
              }}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Clear
            </button>
          </div>
        ),
        { duration: 8000 }
      )
    } catch {}
  }

  const clearDraft = () => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY)
    } catch {}
  }

  // ═══════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.topic.trim()) {
      toast.error('Topic required')
      return
    }

    if (!form.content_html.trim() || form.content_html === '<p><br></p>') {
      toast.error('Content required')
      return
    }

    setSaving(true)

    const payload = {
      class: form.class,
      subject: form.subject,
      chapter_num: form.chapter_num,
      language: form.language,
      topic: form.topic.trim(),
      difficulty_level: form.difficulty_level,
      content_html: form.content_html,
      order_index: form.order_index,
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
        setForm(INITIAL_FORM)
        setEditingId(null)
        setShowPreview(false)
        clearDraft()
        fetchNotes()
      } else {
        toast.error(result.error || 'Failed to save note')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const editNote = (n: NoteRow) => {
    setEditingId(n.id)
    setForm({
      class: n.ncert?.class?.toString() || '',
      subject: n.ncert?.subject || '',
      chapter_num: n.ncert?.chapter_num?.toString() || '',
      language: (n.ncert?.language as 'en' | 'hi') || 'en',
      topic: n.topic,
      difficulty_level: n.difficulty_level || 'medium',
      content_html: n.content_html || '',
      order_index: n.order_index || 0,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const duplicateNote = (n: NoteRow) => {
    setEditingId(null)
    setForm({
      class: n.ncert?.class?.toString() || '',
      subject: n.ncert?.subject || '',
      chapter_num: n.ncert?.chapter_num?.toString() || '',
      language: (n.ncert?.language as 'en' | 'hi') || 'en',
      topic: `${n.topic} (copy)`,
      difficulty_level: n.difficulty_level || 'medium',
      content_html: n.content_html || '',
      order_index: n.order_index || 0,
    })
    toast.success('Duplicated — ab edit karo')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/notes?id=${id}`, { method: 'DELETE' })
      const result = await res.json()

      if (res.ok) {
        toast.success('Note deleted')
        setNotes((prev) => prev.filter((n) => n.id !== id))
        setDeleteTarget(null)
      } else {
        toast.error(result.error || 'Delete failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeletingId(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(INITIAL_FORM)
    setShowPreview(false)
  }

  // ═══════════════════════════════════════════════════════
  // DROPDOWNS
  // ═══════════════════════════════════════════════════════
  const uniqueClasses = useMemo(
    () => [...new Set(chapters.map((c) => c.class))].sort((a, b) => a - b),
    [chapters]
  )

  const subjectsForClass = useMemo(
    () =>
      form.class
        ? [
            ...new Set(
              chapters
                .filter((c) => c.class === parseInt(form.class, 10))
                .map((c) => c.subject)
            ),
          ].sort()
        : [],
    [chapters, form.class]
  )

  const chaptersForSubject = useMemo(
    () =>
      form.class && form.subject
        ? chapters.filter(
            (c) =>
              c.class === parseInt(form.class, 10) &&
              c.subject === form.subject &&
              c.language === form.language
          )
        : [],
    [chapters, form.class, form.subject, form.language]
  )

  // ═══════════════════════════════════════════════════════
  // FILTER + SORT
  // ═══════════════════════════════════════════════════════
  const filteredNotes = useMemo(() => {
    let result = notes

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (n) =>
          n.topic.toLowerCase().includes(q) ||
          n.ncert?.subject?.toLowerCase().includes(q) ||
          n.ncert?.chapter_title?.toLowerCase().includes(q)
      )
    }

    if (classFilter) {
      result = result.filter((n) => n.ncert?.class === parseInt(classFilter, 10))
    }

    if (difficultyFilter) {
      result = result.filter((n) => n.difficulty_level === difficultyFilter)
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      if (sortBy === 'topic') return a.topic.localeCompare(b.topic)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [notes, debouncedSearch, classFilter, difficultyFilter, sortBy])

  const hasActiveFilters = !!(classFilter || difficultyFilter || search)
  const topicLength = form.topic.length
  const contentLength = form.content_html.length

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <AdminHeader title="📝 Manage Chapter Notes" />

      {/* ═══════════ ADD/EDIT FORM ═══════════ */}
      <div className="surface-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {editingId ? (
              <>
                <Edit className="w-5 h-5 text-amber-600" />
                Edit Note
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 text-brand-600" />
                Add New Note
              </>
            )}
          </h2>

          {(form.content_html || form.topic) && (
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          )}
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="mb-5 p-5 rounded-xl border-2 border-dashed border-brand-300 dark:border-brand-700 bg-brand-50/40 dark:bg-brand-950/20">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              <Eye className="w-3.5 h-3.5" /> Student Preview
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {form.topic || 'Untitled'}
            </h3>
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  form.content_html ||
                  '<p class="text-slate-400">No content yet…</p>',
              }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Class / Subject / Chapter / Language */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Class *">
              <select
                value={form.class}
                onChange={(e) =>
                  setForm({
                    ...form,
                    class: e.target.value,
                    subject: '',
                    chapter_num: '',
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                required
              >
                <option value="">Select</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Subject *">
              <select
                value={form.subject}
                onChange={(e) =>
                  setForm({ ...form, subject: e.target.value, chapter_num: '' })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition disabled:opacity-50"
                required
                disabled={!form.class}
              >
                <option value="">Select</option>
                {subjectsForClass.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Chapter *">
              <select
                value={form.chapter_num}
                onChange={(e) =>
                  setForm({ ...form, chapter_num: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition disabled:opacity-50"
                required
                disabled={!form.subject}
              >
                <option value="">Select</option>
                {chaptersForSubject.map((ch) => (
                  <option key={ch.chapter_num} value={ch.chapter_num}>
                    Ch {ch.chapter_num}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={
                <span className="inline-flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5" /> Language
                </span>
              }
            >
              <select
                value={form.language}
                onChange={(e) =>
                  setForm({
                    ...form,
                    language: e.target.value as 'en' | 'hi',
                    chapter_num: '',
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </Field>
          </div>

          {/* Row 2: Topic / Difficulty / Order */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field
              label={
                <span className="flex items-center justify-between">
                  <span>Topic *</span>
                  <span
                    className={`text-[10px] font-mono ${
                      topicLength > MAX_TOPIC_LENGTH * 0.9
                        ? 'text-red-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {topicLength}/{MAX_TOPIC_LENGTH}
                  </span>
                </span>
              }
            >
              <input
                type="text"
                placeholder="e.g., Introduction to Real Numbers"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                required
                maxLength={MAX_TOPIC_LENGTH}
              />
            </Field>

            <Field label="Difficulty">
              <select
                value={form.difficulty_level}
                onChange={(e) =>
                  setForm({
                    ...form,
                    difficulty_level: e.target.value as
                      | 'easy'
                      | 'medium'
                      | 'hard',
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              >
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </Field>

            <Field label="Order (lower = first)">
              <input
                type="number"
                min={0}
                max={9999}
                value={form.order_index}
                onChange={(e) =>
                  setForm({
                    ...form,
                    order_index: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              />
            </Field>
          </div>

          {/* Content */}
          <Field
            label={
              <span className="flex items-center justify-between">
                <span>Notes Content (HTML) *</span>
                <span
                  className={`text-[10px] font-mono ${
                    contentLength > MAX_CONTENT_LENGTH * 0.9
                      ? 'text-red-600'
                      : 'text-slate-400'
                  }`}
                >
                  {contentLength.toLocaleString()}/
                  {MAX_CONTENT_LENGTH.toLocaleString()}
                </span>
              </span>
            }
          >
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <ReactQuill
                theme="snow"
                value={form.content_html}
                onChange={(content) =>
                  setForm({ ...form, content_html: content })
                }
                placeholder="Write notes in Hindi/English... HTML supported"
                className="bg-white dark:bg-slate-900 [&_.ql-editor]:min-h-[200px] sm:[&_.ql-editor]:min-h-[280px] [&_.ql-editor]:text-slate-900 dark:[&_.ql-editor]:text-white [&_.ql-toolbar]:border-slate-200 dark:[&_.ql-toolbar]:border-slate-700 [&_.ql-container]:border-slate-200 dark:[&_.ql-container]:border-slate-700"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Scripts/iframes auto-stripped on save
            </p>
          </Field>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update Note' : 'Add Note'}
                </>
              )}
            </button>

            {(editingId || form.topic || form.content_html) && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ═══════════ EXISTING NOTES ═══════════ */}
      <div className="surface-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            Existing Notes ({notes.length})
          </h2>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                showFilters || hasActiveFilters
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <Field label="Class">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="">All</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Difficulty">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <Field label="Sort">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'newest' | 'oldest' | 'topic')
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="topic">By topic</option>
              </select>
            </Field>
          </div>
        )}

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"
              />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">
              {hasActiveFilters ? 'No notes match filters' : 'No notes yet'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {hasActiveFilters
                ? 'Try clearing filters'
                : 'Add your first note using the form above'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((n) => (
              <div
                key={n.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-300 dark:hover:border-brand-700 transition-all p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                        Class {n.ncert?.class} • {n.ncert?.subject} • Ch{' '}
                        {n.ncert?.chapter_num}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          n.difficulty_level === 'easy'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : n.difficulty_level === 'hard'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {n.difficulty_level}
                      </span>
                      {n.ncert?.language && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                          {n.ncert.language}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {n.topic}
                    </h3>
                    {n.content_excerpt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {n.content_excerpt}…
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Order: {n.order_index} •{' '}
                      {new Date(n.created_at).toLocaleDateString('en-IN')} •{' '}
                      {Math.ceil((n.content_length || 0) / 1024)} KB
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => duplicateNote(n)}
                      aria-label={`Duplicate ${n.topic}`}
                      title="Duplicate"
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editNote(n)}
                      aria-label={`Edit ${n.topic}`}
                      title="Edit"
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(n)}
                      aria-label={`Delete ${n.topic}`}
                      title="Delete"
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ DELETE MODAL ═══════════ */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null)
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Delete Note?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ye action undo nahi ho sakta.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-5">
              <p className="text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-1">
                Class {deleteTarget.ncert?.class} •{' '}
                {deleteTarget.ncert?.subject} • Ch{' '}
                {deleteTarget.ncert?.chapter_num}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {deleteTarget.topic}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId !== null}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// FIELD WRAPPER
// ═══════════════════════════════════════════════════════
function Field({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 block">
        {label}
      </label>
      {children}
    </div>
  )
}