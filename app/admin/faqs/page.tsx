'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Check,
  Save,
  HelpCircle,
  Globe,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  FileQuestion,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminHeader } from '@/components/AdminHeader'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
interface ChapterOpt {
  id: number
  class: number
  subject: string
  chapter_num: number
  chapter_title: string | null
  language: string
}

interface FaqRow {
  id: number
  ncert_id: number
  lang: 'en' | 'hi'
  question: string
  answer: string
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

type LangFilter = 'all' | 'en' | 'hi'

const INITIAL_FORM = {
  lang: 'en' as 'en' | 'hi',
  question: '',
  answer: '',
  order_index: 0,
  is_published: true,
}

// ═══════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════
export default function AdminFaqs() {
  // Chapter selector
  const [chapters, setChapters] = useState<ChapterOpt[]>([])
  const [chaptersLoading, setChaptersLoading] = useState(true)
  const [classNum, setClassNum] = useState('')
  const [subject, setSubject] = useState('')
  const [chapterNum, setChapterNum] = useState('')

  // FAQ data
  const [faqs, setFaqs] = useState<FaqRow[]>([])
  const [faqsLoading, setFaqsLoading] = useState(false)

  // Filters
  const [langFilter, setLangFilter] = useState<LangFilter>('all')

  // Form
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // ─────────────────────────────────────────────────────────────
  // Fetch chapters (master list for cascading dropdowns)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setChaptersLoading(true)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('ncert')
          .select('id, class, subject, chapter_num, chapter_title, language')
          .order('class', { ascending: true })
          .order('subject', { ascending: true })
          .order('chapter_num', { ascending: true })

        if (cancelled) return
        if (error) {
          toast.error('Chapters load nahi hue')
          return
        }
        setChapters((data ?? []) as ChapterOpt[])
      } finally {
        if (!cancelled) setChaptersLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // ─────────────────────────────────────────────────────────────
  // Cascading dropdowns
  // ─────────────────────────────────────────────────────────────
  const uniqueClasses = useMemo(
    () => [...new Set(chapters.map((c) => c.class))].sort((a, b) => a - b),
    [chapters]
  )

  const subjectsForClass = useMemo(() => {
    if (!classNum) return []
    return [
      ...new Set(
        chapters
          .filter((c) => c.class === parseInt(classNum))
          .map((c) => c.subject)
      ),
    ].sort()
  }, [chapters, classNum])

  const uniqueChaptersForSubject = useMemo(() => {
    if (!classNum || !subject) return []
    const filtered = chapters.filter(
      (c) => c.class === parseInt(classNum) && c.subject === subject
    )
    // Dedupe by chapter_num (keep first — usually en variant)
    const seen = new Set<number>()
    const out: ChapterOpt[] = []
    for (const c of filtered) {
      if (seen.has(c.chapter_num)) continue
      seen.add(c.chapter_num)
      out.push(c)
    }
    return out
  }, [chapters, classNum, subject])

  // All language variants of selected chapter
  const selectedVariants = useMemo(() => {
    if (!classNum || !subject || !chapterNum) return []
    return chapters.filter(
      (c) =>
        c.class === parseInt(classNum) &&
        c.subject === subject &&
        c.chapter_num === parseInt(chapterNum)
    )
  }, [chapters, classNum, subject, chapterNum])

  // Map: 'en' → ncert_id, 'hi' → ncert_id
  const variantIdMap = useMemo(() => {
    const map: Partial<Record<'en' | 'hi', number>> = {}
    for (const v of selectedVariants) {
      const l = v.language === 'hi' ? 'hi' : 'en'
      if (!map[l]) map[l] = v.id
    }
    return map
  }, [selectedVariants])

  // ─────────────────────────────────────────────────────────────
  // Fetch FAQs for selected chapter's all variants
  // ─────────────────────────────────────────────────────────────
  const fetchFaqs = useCallback(async () => {
    if (selectedVariants.length === 0) {
      setFaqs([])
      return
    }
    setFaqsLoading(true)
    try {
      const results = await Promise.all(
        selectedVariants.map(async (v) => {
          const res = await fetch(`/api/admin/faqs?ncert_id=${v.id}`, {
            cache: 'no-store',
          })
          if (!res.ok) return [] as FaqRow[]
          const json = await res.json()
          return (json?.data ?? []) as FaqRow[]
        })
      )
      const merged = results.flat()
      // Sort: lang (hi first), then order_index, then id
      merged.sort((a, b) => {
        if (a.lang !== b.lang) return a.lang === 'hi' ? -1 : 1
        if (a.order_index !== b.order_index)
          return a.order_index - b.order_index
        return a.id - b.id
      })
      setFaqs(merged)
    } catch {
      toast.error('FAQs load nahi hue')
      setFaqs([])
    } finally {
      setFaqsLoading(false)
    }
  }, [selectedVariants])

  useEffect(() => {
    void fetchFaqs()
  }, [fetchFaqs])

  // ─────────────────────────────────────────────────────────────
  // Filtered list
  // ─────────────────────────────────────────────────────────────
  const filteredFaqs = useMemo(() => {
    if (langFilter === 'all') return faqs
    return faqs.filter((f) => f.lang === langFilter)
  }, [faqs, langFilter])

  // ─────────────────────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const en = faqs.filter((f) => f.lang === 'en').length
    const hi = faqs.filter((f) => f.lang === 'hi').length
    const drafts = faqs.filter((f) => !f.is_published).length
    return { total: faqs.length, en, hi, drafts }
  }, [faqs])

  // ─────────────────────────────────────────────────────────────
  // Selection handlers
  // ─────────────────────────────────────────────────────────────
  const handleClassChange = (v: string) => {
    setClassNum(v)
    setSubject('')
    setChapterNum('')
    cancelForm()
  }
  const handleSubjectChange = (v: string) => {
    setSubject(v)
    setChapterNum('')
    cancelForm()
  }
  const handleChapterChange = (v: string) => {
    setChapterNum(v)
    cancelForm()
  }

  // ─────────────────────────────────────────────────────────────
  // Form: suggest order_index for new FAQ in given lang
  // ─────────────────────────────────────────────────────────────
  const suggestOrder = useCallback(
    (lang: 'en' | 'hi') => {
      const sameLang = faqs.filter((f) => f.lang === lang)
      if (sameLang.length === 0) return 0
      return Math.max(...sameLang.map((f) => f.order_index)) + 1
    },
    [faqs]
  )

  const openAddForm = (lang?: 'en' | 'hi') => {
    const l = lang ?? (variantIdMap.hi && !variantIdMap.en ? 'hi' : 'en')
    setEditingId(null)
    setForm({
      ...INITIAL_FORM,
      lang: l,
      order_index: suggestOrder(l),
    })
    setShowForm(true)
    setShowPreview(false)
  }

  const openEditForm = (faq: FaqRow) => {
    setEditingId(faq.id)
    setForm({
      lang: faq.lang,
      question: faq.question,
      answer: faq.answer,
      order_index: faq.order_index,
      is_published: faq.is_published,
    })
    setShowForm(true)
    setShowPreview(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelForm = () => {
    const dirty =
      form.question.trim().length > 0 || form.answer.trim().length > 0
    if (dirty && !editingId) {
      if (!confirm('Discard unsaved changes?')) return
    }
    setShowForm(false)
    setEditingId(null)
    setForm(INITIAL_FORM)
    setShowPreview(false)
  }

  const handleLangChange = (l: 'en' | 'hi') => {
    setForm((f) => ({
      ...f,
      lang: l,
      order_index: editingId ? f.order_index : suggestOrder(l),
    }))
  }

  // ─────────────────────────────────────────────────────────────
  // Save
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = async (andNew: boolean = false) => {
    // Validation
    const q = form.question.trim()
    const a = form.answer.trim()
    if (q.length < 5 || q.length > 500) {
      toast.error('Question 5–500 characters hona chahiye')
      return
    }
    if (a.length < 5 || a.length > 5000) {
      toast.error('Answer 5–5000 characters hona chahiye')
      return
    }
    const ncertId = variantIdMap[form.lang]
    if (!ncertId) {
      toast.error(`${form.lang.toUpperCase()} variant nahi mila is chapter ka`)
      return
    }

    setSaving(true)
    try {
      const isEdit = editingId !== null
      const url = '/api/admin/faqs'
      const method = isEdit ? 'PUT' : 'POST'
      const body = isEdit
        ? {
            id: editingId,
            ncert_id: ncertId,
            lang: form.lang,
            question: q,
            answer: a,
            order_index: form.order_index,
            is_published: form.is_published,
          }
        : {
            ncert_id: ncertId,
            lang: form.lang,
            question: q,
            answer: a,
            order_index: form.order_index,
            is_published: form.is_published,
          }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || json?.ok === false) {
        toast.error(json?.error || 'Save fail')
        return
      }

      toast.success(isEdit ? 'FAQ updated ✅' : 'FAQ created ✅')
      await fetchFaqs()

      if (andNew) {
        // Keep form open, reset for next entry
        setEditingId(null)
        setForm({
          ...INITIAL_FORM,
          lang: form.lang,
          order_index: suggestOrder(form.lang) + (isEdit ? 0 : 1),
        })
        setShowPreview(false)
      } else {
        setShowForm(false)
        setEditingId(null)
        setForm(INITIAL_FORM)
        setShowPreview(false)
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  // Ctrl+S / Cmd+S to save
  useEffect(() => {
    if (!showForm) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        void handleSubmit(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, form, editingId, variantIdMap])

  // ─────────────────────────────────────────────────────────────
  // Row actions
  // ─────────────────────────────────────────────────────────────
  const handleDelete = async (faq: FaqRow) => {
    if (!confirm('Delete this FAQ?')) return
    try {
      const res = await fetch(`/api/admin/faqs?id=${faq.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        toast.error('Delete fail')
        return
      }
      toast.success('FAQ deleted')
      await fetchFaqs()
    } catch {
      toast.error('Network error')
    }
  }

  const handleTogglePublish = async (faq: FaqRow) => {
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: faq.id,
          is_published: !faq.is_published,
        }),
      })
      if (!res.ok) {
        toast.error('Update fail')
        return
      }
      toast.success(faq.is_published ? 'Unpublished' : 'Published')
      await fetchFaqs()
    } catch {
      toast.error('Network error')
    }
  }

  const handleReorder = async (faq: FaqRow, direction: 'up' | 'down') => {
    const sameLang = faqs
      .filter((f) => f.lang === faq.lang)
      .sort((a, b) => a.order_index - b.order_index)
    const idx = sameLang.findIndex((f) => f.id === faq.id)
    if (idx === -1) return
    const swapWith = direction === 'up' ? sameLang[idx - 1] : sameLang[idx + 1]
    if (!swapWith) return

    // Swap order_index values
    const aIdx = faq.order_index
    const bIdx = swapWith.order_index
    try {
      await Promise.all([
        fetch('/api/admin/faqs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: faq.id, order_index: bIdx }),
        }),
        fetch('/api/admin/faqs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: swapWith.id, order_index: aIdx }),
        }),
      ])
      await fetchFaqs()
    } catch {
      toast.error('Reorder fail')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  const hasSelectedChapter = !!classNum && !!subject && !!chapterNum
  const noVariants = hasSelectedChapter && selectedVariants.length === 0

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <AdminHeader title="❓ Manage Chapter FAQs" />

      {/* ── Chapter selector ───────────────────────────────────── */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Pick chapter
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SelectField
            label="Class"
            value={classNum}
            onChange={handleClassChange}
            options={uniqueClasses.map((c) => ({
              value: String(c),
              label: `Class ${c}`,
            }))}
            placeholder="Select class"
            disabled={chaptersLoading}
          />
          <SelectField
            label="Subject"
            value={subject}
            onChange={handleSubjectChange}
            options={subjectsForClass.map((s) => ({ value: s, label: s }))}
            placeholder="Select subject"
            disabled={!classNum || chaptersLoading}
          />
          <SelectField
            label="Chapter"
            value={chapterNum}
            onChange={handleChapterChange}
            options={uniqueChaptersForSubject.map((c) => ({
              value: String(c.chapter_num),
              label: `Ch ${c.chapter_num} — ${
                c.chapter_title?.slice(0, 40) ?? ''
              }`,
            }))}
            placeholder="Select chapter"
            disabled={!subject || chaptersLoading}
          />
        </div>

        {hasSelectedChapter && !noVariants && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Variants:</span>
            {selectedVariants.map((v) => (
              <span
                key={v.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                  v.language === 'hi'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
                }`}
              >
                <Globe className="w-3 h-3" />
                {v.language.toUpperCase()} · ncert_id {v.id}
              </span>
            ))}
          </div>
        )}

        {noVariants && (
          <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">
            Is chapter ka koi NCERT row nahi mila (data missing).
          </p>
        )}
      </div>

      {!hasSelectedChapter && (
        <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <FileQuestion className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">Select a chapter to start</h3>
          <p className="text-sm text-gray-500">
            Choose Class → Subject → Chapter above
          </p>
        </div>
      )}

      {hasSelectedChapter && !noVariants && (
        <>
          {/* ── Stats ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total" value={stats.total} color="indigo" />
            <StatCard label="English" value={stats.en} color="sky" />
            <StatCard label="हिंदी" value={stats.hi} color="amber" />
            <StatCard label="Drafts" value={stats.drafts} color="rose" />
          </div>

          {/* ── Add button ───────────────────────────────────── */}
          {!showForm && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => openAddForm('en')}
                disabled={!variantIdMap.en}
                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-5 h-5" />
                Add English FAQ
              </button>
              <button
                onClick={() => openAddForm('hi')}
                disabled={!variantIdMap.hi}
                className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-5 h-5" />
                Add हिंदी FAQ
              </button>
            </div>
          )}

          {/* ── Form ─────────────────────────────────────────── */}
          {showForm && (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {editingId ? (
                    <Edit className="w-5 h-5" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}
                  {editingId ? 'Edit FAQ' : 'Add FAQ'}
                </h2>
                <button
                  onClick={cancelForm}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Language radio */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Language *
                  </label>
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-700">
                    <button
                      type="button"
                      onClick={() => handleLangChange('en')}
                      disabled={!variantIdMap.en}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        form.lang === 'en'
                          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 disabled:opacity-40'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLangChange('hi')}
                      disabled={!variantIdMap.hi}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        form.lang === 'hi'
                          ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 disabled:opacity-40'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                  {variantIdMap[form.lang] && (
                    <p className="mt-2 text-xs text-slate-500">
                      Saves to ncert_id {variantIdMap[form.lang]}
                    </p>
                  )}
                </div>

                {/* Question */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">Question *</label>
                    <span
                      className={`text-xs tabular-nums ${
                        form.question.length > 500
                          ? 'text-rose-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {form.question.length} / 500
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Question likho…"
                    value={form.question}
                    onChange={(e) =>
                      setForm({ ...form, question: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    maxLength={500}
                  />
                </div>

                {/* Answer */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">
                      Answer (HTML allowed) *
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="text-xs inline-flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showPreview}
                          onChange={(e) => setShowPreview(e.target.checked)}
                          className="w-3.5 h-3.5"
                        />
                        Preview
                      </label>
                      <span
                        className={`text-xs tabular-nums ${
                          form.answer.length > 5000
                            ? 'text-rose-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {form.answer.length} / 5000
                      </span>
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    placeholder="<p>Answer HTML format mein likho…</p>"
                    value={form.answer}
                    onChange={(e) =>
                      setForm({ ...form, answer: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none resize-y font-mono text-sm"
                    maxLength={5000}
                  />
                  {showPreview && form.answer.trim().length > 0 && (
                    <div className="mt-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                        Preview
                      </p>
                      <div
                        className="faq-answer note-content text-sm text-slate-700 dark:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: form.answer }}
                      />
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Supported tags: <code>&lt;p&gt;</code>,{' '}
                    <code>&lt;strong&gt;</code>, <code>&lt;em&gt;</code>,{' '}
                    <code>&lt;ul&gt;</code>, <code>&lt;li&gt;</code>,{' '}
                    <code>&lt;a&gt;</code>. Auto-sanitized on save.
                  </p>
                </div>

                {/* Order + Published */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Order index
                    </label>
                    <input
                      type="number"
                      value={form.order_index}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          order_index: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Chhota number → upar dikhega
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Status
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                      <input
                        type="checkbox"
                        checked={form.is_published}
                        onChange={(e) =>
                          setForm({ ...form, is_published: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">
                        {form.is_published ? 'Published' : 'Draft'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition font-medium"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingId ? 'Update' : 'Save'}
                      </>
                    )}
                  </button>
                  {!editingId && (
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition font-medium"
                    >
                      <Check className="w-4 h-4" />
                      Save & New
                    </button>
                  )}
                  <button
                    onClick={cancelForm}
                    className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <span className="text-xs text-gray-500 self-center ml-auto hidden sm:inline">
                    Tip: Ctrl+S to save
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Language filter + List ──────────────────────── */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Filter:
              </span>
              {(['all', 'en', 'hi'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLangFilter(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    langFilter === l
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {l === 'all'
                    ? `All (${stats.total})`
                    : l === 'en'
                      ? `English (${stats.en})`
                      : `हिंदी (${stats.hi})`}
                </button>
              ))}
            </div>

            {faqsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-16"
                  />
                ))}
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-10">
                <HelpCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {faqs.length === 0
                    ? 'Is chapter ke liye abhi koi FAQ nahi hai.'
                    : 'Is filter mein kuch nahi mila.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredFaqs.map((faq, idx) => (
                  <FaqRowItem
                    key={faq.id}
                    faq={faq}
                    index={idx + 1}
                    onEdit={() => openEditForm(faq)}
                    onDelete={() => handleDelete(faq)}
                    onTogglePublish={() => handleTogglePublish(faq)}
                    onMoveUp={() => handleReorder(faq, 'up')}
                    onMoveDown={() => handleReorder(faq, 'down')}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'indigo' | 'sky' | 'amber' | 'rose'
}) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500 to-purple-500',
    sky: 'from-sky-500 to-blue-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-500',
  }
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4">
      <div
        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${colors[color]}`}
      />
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 text-sm"
      >
        <option value="">{placeholder || `Select ${label || 'option'}`}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function FaqRowItem({
  faq,
  index,
  onEdit,
  onDelete,
  onTogglePublish,
  onMoveUp,
  onMoveDown,
}: {
  faq: FaqRow
  index: number
  onEdit: () => void
  onDelete: () => void
  onTogglePublish: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const langBadge =
    faq.lang === 'hi'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'

  return (
    <li className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        {/* Order controls */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button
            onClick={onMoveUp}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700"
            aria-label="Move up"
            title="Move up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-gray-400 text-center tabular-nums">
            {faq.order_index}
          </span>
          <button
            onClick={onMoveDown}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700"
            aria-label="Move down"
            title="Move down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs text-gray-400 tabular-nums">
              #{index}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${langBadge}`}
            >
              <Globe className="w-3 h-3" />
              {faq.lang.toUpperCase()}
            </span>
            {!faq.is_published && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <EyeOff className="w-3 h-3" />
                Draft
              </span>
            )}
            <span className="text-[10px] text-gray-400 font-mono">
              id {faq.id}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              ncert {faq.ncert_id}
            </span>
          </div>

          <p className="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
            {faq.question}
          </p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {faq.answer.replace(/<[^>]+>/g, ' ').trim()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={onTogglePublish}
            className={`p-2 rounded-lg transition ${
              faq.is_published
                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={faq.is_published ? 'Unpublish' : 'Publish'}
            aria-label={faq.is_published ? 'Unpublish' : 'Publish'}
          >
            {faq.is_published ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition"
            title="Edit"
            aria-label="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            title="Delete"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </li>
  )
}