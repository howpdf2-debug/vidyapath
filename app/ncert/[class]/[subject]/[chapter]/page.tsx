import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Download, BookOpen } from 'lucide-react'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { isUserConfirmed } from '@/lib/auth'
import { getServerSession } from '@/lib/auth-server'
import { buildMetadata, SITE_URL, buildFaqPageSchema } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ShareButton } from '@/components/ShareButton'
import { CommentSection } from '@/components/CommentSection'
import { Breadcrumb } from '@/components/Breadcrumb'
import { BackButton } from '@/components/BackButton'
import { VideoSection } from '@/components/VideoSection'
import { NotesHint } from '@/components/notes/NotesHint'
import { NotesPreviewCard } from '@/components/notes/NotesPreviewCard'
import type { PreviewNote } from '@/lib/db-types'
import { ChapterNavigation } from '@/components/notes/ChapterNavigation'
import { ProgressButton } from './ProgressButton'
import { getPdfUrl } from '@/lib/pdf'
import { getChapterFaqs } from '@/lib/cached-queries'
import { FaqSection } from '@/components/FaqSection'
import {
  getCachedChapterList,
  getCachedNotesPreview,
  getCachedChapterVideos,
} from '@/lib/cached-queries'

export const dynamic = 'force-dynamic'

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

// ✅ FIX B1: only ONE safeJsonLd — keep local (stricter: escapes < > &)
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

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
    const { data } = await getCachedChapterList(classNum, subjectName, lang)
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
  const lang: 'en' | 'hi' = searchParams.lang === 'hi' ? 'hi' : 'en'

  if (isNaN(classNum) || isNaN(chapterNum)) notFound()

  const subject = safeDecode(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const subjectName = subject
  const rawSubject = params.subject

  const { data: chapterList, error: listErr } = await getCachedChapterList(
    classNum,
    subject,
    lang
  )

  if (listErr) {
    console.error('[ncert-page] list failed:', listErr)
    notFound()
  }

  const currentIdx = chapterList.findIndex((c) => c.chapter_num === chapterNum)
  if (currentIdx === -1) notFound()

  // ✅ FIX B2: single chapter block — duplicate removed
  const chapter = chapterList[currentIdx]
  const totalChapters = chapterList.length
  const prevChapter = currentIdx > 0 ? chapterList[currentIdx - 1] : null
  const nextChapter =
    currentIdx < chapterList.length - 1 ? chapterList[currentIdx + 1] : null

  const makeHref = (chNum: number) =>
    `/ncert/${classNum}/${rawSubject}/${chNum}?lang=${lang}`

  const session = await getServerSession()
  const isLoggedIn = !!session?.user && isUserConfirmed(session.user)
  const supabaseAuth = isLoggedIn ? createServerClientWithCookies() : null
  const currentUserId = session?.user?.id

  const [videosRes, bookmarkRes, notesPreviewRes, faqs] = await Promise.all([
    getCachedChapterVideos(chapter.id, lang),
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
    getCachedNotesPreview(chapter.id),
    // ✅ FIX B3: FAQ fetch merged into Promise.all — parallel, no extra latency
    chapter?.id
  ? getChapterFaqs(chapter.id, classNum, subjectName, chapterNum)
  : Promise.resolve({ en: [], hi: [] }),
  ])

  if (videosRes.error) {
    console.error('[ncert-page] videos failed:', videosRes.error)
  }
  if (notesPreviewRes.error) {
    console.error('[ncert-page] notes preview failed:', notesPreviewRes.error)
  }

  const videos = videosRes.data ?? []
  const isBookmarked = !!bookmarkRes.data
  const notesPreview = (notesPreviewRes.data ?? []) as PreviewNote[]
  const hasNotes = notesPreview.length > 0

  const canonicalUrl = `${SITE_URL}/ncert/${params.class}/${params.subject}/${params.chapter}`
  const chapterTitle = chapter.chapter_title?.trim() || `Chapter ${chapterNum}`
  const notesHref = `/notes/${classNum}/${rawSubject}/${chapterNum}?lang=${lang}`

  // ==================== JSON-LD ====================
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

  // ✅ FIX B4/B5: FAQ schema — lang directly use, no pageLang. Schema injected.
  const primaryFaqs =
    lang === 'hi'
      ? faqs.hi.length > 0
        ? faqs.hi
        : faqs.en
      : faqs.en.length > 0
        ? faqs.en
        : faqs.hi

  const faqSchema = buildFaqPageSchema(primaryFaqs)
  if (faqSchema) {
    jsonLd.push({
      '@context': 'https://schema.org',
      ...faqSchema,
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
          language={lang}
        />

        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'NCERT', href: '/ncert' },
            { label: `Class ${classNum}`, href: `/ncert/${classNum}` },
            { label: subjectName, href: `/ncert/${classNum}/${rawSubject}` },
            { label: `Chapter ${chapterNum}`, href: '#' },
          ]}
        />

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

        {videos.length > 0 && (
          <VideoSection
            chapterId={chapter.id}
            chapterTitle={chapterTitle}
            videos={videos}
            language={lang}
            isLoggedIn={isLoggedIn}
          />
        )}

        {hasNotes && (
          <NotesPreviewCard
            href={notesHref}
            notes={notesPreview}
            language={lang}
          />
        )}

        {/* ✅ FIX B6: FAQ section rendered — after notes, before comments */}
        <FaqSection faqs={faqs} lang={lang} />

        <CommentSection chapterId={chapter.id} />

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
          subjectHref={`/ncert/${classNum}/${rawSubject}?lang=${lang}`}
          subjectName={subjectName}
        />
      </div>
    </>
  )
}