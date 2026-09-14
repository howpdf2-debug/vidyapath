import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'

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
  const lang = searchParams.lang || 'english'

  let chapterTitle = `Chapter ${chapterNum}`
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('ncert')
      .select('chapter_title')
      .eq('class', parseInt(classNum, 10))
      .eq('subject', decodeURIComponent(params.subject))
      .eq('chapter_num', parseInt(chapterNum, 10))
      .eq('language', lang)
      .maybeSingle()
    if (data?.chapter_title) chapterTitle = data.chapter_title
  } catch {}

  return buildMetadata({
    title: `Class ${classNum} ${subjectName} ${chapterTitle} Notes | VidyaPath`,
    description: `Free study notes for Class ${classNum} ${subjectName} ${chapterTitle}. Complete summary, key points, and exam tips.`,
    path: `/notes/${params.class}/${params.subject}/${params.chapter}`,
    keywords: [
      chapterTitle,
      `class ${classNum} ${subjectName} notes`,
      `${subjectName} chapter ${chapterNum}`,
    ],
  })
}

// ==================== Filter Link ====================
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

// ==================== PAGE ====================
export default async function NotesChapterPage({
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

  const supabase = createServerClient()

  // Fetch chapter
  const { data: chapter, error: chapterError } = await supabase
    .from('ncert')
    .select('chapter_title')
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('chapter_num', chapterNum)
    .eq('language', lang)
    .maybeSingle()

  if (chapterError || !chapter) notFound()

  // Fetch notes
  let query = supabase
    .from('chapter_notes')
    .select('*')
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('chapter_num', chapterNum)
    .order('order_index', { ascending: true })

  if (level !== 'all') {
    query = query.eq('difficulty_level', level)
  }

  const { data: notes, error: notesError } = await query

  if (notesError) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Could not load notes</h1>
        <Link
          href={`/notes/${classNum}/${encodeURIComponent(subject)}?lang=${lang}`}
          className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          Back to Chapters
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/notes" className="hover:text-indigo-600">Notes</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/notes/${classNum}`} className="hover:text-indigo-600">
          Class {classNum}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/notes/${classNum}/${encodeURIComponent(subject)}`}
          className="hover:text-indigo-600"
        >
          {subjectName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          Chapter {chapterNum}
        </span>
      </nav>

      {/* Back + Language */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/notes/${classNum}/${encodeURIComponent(subject)}?lang=${lang}`}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to chapters
        </Link>
        <LanguageToggle />
      </div>

      {/* Header */}
      <header className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
            <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Class {classNum} • {subjectName} • Chapter {chapterNum}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              {chapter.chapter_title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Complete chapter notes with difficulty levels
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <FilterLink href={`?level=all&lang=${lang}`} active={level === 'all'}>
          All
        </FilterLink>
        <FilterLink href={`?level=easy&lang=${lang}`} active={level === 'easy'}>
          🟢 Easy
        </FilterLink>
        <FilterLink href={`?level=medium&lang=${lang}`} active={level === 'medium'}>
          🟡 Medium
        </FilterLink>
        <FilterLink href={`?level=hard&lang=${lang}`} active={level === 'hard'}>
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
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                {note.topic}
              </h3>
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
            </div>
            <div
              className="prose prose-lg dark:prose-invert mt-4 max-w-none"
              dangerouslySetInnerHTML={{ __html: note.content_html }}
            />
          </div>
        ))}

        {notes?.length === 0 && (
          <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No notes available for this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}