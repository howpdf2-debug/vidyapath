import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { Download, BookOpen } from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { isUserConfirmed } from '@/lib/auth'
import { getServerSession } from '@/lib/auth-server'
import { buildMetadata, SITE_URL } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ShareButton } from '@/components/ShareButton'
import { CommentSection } from '@/components/CommentSection'
import { Breadcrumb } from '@/components/Breadcrumb'
import { BackButton } from '@/components/BackButton'
import { VideoSection } from '@/components/VideoSection'
import { NotesHint } from '@/components/notes/NotesHint'
import {
  NotesPreviewCard,
  type PreviewNote,
} from '@/components/notes/NotesPreviewCard'
import { ChapterNavigation } from '@/components/notes/ChapterNavigation'
import { ProgressButton } from './ProgressButton'
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
// ✅ N2-2 FIX: React cache() — dedup between generateMetadata + page
// ✅ N1-1, N1-2, N1-5 FIX: single query for entire chapter list
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
        console.error('[ncert-cache] query failed:', error.message)
        return { data: [], error: error.message }
      }
      return { data: (data ?? []) as ChapterRow[], error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[ncert-cache] unexpected:', msg)
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
    // ✅ Reuses cached query — no additional DB hit
    const { data } = await getChapterList(classNum, subjectName, lang)
    const current = data.find((c) => c.chapter_num === chapterNum)
    if (current?.chapter_title) chapterTitle = current.chapter_title
  }

  const path = `/ncert/${params.class}/${params.subject}/${params.chapter}`
  const baseMeta = buildMetadata({
    title: `Class ${classNum} ${subjectName} ${chapterTitle} – NCERT Solutions | VidyaPath`,
    description: `Free NCERT solutions for Class ${classNum} ${subjectName} ${chapterTitle}.`,
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
export default async function ChapterPage({
  params,
  searchParams,
}: {
  params: { class: string; subject: string; chapter: string }
  searchParams: { lang?: string }
}) {
  const classNum = parseInt(params.class, 10)
  const chapterNum = parseInt(params.chapter, 10)
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  // ✅ N2-4, N2-9 FIX: Type-safe numeric validation
  if (isNaN(classNum) || isNaN(chapterNum)) notFound()

  // ✅ N2-3 FIX: normalized subject (matches DB)
  const subject = safeDecode(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const subjectName = subject
  const rawSubject = params.subject

  // ✅ Single query (cached across metadata + page)
  const { data: chapterList, error: chapterListErr } = await getChapterList(
    classNum,
    subject,
    lang
  )

  if (chapterListErr) {
    console.error('[ncert-page] chapter list failed:', chapterListErr)
    notFound()
  }

  // ✅ N1-6 FIX: numeric-safe comparison
  const currentIdx = chapterList.findIndex((c) => c.chapter_num === chapterNum)
  // ✅ N2-4, N2-5 FIX: safe fallback if not found
  if (currentIdx === -1) notFound()

  const chapter = chapterList[currentIdx]
  const totalChapters = chapterList.length
  const prevChapter = currentIdx > 0 ? chapterList[currentIdx - 1] : null
  const nextChapter =
    currentIdx < chapterList.length - 1 ? chapterList[currentIdx + 1] : null

  // ✅ N2-6 FIX: URL-safe hrefs
  const makeHref = (chNum: number) =>
    `/ncert/${classNum}/${rawSubject}/${chNum}?lang=${lang}`

  const session = await getServerSession()
  const isLoggedIn = !!session?.user && isUserConfirmed(session.user)
  const supabaseAuth = isLoggedIn ? createServerClientWithCookies() : null
  const currentUserId = session?.user?.id

  const supabaseServer = createServerClient()

  // ✅ N1-4 FIX: Promise.all — parallel
  const [videosRes, bookmarkRes, notesPreviewRes] = await Promise.all([
    supabaseServer
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

    supabaseServer
      .from('chapter_notes')
      .select('id, topic, difficulty_level, pdf_url, created_at')
      .eq('ncert_id', chapter.id)
      .order('order_index', { ascending: true }),
  ])

  if (videosRes.error) {
    console.error('[ncert-page] videos failed:', videosRes.error.message)
  }
  if (notesPreviewRes.error) {
    console.error(
      '[ncert-page] notes preview failed:',
      notesPreviewRes.error.message
    )
  }

  const videos = videosRes.data ?? []
  const isBookmarked = !!bookmarkRes.data
  const notesPreview = (notesPreviewRes.data ?? []) as PreviewNote[]
  const hasNotes = notesPreview.length > 0

  const canonicalUrl = `${SITE_URL}/ncert/${params.class}/${params.subject}/${params.chapter}`
  const chapterTitle = chapter.chapter_title?.trim() || `Chapter ${chapterNum}`
  const notesHref = `/notes/${classNum}/${rawSubject}/${chapterNum}?lang=${lang}`

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: `Class ${classNum} ${subjectName} Chapter ${chapterNum}`,
      description: `NCERT notes for Class ${classNum} ${subjectName} Chapter ${chapterNum}`,
      educationalLevel: `Class ${classNum}`,
      inLanguage: lang === 'hi' ? 'hi' : 'en',
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

  const rawPdfUrl =
    chapter.pdf_url || getPdfUrl(chapter.book_code, classNum, chapterNum)
  const pdfUrl = safePdfUrl(rawPdfUrl)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <div className="space-y-6">
        {hasNotes && (
          <NotesHint
            href={notesHref}
            count={notesPreview.length}
            language={lang}
            chapterId={chapter.id}
          />
        )}

        <BackButton
          href={`/ncert/${classNum}/${rawSubject}?lang=${lang}`}
          label="Back to chapters"
          language={lang as 'en' | 'hi'}
        />

        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'NCERT', href: '/ncert' },
            { label: `Class ${classNum}`, href: `/ncert/${classNum}` },
            {
              label: subjectName,
              href: `/ncert/${classNum}/${rawSubject}`,
            },
            { label: `Chapter ${chapterNum}`, href: '#' },
          ]}
        />

        {/* HERO HEADER */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 md:p-8 text-white">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
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
                    📚 {notesPreview.length}{' '}
                    {lang === 'hi'
                      ? 'detailed notes उपलब्ध'
                      : 'detailed notes available'}
                  </p>
                )}
              </div>
            </div>
            <LanguageToggle />
          </div>
        </header>

        {/* Chapter actions */}
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition text-sm font-medium flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              aria-label={`NCERT book PDF — ${chapterTitle}`}
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

        {/* Videos */}
        {videos.length > 0 && (
          <VideoSection
            chapterId={chapter.id}
            chapterTitle={chapterTitle}
            videos={videos}
            language={lang}
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* Notes preview card */}
        {hasNotes && (
          <NotesPreviewCard
            href={notesHref}
            notes={notesPreview}
            language={lang}
          />
        )}

        <CommentSection chapterId={chapter.id} />

        {/* ✅ N1-3, N1-6, N1-7, N2-6 FIX: Chapter navigation */}
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
          variant="emerald"
        />
      </div>
    </>
  )
}