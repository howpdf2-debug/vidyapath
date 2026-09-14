import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FileText, ArrowLeft } from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { getServerSession } from '@/lib/auth'
import { buildMetadata, SITE_URL } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ShareButton } from '@/components/ShareButton'
import { CommentSection } from '@/components/CommentSection'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ProgressButton } from './ProgressButton'

// ==================== SEO METADATA ====================
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { class: string; subject: string; chapter: string }
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const classNum = params.class
  const subject = decodeURIComponent(params.subject)
  const subjectName = subject
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const chapterNum = params.chapter
  const lang = searchParams.lang || 'english'

  // Try to fetch chapter title for better metadata
  let chapterTitle = `Chapter ${chapterNum}`
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('ncert')
      .select('chapter_title')
      .eq('class', parseInt(classNum, 10))
      .eq('subject', subject)
      .eq('chapter_num', parseInt(chapterNum, 10))
      .eq('language', lang)
      .maybeSingle()
    if (data?.chapter_title) chapterTitle = data.chapter_title
  } catch {
    // fallback to default chapter title
  }

  return buildMetadata({
    title: `Class ${classNum} ${subjectName} Chapter ${chapterNum}: ${chapterTitle} – NCERT Solutions | VidyaPath`,
    description: `Free NCERT solutions and study notes for Class ${classNum} ${subjectName} Chapter ${chapterNum} (${chapterTitle}). Detailed explanations, important questions, and PDF downloads.`,
    path: `/ncert/${params.class}/${params.subject}/${params.chapter}`,
    keywords: [
      `class ${classNum} ${subjectName} chapter ${chapterNum}`,
      chapterTitle,
      `${subjectName} ncert solutions`,
      `class ${classNum} ${subjectName} notes`,
      'ncert free solutions',
    ],
  })
}

// ==================== PAGE COMPONENT ====================
export default async function ChapterPage({
  params,
  searchParams,
}: {
  params: { class: string; subject: string; chapter: string }
  searchParams: { level?: string; lang?: string }
}) {
  const classNum = parseInt(params.class, 10)
  const subject = decodeURIComponent(params.subject)
  const chapterNum = parseInt(params.chapter, 10)
  const level = searchParams.level || 'all'
  const lang = searchParams.lang || 'english'

  if (isNaN(classNum) || isNaN(chapterNum)) notFound()

  const subjectName = subject
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const supabaseServer = createServerClient()

  // ===== Fetch chapter =====
  const { data: chapter, error: chapterError } = await supabaseServer
    .from('ncert')
    .select('*')
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('chapter_num', chapterNum)
    .eq('language', lang)
    .maybeSingle()

  if (chapterError || !chapter) notFound()

  // ===== Fetch notes =====
  let query = supabaseServer
    .from('chapter_notes')
    .select('*')
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('chapter_num', chapterNum)
    .order('order_index', { ascending: true })

  if (level !== 'all') {
    query = query.eq('difficulty_level', level)
  }

  const { data: notes } = await query

  // ===== Bookmark check =====
  const session = await getServerSession()
  let isBookmarked = false
  if (session?.user) {
    const { data: bookmark } = await supabaseServer
      .from('bookmarks')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('chapter_id', chapter.id)
      .maybeSingle()
    if (bookmark) isBookmarked = true
  }

  // ===== JSON-LD schema =====
  const canonicalUrl = `${SITE_URL}/ncert/${params.class}/${params.subject}/${params.chapter}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `Class ${classNum} ${subjectName} Chapter ${chapterNum}: ${chapter.chapter_title}`,
    description: `Free NCERT notes and study material for Class ${classNum} ${subjectName} Chapter ${chapterNum} (${lang})`,
    educationalLevel: `Class ${classNum}`,
    inLanguage: lang === 'hindi' ? 'hi' : 'en',
    url: canonicalUrl,
    learningResourceType: 'Study Notes',
    provider: {
      '@type': 'Organization',
      name: 'VidyaPath',
      url: SITE_URL,
    },
  }

  // ===== PDF URL from NCERT =====
  const pdfUrl = chapter.book_code
    ? `https://ncert.nic.in/textbook/pdf/${chapter.book_code}.pdf`
    : null

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'NCERT', href: '/ncert' },
            { label: `Class ${classNum}`, href: `/ncert/${classNum}` },
            {
              label: subjectName,
              href: `/ncert/${classNum}/${encodeURIComponent(subject)}`,
            },
            { label: `Chapter ${chapterNum}`, href: '#' },
          ]}
        />

        {/* Back + Language toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/ncert/${classNum}/${encodeURIComponent(subject)}?lang=${lang}`}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to chapters
          </Link>
          <LanguageToggle />
        </div>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Class {classNum} {subjectName} – Chapter {chapterNum}
            </h1>
            <h2 className="text-xl text-gray-600 dark:text-gray-300 mt-1">
              {chapter.chapter_title}
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {session?.user && (
              <BookmarkButton
                chapterId={chapter.id}
                initialBookmarked={isBookmarked}
              />
            )}
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                <FileText className="w-5 h-5" /> Download PDF
              </a>
            )}
            <ShareButton
              title={`Class ${classNum} ${subjectName} Chapter ${chapterNum}`}
              url={canonicalUrl}
            />
            <ProgressButton
              chapterId={chapter.id}
              isLoggedIn={!!session?.user}
            />
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 flex-wrap">
          <FilterLink
            href={`?level=all&lang=${lang}`}
            active={level === 'all'}
          >
            All
          </FilterLink>
          <FilterLink
            href={`?level=easy&lang=${lang}`}
            active={level === 'easy'}
          >
            🟢 Easy
          </FilterLink>
          <FilterLink
            href={`?level=medium&lang=${lang}`}
            active={level === 'medium'}
          >
            🟡 Medium
          </FilterLink>
          <FilterLink
            href={`?level=hard&lang=${lang}`}
            active={level === 'hard'}
          >
            🔴 Hard
          </FilterLink>
        </div>

        {/* Notes */}
        <div className="space-y-6">
          {notes?.map((note) => (
            <div
              key={note.id}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{note.topic}</h3>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full capitalize">
                  {note.difficulty_level}
                </span>
              </div>
              <div
                className="prose prose-lg dark:prose-invert mt-2 max-w-none"
                dangerouslySetInnerHTML={{ __html: note.content_html }}
              />
            </div>
          ))}
          {(!notes || notes.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400">
              No notes available for this filter.
            </p>
          )}
        </div>

        {/* Comments */}
        <CommentSection chapterId={chapter.id} />
      </div>
    </>
  )
}

// ==================== Helper Component ====================
function FilterLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        active
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </Link>
  )
}