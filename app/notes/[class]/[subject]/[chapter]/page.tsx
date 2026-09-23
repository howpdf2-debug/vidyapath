import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  FileText,
  Download,
  ChevronRight,
  Home,
  BookOpen,
} from 'lucide-react'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { buildMetadata, SITE_URL, buildFaqPageSchema } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BackButton } from '@/components/BackButton'
import { VideoSection } from '@/components/VideoSection'
import { NotesSection } from '@/components/NotesSection'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ShareButton } from '@/components/ShareButton'
import { CommentSection } from '@/components/CommentSection'
import { ProgressButton } from '@/app/ncert/[class]/[subject]/[chapter]/ProgressButton'
import { NoteCard } from '@/components/notes/NoteCard'
import type { Note } from '@/lib/db-types'
import { ChapterNavigation } from '@/components/notes/ChapterNavigation'
import { isUserConfirmed } from '@/lib/auth'
import { getServerSession } from '@/lib/auth-server'
import { getPdfUrl } from '@/lib/pdf'
import { FaqSection } from '@/components/FaqSection'
import {
  getCachedChapterList,
  getCachedChapterNotes,
  getCachedChapterVideos,
  getChapterFaqs,
} from '@/lib/cached-queries'

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
  const lang: 'en' | 'hi' = searchParams.lang === 'hi' ? 'hi' : 'en'

  if (isNaN(classNum) || isNaN(chapterNum)) notFound()

  const subject = safeDecode(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const subjectName = subject
  const rawSubject = params.subject

  // ✅ Cached chapter list
  const { data: chapterList, error: listErr } = await getCachedChapterList(
    classNum,
    subject,
    lang
  )

  if (listErr) {
    console.error('[notes-page] list failed:', listErr)
    notFound()
  }

  const currentIdx = chapterList.findIndex((c) => c.chapter_num === chapterNum)
  if (currentIdx === -1) notFound()

  const chapter = chapterList[currentIdx]
  const totalChapters = chapterList.length
  const prevChapter = currentIdx > 0 ? chapterList[currentIdx - 1] : null
  const nextChapter =
    currentIdx < chapterList.length - 1 ? chapterList[currentIdx + 1] : null

  const makeHref = (chNum: number) =>
    `/notes/${classNum}/${rawSubject}/${chNum}?lang=${lang}`

  // ✅ Session + bookmark (NOT cached — per-user)
  const session = await getServerSession()
  const isLoggedIn = !!session?.user && isUserConfirmed(session.user)
  const supabaseAuth = isLoggedIn ? createServerClientWithCookies() : null
  const currentUserId = session?.user?.id

  // ✅ Cached data + live bookmark + FAQ — parallel
  const [notesRes, videosRes, bookmarkRes, faqs] = await Promise.all([
    getCachedChapterNotes(chapter.id),
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
    // ✅ P3.8: FAQ fetch — parallel, zero extra latency
    chapter?.id
  ? getChapterFaqs(chapter.id, classNum, subjectName, chapterNum)
  : Promise.resolve({ en: [], hi: [] }),
  ])

  if (notesRes.error) {
    console.error('[notes-page] notes failed:', notesRes.error)
  }
  if (videosRes.error) {
    console.error('[notes-page] videos failed:', videosRes.error)
  }

  const notes = (notesRes.data ?? []) as Note[]
  const videos = videosRes.data ?? []
  const isBookmarked = !!bookmarkRes.data

  const chapterTitle = chapter.chapter_title?.trim() || `Chapter ${chapterNum}`

  const rawPdfUrl =
    chapter.pdf_url || getPdfUrl(chapter.book_code, classNum, chapterNum)
  const pdfUrl = safePdfUrl(rawPdfUrl)

  const hasNotes = notes.length > 0
  const canonicalUrl = `${SITE_URL}/notes/${params.class}/${params.subject}/${params.chapter}`

  // ✅ Base LearningResource JSON-LD (unchanged)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `Class ${classNum} ${subjectName} Chapter ${chapterNum} Notes`,
    description: `Free notes for Class ${classNum} ${subjectName} Chapter ${chapterNum}`,
    educationalLevel: `Class ${classNum}`,
    inLanguage: lang === 'hi' ? 'hi' : 'en',
    url: canonicalUrl,
  }

  // ✅ P3.8: FAQPage schema — page-lang primary, other lang fallback
  const primaryFaqs =
    lang === 'hi'
      ? faqs.hi.length > 0
        ? faqs.hi
        : faqs.en
      : faqs.en.length > 0
        ? faqs.en
        : faqs.hi
  const faqSchema = buildFaqPageSchema(primaryFaqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      {/* ✅ P3.8: Separate FAQPage script (valid per schema.org — multiple scripts allowed) */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              '@context': 'https://schema.org',
              ...faqSchema,
            }),
          }}
        />
      )}

      <div className="space-y-6">
        <BackButton
          href={`/notes/${classNum}/${rawSubject}?lang=${lang}`}
          label="Back to chapters"
          language={lang}
        />

        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
          <Link href="/" className="hover:text-indigo-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/notes" className="hover:text-indigo-600">
            Notes
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/notes/${classNum}`} className="hover:text-indigo-600">
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

        {videos.length > 0 && (
          <VideoSection
            chapterId={chapter.id}
            chapterTitle={chapterTitle}
            videos={videos}
            language={lang}
            isLoggedIn={isLoggedIn}
          />
        )}

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
              <NoteCard key={note.id} note={note} language={lang} />
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

        {/* ✅ P3.8: FAQ Section — bilingual aware (page-lang primary) */}
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
          variant="indigo"
          subjectHref={`/notes/${classNum}/${rawSubject}?lang=${lang}`}
          subjectName={subjectName}
        />
      </div>
    </>
  )
}