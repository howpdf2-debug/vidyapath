import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BookOpen,
  FileText,
  ArrowRight,
  ChevronRight,
  Home,
  Download,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BackButton } from '@/components/BackButton'

export async function generateMetadata({
  params,
}: {
  params: { class: string; subject: string }
}): Promise<Metadata> {
  const classNum = params.class
  const subjectName = decodeURIComponent(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return buildMetadata({
    title: `Class ${classNum} ${subjectName} Notes – Free Download | VidyaPath`,
    description: `Free Class ${classNum} ${subjectName} study notes. Chapter-wise summary and revision material.`,
    path: `/notes/${params.class}/${params.subject}`,
    keywords: [`class ${classNum} ${subjectName} notes`, 'free study notes'],
  })
}

export default async function NotesSubjectPage({
  params,
  searchParams,
}: {
  params: { class: string; subject: string }
  searchParams: { lang?: string }
}) {
  const classNum = parseInt(params.class, 10)
  const subject = decodeURIComponent(params.subject)
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  if (isNaN(classNum)) notFound()

  const subjectName = subject
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const supabase = createServerClient()

  const { data: chapters } = await supabase
    .from('ncert')
    .select('id, chapter_num, chapter_title, book_code')
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('language', lang)
    .order('chapter_num', { ascending: true })

  if (!chapters || chapters.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6">
        <BackButton href="/notes" label="Back to Notes" language={lang} />
        <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">
            Class {classNum} {subjectName} Notes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            📭 Notes coming soon
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <BackButton href="/notes" label="Back to Notes" language={lang} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/notes" className="hover:text-indigo-600">Notes</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          Class {classNum} • {subjectName}
        </span>
      </nav>

      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 md:p-8 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                Class {classNum} • {subjectName}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mt-1">
                Study Notes
              </h1>
              <p className="mt-2 text-white/90">
                {chapters.length} chapters available
              </p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Chapters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapters.map((ch) => {
          const pdfUrl = ch.book_code
            ? `https://ncert.nic.in/textbook/pdf/${ch.book_code}.pdf`
            : null
          const href = `/notes/${classNum}/${encodeURIComponent(subject)}/${ch.chapter_num}?lang=${lang}`

          return (
            <div
              key={ch.id}
              className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all overflow-hidden"
            >
              <Link href={href} className="flex items-start gap-3 p-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white shadow-md group-hover:scale-105 transition">
                  {ch.chapter_num}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase">
                    Chapter {ch.chapter_num}
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition line-clamp-2">
                    {ch.chapter_title}
                  </h3>
                </div>
              </Link>

              <div className="flex items-center gap-2 px-5 pb-4">
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </a>
                )}
                <Link
                  href={href}
                  className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 transition"
                >
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}