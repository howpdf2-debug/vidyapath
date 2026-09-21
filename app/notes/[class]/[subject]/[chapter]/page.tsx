import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import {
  FileText,
  Download,
  ChevronRight,
  Home,
  BookOpen,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { buildMetadata, SITE_URL } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BackButton } from '@/components/BackButton'
import { VideoSection } from '@/components/VideoSection'
import { NotesSection } from '@/components/NotesSection'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ShareButton } from '@/components/ShareButton'
import { CommentSection } from '@/components/CommentSection'
import { ProgressButton } from '@/app/ncert/[class]/[subject]/[chapter]/ProgressButton'
import { NoteCard, type Note } from '@/components/notes/NoteCard'
import { ChapterNavigation } from '@/components/notes/ChapterNavigation'
import { isUserConfirmed } from '@/lib/auth'
import { getServerSession } from '@/lib/auth-server'
import { getPdfUrl } from '@/lib/pdf'

export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function safePdfUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  if (!url.startsWith('http://') && !url.startsWith('https://')) return null
  if (url.includes('/null/') || url.includes('/undefined/')) return null
  return url
}

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

// ═══════════════════════════════════════════════════════
// ✅ N2, N3 FIX: React cache() — dedup metadata + page
// ═══════════════════════════════════════════════════════
interface ChapterRow {
  id: string
  class: number
  chapter_num: number
  chapter_title: string | null
  book_code: string | null
  pdf_url: string | null
  language: string
}

const getChapterList = cache(
  async (
    classNum: number,
    subject: string,
    lang: string
  ): Promise<{ data: ChapterRow[]; error: string | null }> => {
    try {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('ncert')
        .select(
          'id, class, chapter_num, chapter_title, book_code, pdf_url, language'
        )
        .eq('class', classNum)
        .eq('subject', subject)
        .eq('language', lang)
        .order('chapter_num', { ascending: true })

      if (error) {
        console.error('[notes-cache] query failed:', error.message)
        return { data: [], error: error.message }
      }
      return { data: (data ?? []) as ChapterRow[], error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[notes-cache] unexpected:', msg)
      return { data: [], error: msg }
    }
  }
)

// ==================== SEO ====================
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { class: string; subject: string; chapter: string }
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const classNum = parseInt(params.class, 10)
  const subjectName = safeDecode(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const chapterNum = parseInt(params.chapter, 10)
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  let chapterTitle = `Chapter ${chapterNum}`
  if (!isNaN(classNum) && !isNaN(chapterNum)) {
    const { data } = await getChapterList(classNum, subjectName, lang)
    const current = data.find((c) => c.chapter_num === chapterNum)
    if (current?.chapter_title) chapterTitle = current.chapter_title
  }

  const path = `/notes/${params.class}/${params.subject}/${params.chapter}`
  const baseMeta = buildMetadata({
    title: `Class ${classNum} ${subjectName} ${chapterTitle} Notes | VidyaPath`,
    description: `Free notes for Class ${classNum} ${subjectName} ${chapterTitle}.`,
    path,
  })

  return {
    ...baseMeta,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        'hi-IN': `${SITE_URL}${path}?lang=hi`,
        'en-IN': `${SITE_URL}${path}?lang=en`,
      },
    },
  }
}

