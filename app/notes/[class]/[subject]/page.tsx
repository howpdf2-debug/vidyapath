import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BookOpen,
  FileText,
  ArrowRight,
  ChevronRight,
  Home,
  Download,
  Clock,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BackButton } from '@/components/BackButton'
import { NotesFilterBar } from '@/components/NotesFilterBar'
import {
  LEVEL_META,
  NOTE_LEVELS,
  type NoteLevel,
} from '@/lib/db-types'

// ─── ISR: 1 hour ───
export const revalidate = 3600

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
type PageParams = { class: string; subject: string }
type SearchParamsShape = {
  lang?: string
  level?: string
  sort?: string
  q?: string
}

interface RawNote {
  id: number
  ncert_id: number
  topic: string
  level: NoteLevel
  word_count: number | null
  reading_time_min: number | null
  content_html: string | null
}

interface ChapterWithNotes {
  id: number
  chapter_num: number
  chapter_title: string | null
  book_code: string | null
  notes: RawNote[]
}

// ═══════════════════════════════════════════════════════════════
// generateMetadata
// ═══════════════════════════════════════════════════════════════
export async function generateMetadata({
  params,
}: {
  params: PageParams | Promise<PageParams>
}): Promise<Metadata> {
  const p = await params
  const classNum = p.class
  const subjectName = decodeURIComponent(p.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return buildMetadata({
    title: `Class ${classNum} ${subjectName} Notes — Free Download | VidyaPath`,
    description: `Free Class ${classNum} ${subjectName} study notes. Chapter-wise summary, revision material, PDFs.`,
    path: `/notes/${p.class}/${p.subject}`,
    keywords: [
      `class ${classNum} ${subjectName} notes`,
      'free study notes',
      'chapter notes',
    ],
  })
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeExcerpt(html: string | null, max = 140): string {
  if (!html) return ''
  const text = stripHtml(html)
  if (text.length <= max) return text
  const cut = text.slice(0, max).trim()
  const lastSpace = cut.lastIndexOf(' ')
  const final = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return final + '…'
}

function formatTime(minutes: number, lang: 'hi' | 'en'): string {
  if (!minutes || minutes < 1) {
    return lang === 'hi' ? '<1 मिनट' : '<1 min'
  }
  return lang === 'hi' ? `${minutes} मिनट` : `${minutes} min`
}

function formatWords(words: number, lang: 'hi' | 'en'): string {
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN'
  const label = lang === 'hi' ? 'शब्द' : 'words'
  return `${words.toLocaleString(locale)} ${label}`
}

function sortNotesByLevel(notes: RawNote[]): RawNote[] {
  const order = new Map<NoteLevel, number>()
  NOTE_LEVELS.forEach((lvl, i) => order.set(lvl, i))
  return [...notes].sort(
    (a, b) => (order.get(a.level) ?? 99) - (order.get(b.level) ?? 99)
  )
}

function sumReadingTime(notes: RawNote[]): number {
  return notes.reduce((s, n) => s + (n.reading_time_min ?? 0), 0)
}

function sumWords(notes: RawNote[]): number {
  return notes.reduce((s, n) => s + (n.word_count ?? 0), 0)
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════
export default async function NotesSubjectPage({
  params,
  searchParams,
}: {
  params: PageParams | Promise<PageParams>
  searchParams: SearchParamsShape | Promise<SearchParamsShape>
}) {
  // ─── Next 14 + 15 dual compat ───
  const p = await params
  const sp = await searchParams

  const classNum = parseInt(p.class, 10)
  const subject = decodeURIComponent(p.subject)
  const lang: 'hi' | 'en' = sp.lang === 'hi' ? 'hi' : 'en'
  const levelFilter = (sp.level ?? '').toLowerCase()
  const sortBy = sp.sort ?? 'chapter'
  const query = (sp.q ?? '').trim().toLowerCase()

  if (isNaN(classNum)) notFound()

  const subjectName = subject
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const supabase = createServerClient()

  // ─── 1. Fetch chapters ───
  const { data: chapters, error: chaptersErr } = await supabase
    .from('ncert')
    .select('id, chapter_num, chapter_title, book_code')
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('language', lang)
    .order('chapter_num', { ascending: true })

  if (chaptersErr) {
    console.error('[notes] chapters fetch failed:', chaptersErr.message)
  }

  if (!chapters || chapters.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6">
        <BackButton href="/notes" label="Back to Notes" language={lang} />
        <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">
            Class {classNum} {subjectName} Notes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            📭 {lang === 'hi' ? 'नोट्स जल्द आ रहे हैं' : 'Notes coming soon'}
          </p>
        </div>
      </div>
    )
  }

  // ─── 2. Fetch published notes ───
  const chapterIds = chapters.map((c) => c.id)
  const { data: rawNotes, error: notesErr } = await supabase
    .from('chapter_notes')
    .select(
      'id, ncert_id, topic, level, word_count, reading_time_min, content_html'
    )
    .in('ncert_id', chapterIds)
    .eq('status', 'published')

  if (notesErr) {
    console.error('[notes] notes fetch failed:', notesErr.message)
  }

  // ─── 3. Group notes by chapter ───
  const notesByChapter = new Map<number, RawNote[]>()
  for (const n of (rawNotes ?? []) as RawNote[]) {
    const arr = notesByChapter.get(n.ncert_id) ?? []
    arr.push(n)
    notesByChapter.set(n.ncert_id, arr)
  }

  const allChapters: ChapterWithNotes[] = chapters.map((ch) => ({
    ...ch,
    notes: sortNotesByLevel(notesByChapter.get(ch.id) ?? []),
  }))

  // ─── 4. Level counts (for filter chips — based on ALL chapters) ───
  const levelCounts = {
    basic: allChapters.filter((c) =>
      c.notes.some((n) => n.level === 'basic')
    ).length,
    advance: allChapters.filter((c) =>
      c.notes.some((n) => n.level === 'advance')
    ).length,
    pro: allChapters.filter((c) =>
      c.notes.some((n) => n.level === 'pro')
    ).length,
  }

  // ─── 5. Apply level filter (validated) ───
  const isValidLevel = NOTE_LEVELS.includes(levelFilter as NoteLevel)
  let filtered = allChapters
  if (isValidLevel) {
    filtered = filtered.filter((c) =>
      c.notes.some((n) => n.level === (levelFilter as NoteLevel))
    )
  }

  // ─── 6. Apply search ───
  if (query) {
    filtered = filtered.filter((c) => {
      const titleMatch = (c.chapter_title ?? '').toLowerCase().includes(query)
      const topicMatch = c.notes.some((n) =>
        (n.topic ?? '').toLowerCase().includes(query)
      )
      return titleMatch || topicMatch
    })
  }

  // ─── 7. Apply sort ───
  if (sortBy === 'time') {
    filtered = [...filtered].sort(
      (a, b) => sumReadingTime(b.notes) - sumReadingTime(a.notes)
    )
  } else if (sortBy === 'notes') {
    filtered = [...filtered].sort((a, b) => b.notes.length - a.notes.length)
  }
  // 'chapter' — already ordered by chapter_num from DB

  // ─── 8. Hero stats ───
  const totalNotes = rawNotes?.length ?? 0
  const chaptersWithContent = allChapters.filter(
    (c) => c.notes.length > 0
  ).length
  const totalMinutes = sumReadingTime(allChapters.flatMap((c) => c.notes))

  // ─── 9. i18n strings ───
  const t =
    lang === 'hi'
      ? {
          studyNotes: 'अध्ययन नोट्स',
          chaptersAvailable: 'अध्याय उपलब्ध',
          withNotes: 'नोट्स के साथ',
          chapter: 'अध्याय',
          notes: 'नोट्स',
          comingSoon: 'जल्द आ रहा है',
          read: 'पढ़ें',
          pdf: 'PDF',
          home: 'होम',
          notesCrumb: 'नोट्स',
          ncertPdf: 'NCERT PDF',
          noMatch: 'कोई अध्याय नहीं मिला',
          noMatchDesc: 'फ़िल्टर बदलें या रीसेट करें',
          reset: 'रीसेट करें',
          backToNotes: 'नोट्स पर वापस',
        }
      : {
          studyNotes: 'Study Notes',
          chaptersAvailable: 'chapters available',
          withNotes: 'with notes',
          chapter: 'Chapter',
          notes: 'notes',
          comingSoon: 'Coming soon',
          read: 'Read',
          pdf: 'PDF',
          home: 'Home',
          notesCrumb: 'Notes',
          ncertPdf: 'NCERT PDF',
          noMatch: 'No chapters found',
          noMatchDesc: 'Try changing or resetting filters',
          reset: 'Reset',
          backToNotes: 'Back to Notes',
        }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <BackButton href="/notes" label={t.backToNotes} language={lang} />

      {/* ─── Breadcrumb ─── */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap"
      >
        <Link
          href="/"
          className="hover:text-indigo-600 flex items-center gap-1"
        >
          <Home className="w-3.5 h-3.5" aria-hidden="true" /> {t.home}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <Link href="/notes" className="hover:text-indigo-600">
          {t.notesCrumb}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          Class {classNum} • {subjectName}
        </span>
      </nav>

      {/* ─── Compact Hero ─── */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 md:p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
              <BookOpen className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
                Class {classNum} • {subjectName}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mt-0.5">
                {t.studyNotes}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-white/85">
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  {chapters.length} {t.chaptersAvailable}
                </span>
                {totalNotes > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    {totalNotes} {t.notes}
                  </span>
                )}
                {chaptersWithContent > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    {chaptersWithContent} {t.withNotes}
                  </span>
                )}
                {totalMinutes > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {formatTime(totalMinutes, lang)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* ─── Filter Bar (Suspense-wrapped for Next 15) ─── */}
      <Suspense
        fallback={
          <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        }
      >
        <NotesFilterBar
          levelCounts={levelCounts}
          lang={lang}
          totalCount={allChapters.length}
        />
      </Suspense>

      {/* ─── Filtered Empty State ─── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <Search
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            aria-hidden="true"
          />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {t.noMatch}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.noMatchDesc}
          </p>
          <Link
            href={`/notes/${classNum}/${encodeURIComponent(
              subject
            )}?lang=${lang}`}
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition"
          >
            {t.reset}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ch) => {
            const hasNotes = ch.notes.length > 0
            const pdfUrl = ch.book_code
              ? `https://ncert.nic.in/textbook/pdf/${ch.book_code}.pdf`
              : null
            const href = `/notes/${classNum}/${encodeURIComponent(
              subject
            )}/${ch.chapter_num}?lang=${lang}`

            // ─── Empty chapter ───
            if (!hasNotes) {
              return (
                <div
                  key={ch.id}
                  className="group flex items-start gap-3 p-4 sm:p-5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">
                    {ch.chapter_num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                      {t.chapter} {ch.chapter_num}
                    </p>
                    <h3 className="font-semibold text-gray-600 dark:text-gray-400 line-clamp-2">
                      {ch.chapter_title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[10px] font-medium">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {t.comingSoon}
                      </span>
                      {pdfUrl && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-medium hover:bg-rose-100 transition"
                          aria-label={`${t.ncertPdf} — ${t.chapter} ${ch.chapter_num}`}
                        >
                          <Download className="w-3 h-3" aria-hidden="true" />
                          {t.ncertPdf}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            }

            // ─── Featured chapter ───
            const levelsAvailable = NOTE_LEVELS.filter((lvl) =>
              ch.notes.some((n) => n.level === lvl)
            )
            const totalMinutesCh = sumReadingTime(ch.notes)
            const totalWordsCh = sumWords(ch.notes)
            const firstNote = ch.notes[0]
            const excerpt = makeExcerpt(firstNote.content_html)

            return (
              <article
                key={ch.id}
                className="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all overflow-hidden"
              >
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"
                />

                <Link
                  href={href}
                  className="flex items-start gap-3 p-4 sm:p-5 pb-3"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white shadow-md group-hover:scale-105 transition">
                    {ch.chapter_num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                      {t.chapter} {ch.chapter_num}
                    </p>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2 leading-snug">
                      {ch.chapter_title}
                    </h3>
                  </div>
                </Link>

                <div className="px-4 sm:px-5 pb-2 flex flex-wrap items-center gap-1.5">
                  {levelsAvailable.map((lvl) => {
                    const meta = LEVEL_META[lvl]
                    return (
                      <span
                        key={lvl}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.bg} ${meta.color}`}
                      >
                        <span aria-hidden="true">{meta.emoji}</span>
                        {meta.label}
                      </span>
                    )
                  })}
                </div>

                <div className="px-4 sm:px-5 pb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3 h-3" aria-hidden="true" />
                    {ch.notes.length} {t.notes}
                  </span>
                  {totalMinutesCh > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {formatTime(totalMinutesCh, lang)}
                    </span>
                  )}
                  {totalWordsCh > 0 && (
                    <span className="tabular-nums">
                      {formatWords(totalWordsCh, lang)}
                    </span>
                  )}
                </div>

                {excerpt && (
                  <p className="px-4 sm:px-5 pb-3 text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                    {excerpt}
                  </p>
                )}

                <div className="mt-auto px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  <Link
                    href={href}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold hover:shadow-md hover:scale-[1.01] transition"
                    aria-label={`${t.read} ${ch.chapter_title}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.read}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/50 transition"
                      aria-label={`${t.ncertPdf} — ${t.chapter} ${ch.chapter_num}`}
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      {t.pdf}
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}