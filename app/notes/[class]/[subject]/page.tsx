import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BookOpen,
  FileText,
  ArrowRight,
  ChevronRight,
  Home,
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
  params: { class: string; subject: string }
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const classNum = params.class
  const subjectName = decodeURIComponent(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const lang = searchParams.lang || 'english'

  return buildMetadata({
    title: `Class ${classNum} ${subjectName} Notes – Free PDF Download | VidyaPath`,
    description: `Download free Class ${classNum} ${subjectName} notes. Chapter-wise summary, important questions, and revision material for exam preparation.`,
    path: `/notes/${params.class}/${params.subject}`,
    keywords: [
      `class ${classNum} ${subjectName} notes`,
      `${subjectName} notes pdf`,
      `class ${classNum} study material`,
      'free study notes',
    ],
  })
}

// ==================== PAGE ====================
export default async function NotesSubjectPage({
  params,
  searchParams,
}: {
  params: { class: string; subject: string }
  searchParams: { lang?: string }
}) {
  const classNum = parseInt(params.class, 10)
  const subject = decodeURIComponent(params.subject)
  const lang = searchParams.lang || 'english'

  if (isNaN(classNum)) notFound()

  const subjectName = subject
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const supabase = createServerClient()

  const { data: chapters, error } = await supabase
    .from('ncert')
    .select('id, class, subject, chapter_num, chapter_title, language')
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('language', lang)
    .order('chapter_num', { ascending: true })

  // Error state
  if (error) {
    console.error('Supabase error:', error)
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">
          Class {classNum} {subjectName} Notes
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          ⚠️ Could not load notes at the moment.
        </p>
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <Home className="w-4 h-4" /> Back to Notes
        </Link>
      </div>
    )
  }

  // Empty state
  if (!chapters || chapters.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-bold">
          Class {classNum} {subjectName} Notes
        </h1>
        <div className="mt-6 text-center py-12 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            📭 Notes coming soon
          </p>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            <Home className="w-4 h-4" /> Browse Other Subjects
          </Link>
        </div>
      </div>
    )
  }

  // Normal view
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/notes" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Notes
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/notes/${classNum}`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          Class {classNum}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {subjectName}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 p-6 md:p-8">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
            <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Class {classNum} {subjectName} Notes
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Chapter-wise notes aur study material
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-sm text-gray-700 dark:text-gray-300">
              <FileText className="w-3.5 h-3.5" />
              {chapters.length} Chapters
            </div>
          </div>
        </div>
        <LanguageToggle />
      </div>

      {/* Chapters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapters.map((ch) => (
          <Link
            key={ch.id}
            href={`/notes/${classNum}/${encodeURIComponent(subject)}/${ch.chapter_num}?lang=${lang}`}
            className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-5 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                {ch.chapter_num}
              </div>
              <h3 className="flex-1 font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                {ch.chapter_title}
              </h3>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}