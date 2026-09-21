'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  FileText, Search, Trash2, Download, ExternalLink,
  AlertTriangle, Loader2, ArrowUpDown, Filter, X,
  Calendar, HardDrive, TrendingUp, FileImage,
} from 'lucide-react'

export interface PdfItem {
  id: string
  topic: string
  pdf_url: string | null
  pdf_size_kb: number | null
  pdf_uploaded_at: string | null
  created_at: string
  ncert?: {
    id: string
    class: number
    subject: string
    chapter_num: number
    chapter_title: string | null
    language: string | null
  } | null
}

interface Props {
  initialPdfs: PdfItem[]
  error: string | null
}

type SortKey = 'recent' | 'oldest' | 'size-large' | 'size-small' | 'topic'

function extractFilename(url: string): string {
  try {
    const raw = url.split('/').pop() || ''
    if (!raw) return 'notes.pdf'
    const decoded = decodeURIComponent(raw)
    const parts = decoded.split('-')
    const name = parts.length >= 3 ? parts.slice(2).join('-') : decoded
    return name.replace(/\.pdf$/i, '') || 'notes.pdf'
  } catch {
    return 'notes.pdf'
  }
}

function formatSize(kb: number | null): string {
  if (kb == null || kb <= 0) return '—'
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    const t = new Date(iso).getTime()
    if (isNaN(t)) return '—'
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function PdfLibrary({ initialPdfs, error }: Props) {
  const router = useRouter()
  const [pdfs, setPdfs] = useState<PdfItem[]>(initialPdfs)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')   // ✅ GAP 12 FIX
  const [classFilter, setClassFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('recent')
  const [filterOpen, setFilterOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PdfItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  // ✅ GAP 12 FIX: debounce search 250ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  // ✅ GAP 8 FIX: server se aaya naya data sync karo (router.refresh ke baad)
  useEffect(() => {
    setPdfs(initialPdfs)
  }, [initialPdfs])

  // ✅ GAP 10 FIX: Escape + focus management
  useEffect(() => {
    if (!deleteTarget) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) {
        setDeleteTarget(null)
      }
    }
    window.addEventListener('keydown', handler)
    requestAnimationFrame(() => cancelButtonRef.current?.focus())
    return () => window.removeEventListener('keydown', handler)
  }, [deleteTarget, deleting])

  const availableClasses = useMemo(() => {
    const set = new Set<number>()
    pdfs.forEach((p) => {
      const c = p.ncert?.class
      if (typeof c === 'number') set.add(c)
    })
    return Array.from(set).sort((a, b) => a - b)
  }, [pdfs])

  const availableSubjects = useMemo(() => {
    const set = new Set<string>()
    pdfs.forEach((p) => {
      if (classFilter && String(p.ncert?.class) !== classFilter) return
      const s = p.ncert?.subject
      if (s) set.add(s)
    })
    return Array.from(set).sort()
  }, [pdfs, classFilter])

  const filtered = useMemo(() => {
    let list = [...pdfs]

    // ✅ GAP 9 FIX: null-safe search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter((p) => {
        const filename = p.pdf_url ? extractFilename(p.pdf_url).toLowerCase() : ''
        const topic = (p.topic ?? '').toLowerCase()
        const subject = (p.ncert?.subject ?? '').toLowerCase()
        const chapterTitle = (p.ncert?.chapter_title ?? '').toLowerCase()
        return (
          topic.includes(q) ||
          filename.includes(q) ||
          subject.includes(q) ||
          chapterTitle.includes(q)
        )
      })
    }

    if (classFilter) {
      list = list.filter((p) => String(p.ncert?.class) === classFilter)
    }
    if (subjectFilter) {
      list = list.filter((p) => p.ncert?.subject === subjectFilter)
    }

    list.sort((a, b) => {
      const at = new Date(a.pdf_uploaded_at || a.created_at).getTime()
      const bt = new Date(b.pdf_uploaded_at || b.created_at).getTime()
      switch (sortKey) {
        case 'oldest':
          return at - bt
        case 'size-large':
          return (b.pdf_size_kb ?? 0) - (a.pdf_size_kb ?? 0)
        case 'size-small':
          return (a.pdf_size_kb ?? 0) - (b.pdf_size_kb ?? 0)
        case 'topic':
          return (a.topic ?? '').localeCompare(b.topic ?? '')
        case 'recent':
        default:
          return bt - at
      }
    })

    return list
  }, [pdfs, debouncedSearch, classFilter, subjectFilter, sortKey])

  const stats = useMemo(() => {
    const totalSize = pdfs.reduce((sum, p) => sum + (p.pdf_size_kb ?? 0), 0)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const thisWeek = pdfs.filter((p) => {
      const t = new Date(p.pdf_uploaded_at || p.created_at).getTime()
      return t >= weekAgo
    }).length
    return { total: pdfs.length, totalSizeKb: totalSize, thisWeek }
  }, [pdfs])

  const activeFilters = !!(debouncedSearch || classFilter || subjectFilter)

  const clearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setClassFilter('')
    setSubjectFilter('')
  }

  // ✅ GAP 5+6+7 FIX: Delete flow — API handles DB + storage together
  const handleDelete = async () => {
    if (!deleteTarget || deleting) return
    const target = deleteTarget
    setDeleting(true)

    try {
      const params = new URLSearchParams({ noteId: target.id })
      if (target.pdf_url) params.set('url', target.pdf_url)

      const res = await fetch(
        `/api/admin/notes/upload-pdf?${params.toString()}`,
        { method: 'DELETE' }
      )
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(body.error || 'Delete failed')
      }

      // Only remove from state after API confirms DB + storage
      setPdfs((prev) => prev.filter((p) => p.id !== target.id))
      toast.success('PDF हटा दिया')
      setDeleteTarget(null)

      // Sync with server to be sure
      router.refresh()
    } catch (err) {
      console.error('[pdfs] delete failed:', err)
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="surface-card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <FileImage className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total PDFs
            </p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {stats.total.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="surface-card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <HardDrive className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Size
            </p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {formatSize(stats.totalSizeKb)}
          </p>
        </div>

        <div className="surface-card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              This Week
            </p>
          </div>
          {/* ✅ GAP 11 FIX: proper display when 0 */}
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {stats.thisWeek > 0 ? `+${stats.thisWeek}` : '0'}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900 dark:text-red-200 text-sm">
              PDFs load नहीं हो पाए
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="surface-card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by topic, filename, subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              filterOpen || classFilter || subjectFilter
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden xs:inline">Filters</span>
            {(classFilter || subjectFilter) && (
              <span className="w-5 h-5 rounded-full bg-white/25 text-[10px] font-bold flex items-center justify-center">
                {(classFilter ? 1 : 0) + (subjectFilter ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Class
              </label>
              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value)
                  setSubjectFilter('')
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="">All Classes</option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Subject
              </label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                disabled={availableSubjects.length === 0}
              >
                <option value="">All Subjects</option>
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Sort by
              </label>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                >
                  <option value="recent">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="size-large">Largest first</option>
                  <option value="size-small">Smallest first</option>
                  <option value="topic">By topic (A→Z)</option>
                </select>
              </div>
            </div>

            {activeFilters && (
              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                  <X className="w-3 h-3" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {activeFilters && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {filtered.length} of {pdfs.length} PDFs match
          </p>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center mb-4">
            <FileImage className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {activeFilters ? 'No PDFs match filters' : 'No PDFs yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {activeFilters
              ? 'Try clearing filters'
              : 'PDF attach करके notes से link करें'}
          </p>
          {activeFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          ) : (
            <Link
              href="/admin/notes?action=new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg transition"
            >
              <FileText className="w-4 h-4" />
              PDF के साथ note बनाएँ
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pdf) => {
            const filename = pdf.pdf_url ? extractFilename(pdf.pdf_url) : 'notes'
            return (
              <div
                key={pdf.id}
                className="surface-card p-3 sm:p-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      {pdf.ncert && (
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                          Class {pdf.ncert.class} • {pdf.ncert.subject} • Ch{' '}
                          {pdf.ncert.chapter_num}
                        </span>
                      )}
                      {pdf.ncert?.language && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                          {pdf.ncert.language}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {pdf.topic}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">
                      {filename}.pdf
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatSize(pdf.pdf_size_kb)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(pdf.pdf_uploaded_at || pdf.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                    {pdf.pdf_url && (
                      <>
                        <a
                          href={pdf.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                          title="Preview"
                          aria-label="Preview PDF"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                          href={pdf.pdf_url}
                          download
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                          title="Download"
                          aria-label="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(pdf)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      title="Delete"
                      aria-label="Delete PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-pdf-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) setDeleteTarget(null)
          }}
        >
          <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 id="delete-pdf-title" className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Delete PDF?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Storage से PDF और note का PDF reference — दोनों हट जाएँगे।
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-5">
              {deleteTarget.ncert && (
                <p className="text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Class {deleteTarget.ncert.class} • {deleteTarget.ncert.subject} • Ch{' '}
                  {deleteTarget.ncert.chapter_num}
                </p>
              )}
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {deleteTarget.topic}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting…
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