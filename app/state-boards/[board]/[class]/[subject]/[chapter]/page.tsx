import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  Download,
  FileText,
  Home,
  BookOpen,
  Languages,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { buildMetadata, SITE_URL } from '@/lib/seo'
import {
  getBoard,
  getSubjectBySlug,
  getDbSubjectName,
  isValidClass,
} from '@/lib/state-boards'
import { getPdfUrl } from '@/lib/pdf'
import { VideoSection } from '@/components/VideoSection'
import { CommentSection } from '@/components/CommentSection'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ShareButton } from '@/components/ShareButton'
import { ProgressButton } from '@/app/ncert/[class]/[subject]/[chapter]/ProgressButton'
import { NoteCard, type Note } from '@/components/notes/NoteCard'
import { NotesHint } from '@/components/notes/NotesHint'
import {
  NotesPreviewCard,
  type PreviewNote,
} from '@/components/notes/NotesPreviewCard'
import { ChapterNavigation } from '@/components/notes/ChapterNavigation'
import { isUserConfirmed } from '@/lib/auth'
import { getServerSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { board: string; class: string; subject: string; chapter: string }
}

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
// ✅ SB9 FIX: cache() — dedup between metadata + page
// ═══════════════════════════════════════════════════════
interface ChapterRow {
  id: string
  chapter_num: number
  chapter_title: string | null
  book_code: string | null
  pdf_url: string | null
  language: string
}

const getChapterList = cache(
  async (
    classNum: number,
    dbSubjectName: string
  ): Promise<{ data: ChapterRow[]; error: string | null }> => {
    try {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('ncert')
        .select(
          'id, chapter_num, chapter_title, book_code, pdf_url, language'
        )
        .eq('class', classNum)
        .eq('subject', dbSubjectName)
        .eq('language', 'hi')
        .order('chapter_num', { ascending: true })

      if (error) {
        console.error('[sb-cache] query failed:', error.message)
        return { data: [], error: error.message }
      }
      return { data: (data ?? []) as ChapterRow[], error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[sb-cache] unexpected:', msg)
      return { data: [], error: msg }
    }
  }
)

// ==================== SEO ====================
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const board = getBoard(params.board)
  const subjectMeta = getSubjectBySlug(params.subject)
  // ✅ SB10 FIX: numeric validation
  const classNum = parseInt(params.class, 10)
  const chapterNum = parseInt(params.chapter, 10)

  if (!board || !subjectMeta || isNaN(classNum) || isNaN(chapterNum)) {
    return {}
  }

  const dbSubjectName = getDbSubjectName(params.subject)
  if (!dbSubjectName) return {}

  let chapterTitle = `अध्याय ${chapterNum}`
  const { data } = await getChapterList(classNum, dbSubjectName)
  const current = data.find((c) => c.chapter_num === chapterNum)
  if (current?.chapter_title) chapterTitle = current.chapter_title

  const path = `/state-boards/${params.board}/${params.class}/${params.subject}/${params.chapter}`
  const baseMeta = buildMetadata({
    title: `Class ${classNum} ${subjectMeta.name_hi} ${chapterTitle} – ${board.name_hi} | VidyaPath`,
    description: `${board.name_hi} Class ${classNum} ${subjectMeta.name_hi} ${chapterTitle} – मुफ़्त notes, PDF सामग्री।`,
    path,
  })

  // ✅ SB20 FIX: alternates (Hindi only for state boards)
  return {
    ...baseMeta,
    alternates: {
      canonical: `${SITE_URL}${path}`,
    },
  }
}

