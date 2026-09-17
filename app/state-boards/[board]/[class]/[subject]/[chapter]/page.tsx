import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ChevronRight,
  Download,
  FileText,
  Home,
  BookOpen,
  Languages,
  ChevronLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
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
import { sanitizeHtml } from '@/lib/sanitize'
import { getServerSession, isUserConfirmed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { board: string; class: string; subject: string; chapter: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const board = getBoard(params.board)
  const subjectMeta = getSubjectBySlug(params.subject)
  if (!board || !subjectMeta) return {}

  return buildMetadata({
    title: `Class ${params.class} ${subjectMeta.name_hi} अध्याय ${params.chapter} – ${board.name_hi} | VidyaPath`,
    description: `${board.name_hi} Class ${params.class} ${subjectMeta.name_hi} अध्याय ${params.chapter} — हिंदी माध्यम notes, PDF।`,
    path: `/state-boards/${params.board}/${params.class}/${params.subject}/${params.chapter}`,
  })
}

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

  const supabase = createClient()

  const { data: chapter } = await supabase
    .from('ncert')
    .select('id, chapter_num, chapter_title, book_code, pdf_url, language')
    .eq('class', classNum)
    .eq('subject', dbSubjectName)
    .eq('chapter_num', chapterNum)
    .eq('language', 'hi')
    .maybeSingle()

  if (!chapter) notFound()

  // Fetch related data in parallel
  const [notesRes, videosRes, session] = await Promise.all([
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
    getServerSession().catch(() => null),
  ])

  const notes = notesRes.data || []
  const videos = videosRes.data || []
  const isLoggedIn = !!session?.user && isUserConfirmed(session.user)

  // Bookmark check
  let isBookmarked = false
  if (isLoggedIn && session?.user) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('ncert_id', chapter.id)
      .maybeSingle()
    if (bookmark) isBookmarked = true
  }

  const pdfUrl =
    chapter.pdf_url || getPdfUrl(chapter.book_code, classNum, chapterNum)
  const chapterTitle = chapter.chapter_title || `अध्याय ${chapterNum}`
  const canonicalUrl = `${SITE_URL}/state-boards/${params.board}/${params.class}/${params.subject}/${params.chapter}`

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `${subjectMeta.name_hi} - ${chapterTitle}`,
    description: `${board.name_hi} Class ${classNum} ${subjectMeta.name_hi} अध्याय ${chapterNum}`,
    educationalLevel: `Class ${classNum}`,
    inLanguage: 'hi',
    url: canonicalUrl,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-6 pb-16">
        {/* Back */}
        <Link
          href={`/state-boards/${board.slug}/${classNum}/${params.subject}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
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
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">होम</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link
              href="/state-boards"
              className="hover:text-brand-600 flex-shrink-0"
            >
              राज्य बोर्ड
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
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/20 rounded-full blur-[80px] animate-pulse-slow" />
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
                <Languages className="w-3 h-3" />
                हिंदी माध्यम
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium border border-white/20">
                <BookOpen className="w-3 h-3" />
                {board.name_hi}
              </div>
            </div>

            <p className="text-sm text-white/80 mb-1">
              Class {classNum} • {subjectMeta.name_hi} • अध्याय {chapterNum}
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight break-words">
              {chapterTitle}
            </h1>
          </div>
        </section>

        {/* Action Row */}
        <div className="flex flex-wrap items-center gap-2">
          {isLoggedIn && (
            <BookmarkButton
              chapterId={chapter.id}
              initialBookmarked={isBookmarked}
            />
          )}
          {isLoggedIn && (
            <ProgressButton chapterId={chapter.id} isLoggedIn={true} />
          )}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-sm shadow-lg shadow-red-500/30"
            >
              <Download className="w-4 h-4" />
              PDF डाउनलोड
            </a>
          )}
          <ShareButton
            title={`${board.name_hi} Class ${classNum} ${subjectMeta.name_hi} अध्याय ${chapterNum}`}
            url={canonicalUrl}
          />
        </div>

        {/* Videos */}
        {videos.length > 0 && (
          <VideoSection
            chapterId={chapter.id}
            chapterTitle={chapterTitle}
            videos={videos}
            language="hi"
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* Notes */}
        <section aria-labelledby="notes-heading" className="space-y-5">
          <h2 id="notes-heading" className="sr-only">
            नोट्स
          </h2>

          {notes.length > 0 ? (
            notes.map((note: any) => (
              <article key={note.id} className="surface-card p-5 sm:p-6">
                {note.topic && (
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-gradient-to-b from-brand-500 to-purple-500" />
                    <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    {note.topic}
                  </h3>
                )}
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-li:text-slate-700 dark:prose-li:text-slate-300"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(note.content_html),
                  }}
                />
              </article>
            ))
          ) : (
            <div className="surface-card text-center py-16 px-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                नोट्स जल्द आ रहे हैं
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                इस अध्याय के नोट्स तैयार किए जा रहे हैं। तब तक PDF से पढ़ाई कर
                सकते हैं।
              </p>
            </div>
          )}
        </section>

        {/* Comments */}
        <CommentSection chapterId={chapter.id} />
      </div>
    </>
  )
}