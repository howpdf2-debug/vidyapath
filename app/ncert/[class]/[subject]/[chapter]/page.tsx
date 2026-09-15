import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FileText, Download, ChevronRight, Home, BookOpen } from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { getServerSession, isUserConfirmed } from '@/lib/auth'
import { buildMetadata, SITE_URL } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ShareButton } from '@/components/ShareButton'
import { CommentSection } from '@/components/CommentSection'
import { Breadcrumb } from '@/components/Breadcrumb'
import { BackButton } from '@/components/BackButton'
import { ProgressButton } from './ProgressButton'
import { getPdfUrl } from '@/lib/pdf'

// ==================== SEO ====================
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { class: string; subject: string; chapter: string }
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const classNum = params.class
  const subjectName = decodeURIComponent(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const chapterNum = params.chapter
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  let chapterTitle = `Chapter ${chapterNum}`
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('ncert')
      .select('chapter_title')
      .eq('class', parseInt(classNum, 10))
      .eq('subject', subjectName)
      .eq('chapter_num', parseInt(chapterNum, 10))
      .eq('language', lang)
      .maybeSingle()
    if (data?.chapter_title) chapterTitle = data.chapter_title
  } catch {}

  return buildMetadata({
    title: `Class ${classNum} ${subjectName} ${chapterTitle} – NCERT Solutions | VidyaPath`,
    description: `Free NCERT solutions for Class ${classNum} ${subjectName} ${chapterTitle}.`,
    path: `/ncert/${params.class}/${params.subject}/${params.chapter}`,
  })
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

  if (isNaN(classNum) || isNaN(chapterNum)) notFound()

  // ⚠️ Capitalize subject for DB match (DB me 'Mathematics' hai)
  const subject = decodeURIComponent(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const subjectName = subject

  // ⚠️ Keep raw subject for URL building (lowercase URL preserve)
  const rawSubject = params.subject

  const supabaseServer = createServerClient()

  const { data: chapter, error: chapterError } = await supabaseServer
    .from('ncert')
    .select('id, class, chapter_num, chapter_title, book_code, pdf_url, language')
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('chapter_num', chapterNum)
    .eq('language', lang)
    .maybeSingle()

  if (chapterError || !chapter) notFound()

  const { data: notes } = await supabaseServer
    .from('chapter_notes')
    .select('*')
    .eq('ncert_id', chapter.id)
    .order('order_index', { ascending: true })

  const session = await getServerSession()
  const isLoggedIn = !!session?.user && isUserConfirmed(session.user)

  let isBookmarked = false
  if (isLoggedIn) {
    const { data: bookmark } = await supabaseServer
      .from('bookmarks')
      .select('id')
      .eq('user_id', session!.user.id)
      .eq('ncert_id', chapter.id)
      .maybeSingle()
    if (bookmark) isBookmarked = true
  }

  const canonicalUrl = `${SITE_URL}/ncert/${params.class}/${params.subject}/${params.chapter}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `Class ${classNum} ${subjectName} Chapter ${chapterNum}`,
    description: `NCERT notes for Class ${classNum} ${subjectName} Chapter ${chapterNum}`,
    educationalLevel: `Class ${classNum}`,
    inLanguage: lang === 'hi' ? 'hi' : 'en',
    url: canonicalUrl,
  }

  const pdfUrl =
    chapter.pdf_url || getPdfUrl(chapter.book_code, classNum, chapterNum)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-6">
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
            {
              label: subjectName,
              href: `/ncert/${classNum}/${rawSubject}`,
            },
            { label: `Chapter ${chapterNum}`, href: '#' },
          ]}
        />

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
                  {chapter.chapter_title}
                </h1>
              </div>
            </div>
            <LanguageToggle />
          </div>
        </header>

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
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/30 text-sm font-medium"
            >
              <Download className="w-4 h-4" /> Download PDF
            </a>
          )}
          <ShareButton
            title={`Class ${classNum} ${subjectName} Chapter ${chapterNum}`}
            url={canonicalUrl}
          />
        </div>

        <div className="space-y-6">
          {notes && notes.length > 0 ? (
            notes.map((note: any) => (
              <div
                key={note.id}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    {note.topic}
                  </h3>
                  {note.difficulty_level && (
                    <span
                      className={`text-xs px-3 py-1 rounded-full capitalize ${
                        note.difficulty_level === 'easy'
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                          : note.difficulty_level === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {note.difficulty_level}
                    </span>
                  )}
                </div>
                <div
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: note.content_html }}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                📝 Notes coming soon for this chapter.
              </p>
            </div>
          )}
        </div>

        <CommentSection chapterId={chapter.id} />
      </div>
    </>
  )
}