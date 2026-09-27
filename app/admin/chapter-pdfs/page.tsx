'use client'

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { AdminHeader } from '@/components/AdminHeader'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft,
  Search,
  X,
  Upload,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Download,
  RefreshCw,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  FileText,
  FileImage,
  LayoutGrid,
  History,
  GraduationCap,
  Layers,
} from 'lucide-react'
import PdfUploadField from '@/components/admin/PdfUploadField'

// ═══════════════════════════════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════════════════════════════
type NoteLevel = 'basic' | 'advance' | 'pro'
type View = 'recent' | 'browse'
type Lang = 'all' | 'hi' | 'en'

const LEVELS: NoteLevel[] = ['basic', 'advance', 'pro']
const CLASS_NUMS = [6, 7, 8, 9, 10, 11, 12]
const RECENT_LIMIT = 20
const SEARCH_LIMIT = 100
const PDF_FETCH_LIMIT = 500

const LEVEL_UI: Record<
  NoteLevel,
  { emoji: string; label: string; activeClass: string; badgeClass: string }
> = {
  basic: {
    emoji: '🟢',
    label: 'Basic',
    activeClass: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  advance: {
    emoji: '🟠',
    label: 'Advance',
    activeClass: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40',
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  },
  pro: {
    emoji: '🔴',
    label: 'Pro',
    activeClass: 'border-rose-500 bg-rose-50 dark:bg-rose-950/40',
    badgeClass:
      'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
  },
}

interface Chapter {
  id: number
  class: number
  subject: string
  chapter_num: number
  chapter_title: string | null
  language: string
}

interface ChapterPdf {
  id: number
  ncert_id: number
  level: NoteLevel
  pdf_url: string
  pdf_size_kb: number | null
  title: string | null
  uploaded_at: string
  updated_at: string
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function relativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const sec = Math.floor(diff / 1000)
    if (sec < 60) return 'just now'
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}h ago`
    const d = Math.floor(hr / 24)
    if (d < 7) return `${d}d ago`
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return '—'
  }
}

// ═══════════════════════════════════════════════════════════════
// Top-level page (Suspense wrapper for useSearchParams)
// ═══════════════════════════════════════════════════════════════
export default function AdminChapterPdfsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminChapterPdfsInner />
    </Suspense>
  )
}

function PageSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════
function AdminChapterPdfsInner() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  // ─── URL state ───
  const view = (sp.get('view') as View) || 'recent'
  const classFilter = sp.get('class') || ''
  const subjectFilter = sp.get('subject') || ''
  const langFilter = (sp.get('lang') as Lang) || 'all'
  const searchParam = sp.get('q') || ''

  // ─── Data state ───
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [pdfs, setPdfs] = useState<ChapterPdf[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // ─── Search input (debounced → URL) ───
  const [searchInput, setSearchInput] = useState(searchParam)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSearchInput(searchParam)
  }, [searchParam])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // ─── Upload modal state ───
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3 | 4>(1)
  const [uploadClass, setUploadClass] = useState<number | null>(null)
  const [uploadSubject, setUploadSubject] = useState<string>('')
  const [uploadChapter, setUploadChapter] = useState<Chapter | null>(null)
  const [uploadLevel, setUploadLevel] = useState<NoteLevel | null>(null)
  const [uploadPdf, setUploadPdf] = useState<{
    pdf_url: string | null
    pdf_size_kb: number | null
  }>({ pdf_url: null, pdf_size_kb: null })
  const [replaceMode, setReplaceMode] = useState(false)

  // ─── URL helpers ───
  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === '' || v === 'all') {
          next.delete(k)
        } else {
          next.set(k, v)
        }
      }
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [sp, pathname, router]
  )

  const setView = (v: View) => pushParams({ view: v === 'recent' ? null : v })
  const setClassFilter = (c: string) =>
    pushParams({ class: c || null, subject: null })
  const setSubjectFilter = (s: string) =>
    pushParams({ subject: s || null })
  const setLangFilter = (l: Lang) =>
    pushParams({ lang: l === 'all' ? null : l })

  const handleSearchChange = (val: string) => {
    setSearchInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushParams({ q: val.trim() || null })
    }, 350)
  }

  const clearSearch = () => {
    setSearchInput('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    pushParams({ q: null })
  }

  const resetAll = () => {
    setSearchInput('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    router.replace(pathname, { scroll: false })
  }

  // ─── Fetch ───
  const fetchChapters = useCallback(async () => {
    const { data, error } = await supabase
      .from('ncert')
      .select('id, class, subject, chapter_num, chapter_title, language')
      .gte('class', 6)
      .lte('class', 12)
      .order('class')
      .order('subject')
      .order('chapter_num')
    if (error) {
      toast.error('Failed to load chapters')
      return
    }
    setChapters((data || []) as Chapter[])
  }, [])

  const fetchPdfs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/chapter-pdfs?limit=${PDF_FETCH_LIMIT}`,
        { credentials: 'include' }
      )
      const result = await res.json()
      if (!res.ok || !result.ok) {
        toast.error(result.error || 'Failed to load PDFs')
        return
      }
      setPdfs(result.data || [])
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChapters()
    fetchPdfs()
  }, [fetchChapters, fetchPdfs])

  // ─── Derived: PDFs by chapter+level ───
  const pdfsByChapter = useMemo(() => {
    const map = new Map<number, Map<NoteLevel, ChapterPdf>>()
    for (const p of pdfs) {
      if (!map.has(p.ncert_id)) map.set(p.ncert_id, new Map())
      map.get(p.ncert_id)!.set(p.level, p)
    }
    return map
  }, [pdfs])

  // ─── Derived: Recent list ───
  const recentItems = useMemo(() => {
    return [...pdfs]
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, RECENT_LIMIT)
      .map((pdf) => ({
        pdf,
        chapter: chapters.find((c) => c.id === pdf.ncert_id) || null,
      }))
      .filter((x) => x.chapter !== null) as {
      pdf: ChapterPdf
      chapter: Chapter
    }[]
  }, [pdfs, chapters])

  // ─── Derived: Class stats ───
  const classStats = useMemo(() => {
    const stats = new Map<number, { chapters: number; pdfs: number }>()
    for (const cls of CLASS_NUMS) {
      const chapIds = new Set(
        chapters.filter((c) => c.class === cls).map((c) => c.id)
      )
      stats.set(cls, {
        chapters: chapIds.size,
        pdfs: pdfs.filter((p) => chapIds.has(p.ncert_id)).length,
      })
    }
    return stats
  }, [chapters, pdfs])

  // ─── Derived: Subjects for class ───
  const subjectsForClass = useMemo(() => {
    if (!classFilter) return []
    const cls = parseInt(classFilter, 10)
    const subjectMap = new Map<string, { chapters: number; pdfs: number }>()
    const classChapters = chapters.filter((c) => c.class === cls)
    for (const ch of classChapters) {
      const cur = subjectMap.get(ch.subject) || { chapters: 0, pdfs: 0 }
      cur.chapters += 1
      if (pdfsByChapter.has(ch.id)) {
        cur.pdfs += pdfsByChapter.get(ch.id)!.size
      }
      subjectMap.set(ch.subject, cur)
    }
    return [...subjectMap.entries()]
      .map(([subject, stats]) => ({ subject, ...stats }))
      .sort((a, b) => a.subject.localeCompare(b.subject))
  }, [chapters, classFilter, pdfsByChapter])

  // ─── Derived: Chapters for class+subject ───
  const chaptersForSubject = useMemo(() => {
    if (!classFilter || !subjectFilter) return []
    const cls = parseInt(classFilter, 10)
    return chapters
      .filter((c) => c.class === cls && c.subject === subjectFilter)
      .filter((c) => langFilter === 'all' || c.language === langFilter)
  }, [chapters, classFilter, subjectFilter, langFilter])

  // ─── Derived: Search results ───
  const searchResultsFull = useMemo(() => {
    if (!searchParam.trim()) return null
    const q = searchParam.toLowerCase().trim()
    const clsNum = classFilter ? parseInt(classFilter, 10) : null

    return chapters.filter((c) => {
      if (clsNum && c.class !== clsNum) return false
      if (langFilter !== 'all' && c.language !== langFilter) return false
      const titleMatch = (c.chapter_title || '').toLowerCase().includes(q)
      const subjectMatch = c.subject.toLowerCase().includes(q)
      const chMatch =
        `ch ${c.chapter_num}`.includes(q) ||
        `chapter ${c.chapter_num}`.includes(q)
      const classMatch =
        `class ${c.class}`.includes(q) || `cls ${c.class}`.includes(q)
      return titleMatch || subjectMatch || chMatch || classMatch
    })
  }, [chapters, searchParam, classFilter, langFilter])

  const searchResults = useMemo(
    () => (searchResultsFull ? searchResultsFull.slice(0, SEARCH_LIMIT) : null),
    [searchResultsFull]
  )

  const searchTotal = searchResultsFull?.length ?? 0

  // ═══════════════════════════════════════════════════════════════
  // Upload modal handlers
  // ═══════════════════════════════════════════════════════════════
  const openUploadFresh = () => {
    setSaving(false)
    setReplaceMode(false)
    setUploadStep(1)
    setUploadClass(classFilter ? parseInt(classFilter, 10) : null)
    setUploadSubject(classFilter ? subjectFilter : '')
    setUploadChapter(null)
    setUploadLevel(null)
    setUploadPdf({ pdf_url: null, pdf_size_kb: null })
    if (classFilter && subjectFilter) setUploadStep(3)
    else if (classFilter) setUploadStep(2)
    setUploadOpen(true)
  }

  const openReplace = (chapter: Chapter, level: NoteLevel) => {
    setSaving(false)
    setReplaceMode(true)
    setUploadStep(4)
    setUploadClass(chapter.class)
    setUploadSubject(chapter.subject)
    setUploadChapter(chapter)
    setUploadLevel(level)
    const existing = pdfsByChapter.get(chapter.id)?.get(level)
    setUploadPdf({
      pdf_url: existing?.pdf_url || null,
      pdf_size_kb: existing?.pdf_size_kb || null,
    })
    setUploadOpen(true)
  }

  const closeUpload = () => {
    if (saving) return
    setUploadOpen(false)
    setUploadStep(1)
    setUploadClass(null)
    setUploadSubject('')
    setUploadChapter(null)
    setUploadLevel(null)
    setUploadPdf({ pdf_url: null, pdf_size_kb: null })
    setReplaceMode(false)
  }

  const handleSave = async () => {
    if (!uploadChapter || !uploadLevel || !uploadPdf.pdf_url) {
      toast.error('Please complete all steps')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/chapter-pdfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ncert_id: uploadChapter.id,
          level: uploadLevel,
          pdf_url: uploadPdf.pdf_url,
          pdf_size_kb: uploadPdf.pdf_size_kb,
          title: null,
        }),
      })
      const result = await res.json()
      if (res.ok && result.ok) {
        toast.success(replaceMode ? 'PDF replaced!' : 'PDF uploaded!')
        setPdfs((prev) => {
          const filtered = prev.filter(
            (p) =>
              !(p.ncert_id === uploadChapter.id && p.level === uploadLevel)
          )
          return [...filtered, result.data]
        })
        closeUpload()
      } else {
        toast.error(result.error || 'Failed to save')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete ───
  const deletePdfFromStorage = async (pdfUrl: string | null) => {
    if (!pdfUrl) return
    try {
      await fetch(
        `/api/admin/notes/upload-pdf?url=${encodeURIComponent(pdfUrl)}`,
        { method: 'DELETE', credentials: 'include' }
      )
    } catch (err) {
      console.warn('[admin-chapter-pdfs] storage cleanup failed:', err)
    }
  }

  const handleDelete = async (pdf: ChapterPdf) => {
    const ui = LEVEL_UI[pdf.level]
    if (!confirm(`Delete ${ui.label} PDF? Ye action undo nahi hoga.`)) return
    setDeletingId(pdf.id)
    try {
      const res = await fetch(`/api/admin/chapter-pdfs?id=${pdf.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const result = await res.json()
      if (res.ok && result.ok) {
        await deletePdfFromStorage(result.data?.pdf_url || pdf.pdf_url)
        toast.success('PDF deleted')
        setPdfs((prev) => prev.filter((p) => p.id !== pdf.id))
      } else {
        toast.error(result.error || 'Delete failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeletingId(null)
    }
  }

  // ─── Helpers ───
  const formatSize = (kb: number | null): string => {
    if (!kb) return '—'
    if (kb < 1024) return `${kb} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const hasAnyFilter =
    !!classFilter || !!subjectFilter || langFilter !== 'all' || !!searchParam

  const totalPdfCount = pdfs.length

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* ═══ Header ═══ */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <AdminHeader title="📄 Chapter PDFs (Level-wise)" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <strong className="text-slate-700 dark:text-slate-300">
              {totalPdfCount}
            </strong>{' '}
            PDF{totalPdfCount === 1 ? '' : 's'} uploaded across all chapters
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cross-link to Note PDFs */}
          <Link
            href="/admin/pdfs"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            title="PDFs attached to individual notes"
          >
            <FileImage className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Note PDFs</span>
            <span aria-hidden="true" className="hidden sm:inline">→</span>
          </Link>
          <button
            type="button"
            onClick={openUploadFresh}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            Upload PDF
          </button>
        </div>
      </div>

      {/* ═══ Search ═══ */}
      <div className="surface-card p-3 sm:p-4 space-y-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search chapters, subjects, or numbers (e.g. 'class 10 trig')..."
            className="w-full pl-11 pr-11 py-3 text-sm font-medium rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 outline-none transition"
            aria-label="Search chapters"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ─── Tabs (Recent / Browse) ─── */}
        {!searchParam && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setView('recent')}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                view === 'recent'
                  ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              aria-pressed={view === 'recent'}
            >
              <History className="w-4 h-4" aria-hidden="true" />
              Recent
              {totalPdfCount > 0 && (
                <span className="text-[10px] opacity-75 tabular-nums">
                  ({Math.min(totalPdfCount, RECENT_LIMIT)})
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setView('browse')}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                view === 'browse'
                  ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              aria-pressed={view === 'browse'}
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              Browse All
            </button>
          </div>
        )}
      </div>

      {/* ═══ Content ═══ */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : searchParam ? (
        <SearchResults
          results={searchResults || []}
          totalResults={searchTotal}
          limit={SEARCH_LIMIT}
          pdfsByChapter={pdfsByChapter}
          onReplace={openReplace}
          onDelete={handleDelete}
          deletingId={deletingId}
          formatSize={formatSize}
          onClearSearch={clearSearch}
        />
      ) : view === 'recent' ? (
        <RecentView
          items={recentItems}
          totalCount={totalPdfCount}
          onReplace={openReplace}
          onDelete={handleDelete}
          deletingId={deletingId}
          formatSize={formatSize}
          onUpload={openUploadFresh}
        />
      ) : (
        <BrowseView
          classFilter={classFilter}
          subjectFilter={subjectFilter}
          langFilter={langFilter}
          classStats={classStats}
          subjectsForClass={subjectsForClass}
          chaptersForSubject={chaptersForSubject}
          pdfsByChapter={pdfsByChapter}
          onSelectClass={setClassFilter}
          onSelectSubject={setSubjectFilter}
          onSetLang={setLangFilter}
          onReplace={openReplace}
          onDelete={handleDelete}
          deletingId={deletingId}
          formatSize={formatSize}
          onReset={resetAll}
          hasAnyFilter={hasAnyFilter}
        />
      )}

      {/* ═══ Upload Modal ═══ */}
      {uploadOpen && (
        <UploadModal
          step={uploadStep}
          setStep={setUploadStep}
          uploadClass={uploadClass}
          setUploadClass={setUploadClass}
          uploadSubject={uploadSubject}
          setUploadSubject={setUploadSubject}
          uploadChapter={uploadChapter}
          setUploadChapter={setUploadChapter}
          uploadLevel={uploadLevel}
          setUploadLevel={setUploadLevel}
          uploadPdf={uploadPdf}
          setUploadPdf={setUploadPdf}
          chapters={chapters}
          replaceMode={replaceMode}
          saving={saving}
          onClose={closeUpload}
          onSave={handleSave}
          pdfsByChapter={pdfsByChapter}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Recent View
// ═══════════════════════════════════════════════════════════════
function RecentView({
  items,
  totalCount,
  onReplace,
  onDelete,
  deletingId,
  formatSize,
  onUpload,
}: {
  items: { pdf: ChapterPdf; chapter: Chapter }[]
  totalCount: number
  onReplace: (c: Chapter, l: NoteLevel) => void
  onDelete: (p: ChapterPdf) => void
  deletingId: number | null
  formatSize: (kb: number | null) => string
  onUpload: () => void
}) {
  if (items.length === 0) {
    return (
      <div className="surface-card p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
          <FileText className="w-8 h-8 text-slate-400" aria-hidden="true" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">
          No PDFs uploaded yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Start by uploading your first chapter PDF
        </p>
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          Upload PDF
        </button>
      </div>
    )
  }

  const showingCount = items.length
  const hasMore = totalCount > showingCount

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        Showing last <strong>{showingCount}</strong>
        {hasMore && (
          <>
            {' '}
            of <strong>{totalCount}</strong> PDFs
          </>
        )}{' '}
        — most recently updated first
      </div>
      {items.map(({ pdf, chapter }) => (
        <PdfRow
          key={pdf.id}
          chapter={chapter}
          pdf={pdf}
          isDeleting={deletingId === pdf.id}
          onReplace={() => onReplace(chapter, pdf.level)}
          onDelete={() => onDelete(pdf)}
          formatSize={formatSize}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Search Results
// ═══════════════════════════════════════════════════════════════
function SearchResults({
  results,
  totalResults,
  limit,
  pdfsByChapter,
  onReplace,
  onDelete,
  deletingId,
  formatSize,
  onClearSearch,
}: {
  results: Chapter[]
  totalResults: number
  limit: number
  pdfsByChapter: Map<number, Map<NoteLevel, ChapterPdf>>
  onReplace: (c: Chapter, l: NoteLevel) => void
  onDelete: (p: ChapterPdf) => void
  deletingId: number | null
  formatSize: (kb: number | null) => string
  onClearSearch: () => void
}) {
  if (results.length === 0) {
    return (
      <div className="surface-card p-12 text-center">
        <AlertCircle
          className="w-12 h-12 text-slate-300 mx-auto mb-3"
          aria-hidden="true"
        />
        <h3 className="font-bold text-slate-900 dark:text-white">
          No matches found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Try a different search term
        </p>
        <button
          type="button"
          onClick={onClearSearch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          Clear search
        </button>
      </div>
    )
  }

  const capped = totalResults > results.length
  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
        Found <strong>{totalResults}</strong> chapter
        {totalResults !== 1 ? 's' : ''}
        {capped && (
          <>
            {' — '}
            showing first <strong>{limit}</strong>. Refine your search to see
            more.
          </>
        )}
      </div>
      {results.map((ch) => (
        <ChapterCard
          key={ch.id}
          chapter={ch}
          pdfs={pdfsByChapter.get(ch.id) || new Map()}
          onReplace={onReplace}
          onDelete={onDelete}
          deletingId={deletingId}
          formatSize={formatSize}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Browse View
// ═══════════════════════════════════════════════════════════════
function BrowseView({
  classFilter,
  subjectFilter,
  langFilter,
  classStats,
  subjectsForClass,
  chaptersForSubject,
  pdfsByChapter,
  onSelectClass,
  onSelectSubject,
  onSetLang,
  onReplace,
  onDelete,
  deletingId,
  formatSize,
  onReset,
  hasAnyFilter,
}: {
  classFilter: string
  subjectFilter: string
  langFilter: Lang
  classStats: Map<number, { chapters: number; pdfs: number }>
  subjectsForClass: { subject: string; chapters: number; pdfs: number }[]
  chaptersForSubject: Chapter[]
  pdfsByChapter: Map<number, Map<NoteLevel, ChapterPdf>>
  onSelectClass: (c: string) => void
  onSelectSubject: (s: string) => void
  onSetLang: (l: Lang) => void
  onReplace: (c: Chapter, l: NoteLevel) => void
  onDelete: (p: ChapterPdf) => void
  deletingId: number | null
  formatSize: (kb: number | null) => string
  onReset: () => void
  hasAnyFilter: boolean
}) {
  return (
    <div className="space-y-4">
      {/* Class + language filter */}
      <div className="surface-card p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <GraduationCap
              className="w-4 h-4 text-brand-500"
              aria-hidden="true"
            />
            Class
          </div>
          {hasAnyFilter && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
            >
              <X className="w-3 h-3" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSelectClass('')}
            className={`px-3.5 py-2 rounded-full text-sm font-semibold transition ${
              classFilter === ''
                ? 'bg-gradient-to-r from-brand-500 to-purple-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            aria-pressed={classFilter === ''}
          >
            All
          </button>
          {CLASS_NUMS.map((cls) => {
            const stats = classStats.get(cls)
            const active = classFilter === String(cls)
            return (
              <button
                key={cls}
                type="button"
                onClick={() => onSelectClass(String(cls))}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition ${
                  active
                    ? 'bg-gradient-to-r from-brand-500 to-purple-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                aria-pressed={active}
              >
                Class {cls}
                {stats && stats.pdfs > 0 && (
                  <span
                    className={`text-[10px] px-1.5 rounded-full tabular-nums ${
                      active
                        ? 'bg-white/25 text-white'
                        : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {stats.pdfs}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Language
          </span>
          {(['all', 'hi', 'en'] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onSetLang(l)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                langFilter === l
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              aria-pressed={langFilter === l}
            >
              {l === 'all' ? 'All' : l === 'hi' ? 'हिंदी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {!classFilter ? (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
            Pick a class to browse chapters
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CLASS_NUMS.map((cls) => {
              const stats = classStats.get(cls) || { chapters: 0, pdfs: 0 }
              const maxPdfs = stats.chapters * 3
              const pct =
                maxPdfs > 0 ? Math.round((stats.pdfs / maxPdfs) * 100) : 0
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onSelectClass(String(cls))}
                  className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg transition text-left"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition">
                      {cls}
                    </div>
                    <ChevronRight
                      className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Class {cls}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {stats.chapters} chapters • {stats.pdfs} PDFs
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : !subjectFilter ? (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
            Class {classFilter} • Pick a subject
          </div>
          {subjectsForClass.length === 0 ? (
            <EmptyState message="No subjects found" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subjectsForClass.map(({ subject, chapters, pdfs }) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => onSelectSubject(subject)}
                  className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg transition text-left"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <BookOpen
                      className="w-5 h-5 text-brand-500 group-hover:scale-110 transition"
                      aria-hidden="true"
                    />
                    <ChevronRight
                      className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {subject}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {chapters} chapters • {pdfs} PDFs
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1 flex-wrap">
            <button
              type="button"
              onClick={() => onSelectSubject('')}
              className="inline-flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Class {classFilter}
            </button>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {subjectFilter}
            </span>
            <span className="ml-auto">
              {chaptersForSubject.length} chapters
            </span>
          </div>

          {chaptersForSubject.length === 0 ? (
            <EmptyState message="No chapters match filters" />
          ) : (
            chaptersForSubject.map((ch) => (
              <ChapterCard
                key={ch.id}
                chapter={ch}
                pdfs={pdfsByChapter.get(ch.id) || new Map()}
                onReplace={onReplace}
                onDelete={onDelete}
                deletingId={deletingId}
                formatSize={formatSize}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Chapter Card
// ═══════════════════════════════════════════════════════════════
function ChapterCard({
  chapter,
  pdfs,
  onReplace,
  onDelete,
  deletingId,
  formatSize,
}: {
  chapter: Chapter
  pdfs: Map<NoteLevel, ChapterPdf>
  onReplace: (c: Chapter, l: NoteLevel) => void
  onDelete: (p: ChapterPdf) => void
  deletingId: number | null
  formatSize: (kb: number | null) => string
}) {
  const uploadedCount = pdfs.size

  return (
    <div className="surface-card p-4 rounded-2xl">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
              Class {chapter.class} • {chapter.subject} • Ch {chapter.chapter_num}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                chapter.language === 'hi'
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {chapter.language}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                uploadedCount === 3
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : uploadedCount > 0
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {uploadedCount}/3
            </span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">
            {chapter.chapter_title || `Chapter ${chapter.chapter_num}`}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {LEVELS.map((level) => {
          const ui = LEVEL_UI[level]
          const pdf = pdfs.get(level)
          const isDeleting = pdf && deletingId === pdf.id

          return (
            <div
              key={level}
              className={`rounded-xl border-2 p-2.5 transition ${
                pdf
                  ? `${ui.activeClass} border-solid`
                  : 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-sm leading-none" aria-hidden="true">
                  {ui.emoji}
                </span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {ui.label}
                </span>
                {pdf && (
                  <Check
                    className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-auto"
                    aria-hidden="true"
                  />
                )}
              </div>

              {pdf ? (
                <>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-1.5">
                    {formatSize(pdf.pdf_size_kb)}
                    {' • '}
                    <span className="text-slate-400">
                      {relativeTime(pdf.updated_at)}
                    </span>
                  </p>
                  <div className="flex items-center gap-1">
                    <a
                      href={pdf.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      aria-label={`View ${ui.label} PDF`}
                    >
                      <Download className="w-3 h-3" aria-hidden="true" />
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => onReplace(chapter, level)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                      aria-label={`Replace ${ui.label} PDF`}
                      title="Replace"
                    >
                      <RefreshCw className="w-3 h-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(pdf)}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
                      aria-label={`Delete ${ui.label} PDF`}
                      title="Delete"
                    >
                      {isDeleting ? (
                        <Loader2
                          className="w-3 h-3 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onReplace(chapter, level)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <Upload className="w-3 h-3" aria-hidden="true" />
                  Upload
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PdfRow (compact for Recent)
// ═══════════════════════════════════════════════════════════════
function PdfRow({
  chapter,
  pdf,
  isDeleting,
  onReplace,
  onDelete,
  formatSize,
}: {
  chapter: Chapter
  pdf: ChapterPdf
  isDeleting: boolean
  onReplace: () => void
  onDelete: () => void
  formatSize: (kb: number | null) => string
}) {
  const ui = LEVEL_UI[pdf.level]
  return (
    <div className="surface-card p-3 sm:p-4 rounded-2xl flex items-center gap-3">
      <span className="text-xl leading-none flex-shrink-0" aria-hidden="true">
        {ui.emoji}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
            Class {chapter.class} • {chapter.subject} • Ch {chapter.chapter_num}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ui.badgeClass}`}
          >
            {ui.label}
          </span>
        </div>
        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
          {chapter.chapter_title || `Chapter ${chapter.chapter_num}`}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {formatSize(pdf.pdf_size_kb)} • {relativeTime(pdf.updated_at)}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <a
          href={pdf.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="View PDF"
          title="View"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={onReplace}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
          aria-label="Replace PDF"
          title="Replace"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
          aria-label="Delete PDF"
          title="Delete"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Empty State
// ═══════════════════════════════════════════════════════════════
function EmptyState({ message }: { message: string }) {
  return (
    <div className="surface-card p-12 text-center">
      <AlertCircle
        className="w-12 h-12 text-slate-300 mx-auto mb-3"
        aria-hidden="true"
      />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Upload Modal (Cascade) — with Escape + focus trap
// ═══════════════════════════════════════════════════════════════
function UploadModal({
  step,
  setStep,
  uploadClass,
  setUploadClass,
  uploadSubject,
  setUploadSubject,
  uploadChapter,
  setUploadChapter,
  uploadLevel,
  setUploadLevel,
  uploadPdf,
  setUploadPdf,
  chapters,
  replaceMode,
  saving,
  onClose,
  onSave,
  pdfsByChapter,
}: {
  step: 1 | 2 | 3 | 4
  setStep: (s: 1 | 2 | 3 | 4) => void
  uploadClass: number | null
  setUploadClass: (c: number | null) => void
  uploadSubject: string
  setUploadSubject: (s: string) => void
  uploadChapter: Chapter | null
  setUploadChapter: (c: Chapter | null) => void
  uploadLevel: NoteLevel | null
  setUploadLevel: (l: NoteLevel | null) => void
  uploadPdf: { pdf_url: string | null; pdf_size_kb: number | null }
  setUploadPdf: (v: {
    pdf_url: string | null
    pdf_size_kb: number | null
  }) => void
  chapters: Chapter[]
  replaceMode: boolean
  saving: boolean
  onClose: () => void
  onSave: () => void
  pdfsByChapter: Map<number, Map<NoteLevel, ChapterPdf>>
}) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Escape key closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  // Focus trap
  useEffect(() => {
    const el = modalRef.current
    if (!el) return
    const focusables = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (focusables.length === 0) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    el.addEventListener('keydown', trap)
    // Initial focus
    requestAnimationFrame(() => first?.focus())
    return () => el.removeEventListener('keydown', trap)
  }, [step])

  const subjects = useMemo(() => {
    if (!uploadClass) return []
    return [
      ...new Set(
        chapters.filter((c) => c.class === uploadClass).map((c) => c.subject)
      ),
    ].sort()
  }, [chapters, uploadClass])

  // Language filter for chapters in cascade (respect uploadClass only)
  const [cascadeLang, setCascadeLang] = useState<Lang>('all')

  const chaptersForSubject = useMemo(() => {
    if (!uploadClass || !uploadSubject) return []
    return chapters
      .filter(
        (c) => c.class === uploadClass && c.subject === uploadSubject
      )
      .filter((c) => cascadeLang === 'all' || c.language === cascadeLang)
  }, [chapters, uploadClass, uploadSubject, cascadeLang])

  const canGoBack = !replaceMode && step > 1

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose()
      }}
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3
              id="upload-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              {replaceMode ? 'Replace PDF' : 'Upload New PDF'}
            </h3>
            {!replaceMode && (
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                <span
                  className={
                    step >= 1 && uploadClass !== null
                      ? 'font-semibold text-slate-700 dark:text-slate-300'
                      : ''
                  }
                >
                  Class {uploadClass ?? '—'}
                </span>
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
                <span
                  className={
                    step >= 2 && uploadSubject
                      ? 'font-semibold text-slate-700 dark:text-slate-300'
                      : ''
                  }
                >
                  {uploadSubject || 'Subject'}
                </span>
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
                <span
                  className={
                    step >= 3 && uploadChapter
                      ? 'font-semibold text-slate-700 dark:text-slate-300'
                      : ''
                  }
                >
                  {uploadChapter
                    ? `Ch ${uploadChapter.chapter_num}`
                    : 'Chapter'}
                </span>
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
                <span
                  className={
                    step >= 4 && uploadLevel
                      ? 'font-semibold text-slate-700 dark:text-slate-300'
                      : ''
                  }
                >
                  {uploadLevel ? LEVEL_UI[uploadLevel].label : 'Level'}
                </span>
              </div>
            )}
            {replaceMode && uploadChapter && uploadLevel && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {LEVEL_UI[uploadLevel].emoji} {LEVEL_UI[uploadLevel].label} •{' '}
                Class {uploadChapter.class} • Ch {uploadChapter.chapter_num}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-[280px] mb-4">
          {step === 1 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Pick a class
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CLASS_NUMS.map((cls) => {
                  const active = uploadClass === cls
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        setUploadClass(cls)
                        setUploadSubject('')
                        setUploadChapter(null)
                        setCascadeLang('all')
                        setStep(2)
                      }}
                      className={`p-3 rounded-xl border-2 font-semibold text-sm transition ${
                        active
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                          : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Class {cls}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Class {uploadClass} — Pick a subject
              </p>
              {subjects.length === 0 ? (
                <EmptyState message="No subjects for this class" />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subj) => {
                    const active = uploadSubject === subj
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => {
                          setUploadSubject(subj)
                          setUploadChapter(null)
                          setStep(3)
                        }}
                        className={`p-3 rounded-xl border-2 font-semibold text-sm text-left transition ${
                          active
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                            : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {subj}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Class {uploadClass} • {uploadSubject}
                </p>
                {/* Language filter in cascade */}
                <div className="flex items-center gap-1">
                  {(['all', 'hi', 'en'] as Lang[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setCascadeLang(l)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                        cascadeLang === l
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {l === 'all' ? 'All' : l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {chaptersForSubject.length === 0 ? (
                <EmptyState message="No chapters match — try different language" />
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                  {chaptersForSubject.map((ch) => {
                    const active = uploadChapter?.id === ch.id
                    const pdfCount = pdfsByChapter.get(ch.id)?.size || 0
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setUploadChapter(ch)
                          setUploadLevel(null)
                          setUploadPdf({
                            pdf_url: null,
                            pdf_size_kb: null,
                          })
                          setStep(4)
                        }}
                        className={`w-full p-3 rounded-xl border-2 text-left transition ${
                          active
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                            : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                              Ch {ch.chapter_num} • {ch.language.toUpperCase()}
                            </p>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                              {ch.chapter_title || `Chapter ${ch.chapter_num}`}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                              pdfCount === 3
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : pdfCount > 0
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {pdfCount}/3
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {uploadChapter && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                    Class {uploadChapter.class} • {uploadChapter.subject} • Ch{' '}
                    {uploadChapter.chapter_num} •{' '}
                    {uploadChapter.language.toUpperCase()}
                  </p>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                    {uploadChapter.chapter_title ||
                      `Chapter ${uploadChapter.chapter_num}`}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Level
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map((level) => {
                    const ui = LEVEL_UI[level]
                    const active = uploadLevel === level
                    const existing = uploadChapter
                      ? pdfsByChapter.get(uploadChapter.id)?.get(level)
                      : null
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          setUploadLevel(level)
                          setUploadPdf({
                            pdf_url: existing?.pdf_url || null,
                            pdf_size_kb: existing?.pdf_size_kb || null,
                          })
                        }}
                        className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 font-semibold text-xs transition ${
                          active
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 scale-105 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-lg" aria-hidden="true">
                          {ui.emoji}
                        </span>
                        <span>{ui.label}</span>
                        {existing && (
                          <Check
                            className="absolute top-1 right-1 w-3.5 h-3.5 text-emerald-600"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {uploadLevel && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    PDF File
                  </p>
                  <PdfUploadField
                    value={uploadPdf}
                    onChange={(val) => setUploadPdf(val)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {canGoBack && (
            <button
              type="button"
              onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          {step === 4 && (
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !uploadLevel || !uploadPdf.pdf_url}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold text-sm hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  {replaceMode ? 'Replace' : 'Save PDF'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}