// ==================== PAGE ====================
export default async function NotesChapterPage({
  params,
  searchParams,
}: {
  params: { class: string; subject: string; chapter: string }
  searchParams: { lang?: string }
}) {
  const classNum = parseInt(params.class, 10)
  const chapterNum = parseInt(params.chapter, 10)
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  // ✅ N4, N19 FIX: numeric validation
  if (isNaN(classNum) || isNaN(chapterNum)) notFound()

  // ✅ N5, N16 FIX: normalized subject (matches DB)
  const subject = safeDecode(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const subjectName = subject
  const rawSubject = params.subject

  // ✅ N2, N3 FIX: single cached query
  const { data: chapterList, error: listErr } = await getChapterList(
    classNum,
    subject,
    lang
  )

  if (listErr) {
    console.error('[notes-page] list failed:', listErr)
    notFound()
  }

  const currentIdx = chapterList.findIndex(
    (c) => c.chapter_num === chapterNum
  )

  if (currentIdx === -1) notFound()

  const chapter = chapterList[currentIdx]
  const totalChapters = chapterList.length
  const prevChapter = currentIdx > 0 ? chapterList[currentIdx - 1] : null
  const nextChapter =
    currentIdx < chapterList.length - 1 ? chapterList[currentIdx + 1] : null

  // ✅ N6 FIX: subjectHref points to Notes, not NCERT
  const makeHref = (chNum: number) =>
    `/notes/${classNum}/${rawSubject}/${chNum}?lang=${lang}`

  const session = await getServerSession()
  const isLoggedIn = !!session?.user && isUserConfirmed(session.user)
  const supabaseAuth = isLoggedIn ? createServerClientWithCookies() : null
  const currentUserId = session?.user?.id

  const supabase = createServerClient()

  // Parallel queries
  const [notesRes, videosRes, bookmarkRes] = await Promise.all([
    supabase
      .from('chapter_notes')
      .select('*')
      .eq('ncert_id', chapter.id)
      .order('order_index', { ascending: true }),

    supabase
      .from('chapter_videos')
      .select(
        'id, youtube_id, title, description, thumbnail_url, duration_seconds, video_type, language, order_index, is_featured'
      )
      .eq('ncert_id', chapter.id)
      .eq('is_active', true)
      .eq('language', lang)
      .order('is_featured', { ascending: false })
      .order('order_index', { ascending: true }),

    supabaseAuth && currentUserId
      ? supabaseAuth
          .from('bookmarks')
          .select('id')
          .eq('user_id', currentUserId)
          .eq('ncert_id', chapter.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null } as {
          data: { id: string } | null
          error: null
        }),
  ])

  if (notesRes.error) {
    console.error('[notes-page] notes failed:', notesRes.error.message)
  }
  if (videosRes.error) {
    console.error('[notes-page] videos failed:', videosRes.error.message)
  }

  const notes = (notesRes.data ?? []) as Note[]
  const videos = videosRes.data ?? []
  const isBookmarked = !!bookmarkRes.data

  const chapterTitle = chapter.chapter_title?.trim() || `Chapter ${chapterNum}`

  // ✅ N18 FIX: safe PDF URL
  const rawPdfUrl =
    chapter.pdf_url || getPdfUrl(chapter.book_code, classNum, chapterNum)
  const pdfUrl = safePdfUrl(rawPdfUrl)

  const hasNotes = notes.length > 0
  const canonicalUrl = `${SITE_URL}/notes/${params.class}/${params.subject}/${params.chapter}`

  // ✅ N10 FIX: JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `Class ${classNum} ${subjectName} Chapter ${chapterNum} Notes`,
    description: `Free notes for Class ${classNum} ${subjectName} Chapter ${chapterNum}`,
    educationalLevel: `Class ${classNum}`,
    inLanguage: lang === 'hi' ? 'hi' : 'en',
    url: canonicalUrl,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <div className="space-y-6">
        <BackButton
          href={`/notes/${classNum}/${rawSubject}?lang=${lang}`}
          label="Back to chapters"
          language={lang as 'en' | 'hi'}
        />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
          <Link
            href="/"
            className="hover:text-indigo-600 flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/notes" className="hover:text-indigo-600">
            Notes
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/notes/${classNum}`}
            className="hover:text-indigo-600"
          >
            Class {classNum}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/notes/${classNum}/${rawSubject}`}
            className="hover:text-indigo-600"
          >
            {subjectName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            Chapter {chapterNum}
          </span>
        </nav>

        {/* Header */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 md:p-8 text-white">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0 border border-white/30">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80">
                  Class {classNum} • {subjectName} • Chapter {chapterNum}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold mt-1 break-words">
                  {chapterTitle}
                </h1>
                {hasNotes && (
                  <p className="text-xs text-white/70 mt-2">
                    📚 {notes.length}{' '}
                    {lang === 'hi' ? 'notes उपलब्ध' : 'notes available'}
                  </p>
                )}
              </div>
            </div>
            <LanguageToggle />
          </div>
        </header>

        {/* ✅ N1 FIX: Cross-link REMOVED (user requirement) */}

        {/* ✅ N20 FIX: Actions row — horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <BookmarkButton
            chapterId={chapter.id}
            initialBookmarked={isBookmarked}
          />
          <ProgressButton chapterId={chapter.id} />
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              /* ✅ N8 FIX: indigo gradient (consistent with NCERT) */
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition text-sm font-medium flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              aria-label={`NCERT Book PDF — ${chapterTitle}`}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">NCERT Book PDF</span>
              <span className="sm:hidden">Book</span>
            </a>
          )}
          <div className="flex-shrink-0">
            <ShareButton
              title={`Class ${classNum} ${subjectName} Chapter ${chapterNum}`}
              url={canonicalUrl}
            />
          </div>
        </div>

        {/* ✅ N9 FIX: Videos — only if exist */}
        {videos.length > 0 && (
          <VideoSection
            chapterId={chapter.id}
            chapterTitle={chapterTitle}
            videos={videos}
            language={lang}
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* Notes */}
        {hasNotes ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <FileText
                className="w-5 h-5 text-emerald-600"
                aria-hidden="true"
              />
              Chapter Notes
            </div>

            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <NotesSection
            chapterId={chapter.id}
            chapterTitle={chapterTitle}
            notesAvailable={false}
            pdfUrl={pdfUrl}
            youtubeId={videos?.[0]?.youtube_id || null}
            isLoggedIn={isLoggedIn}
            language={lang}
          />
        )}

        <CommentSection chapterId={chapter.id} />

        {/* ✅ N11 FIX: ChapterNavigation — works for both notes + fallback */}
        {/* ✅ N6 FIX: subjectHref → /notes/... (not /ncert/) */}
        <ChapterNavigation
          currentChapterNum={chapterNum}
          totalChapters={totalChapters}
          prev={
            prevChapter
              ? {
                  chapter_num: prevChapter.chapter_num,
                  chapter_title:
                    prevChapter.chapter_title?.trim() ||
                    `Chapter ${prevChapter.chapter_num}`,
                  href: makeHref(prevChapter.chapter_num),
                }
              : null
          }
          next={
            nextChapter
              ? {
                  chapter_num: nextChapter.chapter_num,
                  chapter_title:
                    nextChapter.chapter_title?.trim() ||
                    `Chapter ${nextChapter.chapter_num}`,
                  href: makeHref(nextChapter.chapter_num),
                }
              : null
          }
          language={lang}
          variant="indigo"
          subjectHref={`/notes/${classNum}/${rawSubject}?lang=${lang}`}
          subjectName={subjectName}
        />
      </div>
    </>
  )
}