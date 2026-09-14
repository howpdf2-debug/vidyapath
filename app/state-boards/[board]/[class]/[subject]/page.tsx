import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowLeft, ChevronRight, Home, BookOpen } from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'

const boardNames: Record<string, string> = {
  up: 'UP Board',
  bihar: 'Bihar Board',
  mp: 'MP Board',
  rajasthan: 'Rajasthan Board',
}

// ==================== SEO ====================
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { board: string; class: string; subject: string }
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const boardSlug = params.board
  const boardName = boardNames[boardSlug] || boardSlug.toUpperCase()
  const classNum = params.class
  const subjectName = decodeURIComponent(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const lang = searchParams.lang || 'english'

  return buildMetadata({
    title: `${boardName} Class ${classNum} ${subjectName} Book PDF – Download Free | VidyaPath`,
    description: `Download ${boardName} Class ${classNum} ${subjectName} textbook PDF (${lang === 'hindi' ? 'Hindi medium' : 'English medium'}). Free download available for Indian students.`,
    path: `/state-boards/${params.board}/${params.class}/${params.subject}`,
    keywords: [
      `${boardName} class ${classNum} ${subjectName}`,
      `${boardName} book pdf`,
      `class ${classNum} ${subjectName} pdf`,
      `${boardName} textbook`,
    ],
  })
}

// ==================== PAGE ====================
export default async function BookPage({
  params,
  searchParams,
}: {
  params: { board: string; class: string; subject: string }
  searchParams: { lang?: string }
}) {
  const board = params.board
  const classNum = parseInt(params.class, 10)
  const subject = decodeURIComponent(params.subject)
  const lang = searchParams.lang || 'english'

  if (isNaN(classNum)) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold">Invalid Class</h1>
        <Link
          href={`/state-boards/${board}`}
          className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          Back to Board
        </Link>
      </div>
    )
  }

  const supabase = createServerClient()
  const boardName = boardNames[board] || board.toUpperCase()
  const subjectName = subject
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const { data: book, error } = await supabase
    .from('state_books')
    .select('*')
    .eq('board_name', board)
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('language', lang)
    .maybeSingle()

  // Empty state
  if (error || !book) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/state-boards" className="hover:text-indigo-600">
            State Boards
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/state-boards/${board}`} className="hover:text-indigo-600">
            {boardName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {subjectName}
          </span>
        </nav>

        <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">
            Book Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3">
            No book available for {boardName} Class {classNum} – {subjectName}{' '}
            in {lang === 'hindi' ? 'हिंदी' : 'English'} medium.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link
              href={`/state-boards/${board}/${classNum}?lang=${lang}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >
              ← Back to Subjects
            </Link>
            <Link
              href={`/state-boards/${board}/${classNum}?lang=${lang === 'hindi' ? 'english' : 'hindi'}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Try {lang === 'hindi' ? 'English' : 'हिंदी'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/state-boards" className="hover:text-indigo-600">
          State Boards
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/state-boards/${board}`} className="hover:text-indigo-600">
          {boardName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/state-boards/${board}/${classNum}`}
          className="hover:text-indigo-600"
        >
          Class {classNum}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {subjectName}
        </span>
      </nav>

      {/* Back + Language */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/state-boards/${board}/${classNum}?lang=${lang}`}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Subjects
        </Link>
        <LanguageToggle />
      </div>

      {/* Header */}
      <header className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 rounded-2xl border border-orange-100 dark:border-orange-900/40 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
            <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {boardName} • Class {classNum} • {lang === 'hindi' ? 'हिंदी' : 'English'} Medium
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              {book.book_title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {subjectName} – Complete textbook PDF
            </p>
          </div>
        </div>
      </header>

      {/* Download Card */}
      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 md:p-8 text-center">
        {book.pdf_url ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/40 mb-4">
              <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-bold">Download the Textbook</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Free PDF download – click the button below
            </p>
            <a
              href={book.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition shadow-lg shadow-orange-500/30"
            >
              <FileText className="w-5 h-5" />
              Download PDF
            </a>
          </>
        ) : (
          <div className="py-6">
            <p className="text-gray-500 dark:text-gray-400">
              PDF not available for this book.
            </p>
          </div>
        )}

        {/* Dev-only debug URL */}
        {process.env.NODE_ENV === 'development' && book.pdf_url && (
          <p className="text-xs text-gray-400 mt-6 break-all">
            PDF URL: {book.pdf_url}
          </p>
        )}
      </section>

      {/* Related Links */}
      <section className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aur dekho:{' '}
          <Link
            href="/ncert"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            NCERT Books
          </Link>
          {' · '}
          <Link
            href="/notes"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Notes
          </Link>
          {' · '}
          <Link
            href={`/state-boards/${board}/${classNum}?lang=${lang === 'hindi' ? 'english' : 'hindi'}`}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {lang === 'hindi' ? 'English Medium' : 'हिंदी Medium'}
          </Link>
        </p>
      </section>
    </div>
  )
}