// ==================== PAGE ====================
export default async function ChapterPage({ params }: PageProps) {
  const board = getBoard(params.board)
  const classNum = parseInt(params.class, 10)
  const chapterNum = parseInt(params.chapter, 10)

  if (!board || !isValidClass(classNum) || isNaN(chapterNum)) {
    notFound()
  }

  const subjectMeta = getSubjectBySlug(params.subject)
  if (!subjectMeta) notFound()

  const dbSubjectName = getDbSubjectName(params.subject)
  if (!dbSubjectName) notFound()

  // ✅ SB9, SB11 FIX: cached list + error handling
  const { data: chapterList, error: listErr } = await getChapterList(
    classNum,
    dbSubjectName
  )

  if (listErr || chapterList.length === 0) {
    console.error('[sb-page] chapter list failed:', listErr)
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

  const makeHref = (chNum: number) =>
    `/state-boards/${params.board}/${classNum}/${params.subject}/${chNum}`

  // Session + auth
  const session = await getServerSession()
  const isLoggedIn = !!session?.user && isUserConfirmed(session.user)
  const supabaseAuth = isLoggedIn ? createServerClientWithCookies() : null
  const currentUserId = session?.user?.id
  const supabase = createServerClient()

  // ✅ Parallel queries
  // ✅ SB14 FIX: Notes — no language filter (chapter already scoped)
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
      .eq('language', 'hi')
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
    console.error('[sb-page] notes failed:', notesRes.error.message)
  }
  if (videosRes.error) {
    console.error('[sb-page] videos failed:', videosRes.error.message)
  }

  // ✅ SB6 FIX: proper typing
  const notes = (notesRes.data ?? []) as Note[]
  const videos = videosRes.data ?? []
  const isBookmarked = !!bookmarkRes.data

  // ✅ SB18 FIX: safe PDF url
  const rawPdfUrl =
    chapter.pdf_url || getPdfUrl(chapter.book_code, classNum, chapterNum)
  const pdfUrl = safePdfUrl(rawPdfUrl)

  const chapterTitle = chapter.chapter_title?.trim() || `अध्याय ${chapterNum}`
  const canonicalUrl = `${SITE_URL}/state-boards/${params.board}/${params.class}/${params.subject}/${params.chapter}`

  const hasNotes = notes.length > 0
  const notesPreview: PreviewNote[] = notes.slice(0, 8).map((n) => ({
    id: n.id,
    topic: n.topic,
    difficulty_level: n.difficulty_level,
    pdf_url: n.pdf_url,
    created_at: n.created_at,
  }))

  const notesHref = makeHref(chapterNum)

  // ✅ SB4, SB17 FIX: safe JSON-LD + video schema
  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: `${subjectMeta.name_hi} – ${chapterTitle}`,
      description: `${board.name_hi} Class ${classNum} ${subjectMeta.name_hi} अध्याय ${chapterNum}`,
      educationalLevel: `Class ${classNum}`,
      inLanguage: 'hi',
      url: canonicalUrl,
    },
  ]

  if (videos.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: videos.slice(0, 5).map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'VideoObject',
          name: v.title,
          description: v.description || v.title,
          thumbnailUrl: v.thumbnail_url,
          embedUrl: `https://www.youtube.com/embed/${v.youtube_id}`,
          uploadDate: new Date().toISOString(),
        },
      })),
    })
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <div className="space-y-6 pb-16">
        {/* ✅ SB8 FIX: NotesHint (state-boards variant) */}
        {hasNotes && (
          <NotesHint
            href={notesHref}
            count={notes.length}
            language="hi"
            chapterId={chapter.id}
          />
        )}

        {/* Back */}
        <Link
          href={`/state-boards/${board.slug}/${classNum}/${params.subject}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {subjectMeta.name_hi}
        </Link>

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="breadcrumb-scroll text-sm text-slate-500 dark:text-slate-400"
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Link
              href="/"
              className="hover:text-brand-600 flex items-center gap-1 flex-shrink-0"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">होम</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link
              href="/state-boards"
              className="hover:text-brand-600 flex-shrink-0"
            >
              स्टेट बोर्ड
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link
              href={`/state-boards/${board.slug}`}
              className="hover:text-brand-600 flex-shrink-0"
            >
              {board.name_hi}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link
              href={`/state-boards/${board.slug}/${classNum}`}
              className="hover:text-brand-600 flex-shrink-0"
            >
              Class {classNum}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link
              href={`/state-boards/${board.slug}/${classNum}/${params.subject}`}
              className="hover:text-brand-600 flex-shrink-0"
            >
              {subjectMeta.name_hi}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium flex-shrink-0">
              अध्याय {chapterNum}
            </span>
          </div>
        </nav>

        {/* Hero */}
        <section
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${subjectMeta.gradient} p-5 sm:p-8 text-white`}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/20 rounded-full blur-[80px] motion-safe:animate-pulse-slow" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium border border-white/20">
                <Languages className="w-3 h-3" aria-hidden="true" />
                हिंदी माध्यम
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium border border-white/20">
                <BookOpen className="w-3 h-3" aria-hidden="true" />
                {board.name_hi}
              </div>
            </div>

            <p className="text-sm text-white/80 mb-1">
              Class {classNum} • {subjectMeta.name_hi} • अध्याय {chapterNum}
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight break-words">
              {chapterTitle}
            </h1>
            {hasNotes && (
              <p className="text-xs text-white/70 mt-2">
                📚 {notes.length} notes उपलब्ध
              </p>
            )}
          </div>
        </section>

        {/* ✅ SB23 FIX: Actions row — horizontal scroll on mobile */}
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
              /* ✅ SB3 FIX: indigo gradient (consistent) */
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition text-sm font-medium flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              aria-label={`बुक PDF — ${chapterTitle}`}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">बुक PDF</span>
              <span className="sm:hidden">PDF</span>
            </a>
          )}
          <div className="flex-shrink-0">
            <ShareButton
              title={`${board.name_hi} Class ${classNum} ${subjectMeta.name_hi} अध्याय ${chapterNum}`}
              url={canonicalUrl}
            />
          </div>
        </div>

        {/* ✅ Videos — conditional */}
        {videos.length > 0 && (
          <VideoSection
            chapterId={chapter.id}
            chapterTitle={chapterTitle}
            videos={videos}
            language="hi"
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* ✅ SB1, SB2 FIX: Notes via NoteCard (not NotesContent) */}
        <section aria-labelledby="notes-heading" className="space-y-5">
          <h2 id="notes-heading" className="sr-only">
            नोट्स
          </h2>

          {hasNotes ? (
            <>
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <FileText
                  className="w-5 h-5 text-emerald-600"
                  aria-hidden="true"
                />
                पाठ नोट्स
              </div>
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </>
          ) : (
            <div className="surface-card text-center py-16 px-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-4">
                <span className="text-4xl" role="img" aria-label="Notes coming soon">
                  📝
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                नोट्स जल्द आ रहे हैं
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                इस अध्याय के notes तैयार हो रहे हैं। तब तक आप textbook PDF
                देख सकते हैं।
              </p>
            </div>
          )}
        </section>

        <CommentSection chapterId={chapter.id} />

        {/* ✅ SB7 FIX: ChapterNavigation (teal variant) */}
        <ChapterNavigation
          currentChapterNum={chapterNum}
          totalChapters={totalChapters}
          prev={
            prevChapter
              ? {
                  chapter_num: prevChapter.chapter_num,
                  chapter_title:
                    prevChapter.chapter_title?.trim() ||
                    `अध्याय ${prevChapter.chapter_num}`,
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
                    `अध्याय ${nextChapter.chapter_num}`,
                  href: makeHref(nextChapter.chapter_num),
                }
              : null
          }
          language="hi"
          variant="teal"
          subjectHref={`/state-boards/${board.slug}/${classNum}/${params.subject}`}
          subjectName={subjectMeta.name_hi}
        />
      </div>
    </>
  )
}