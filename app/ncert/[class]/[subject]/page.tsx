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
  Clock,
  AlertCircle,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'

// ==================== SEO METADATA ====================
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
    title: `Class ${classNum} ${subjectName} NCERT Solutions – Free PDF | VidyaPath`,
    description: `Free NCERT solutions for Class ${classNum} ${subjectName}. Chapter-wise notes, exercises, and PDF downloads based on latest CBSE syllabus. Access all chapters in one place.`,
    path: `/ncert/${params.class}/${params.subject}`,
    keywords: [
      `class ${classNum} ${subjectName}`,
      `ncert ${subjectName} class ${classNum}`,
      `${subjectName} solutions class ${classNum}`,
      `class ${classNum} ${subjectName} notes`,
      'ncert solutions free',
      'ncert pdf download',
    ],
  })
}

// ==================== PAGE COMPONENT ====================
export default async function NCERTSubjectPage({
  params,
}: {
  params: { class: string; subject: string }
}) {
  // Decode params
  const classNum = parseInt(params.class, 10)
  const subject = decodeURIComponent(params.subject)
  const subjectName = subject
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  // Validate class number
  if (isNaN(classNum)) {
    notFound()
  }

  const supabase = createServerClient()

  // ===== Fetch chapters from `ncert` table =====
  const { data: chapters, error } = await supabase
    .from('ncert')
    .select('id, class, subject, chapter_num, chapter_title, pdf_url')
    .eq('class', classNum)
    .eq('subject', subject)
    .order('chapter_num', { ascending: true })

  // ===== Handle DB Error =====
  if (error) {
    console.error('Supabase error:', error)
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">
          Class {classNum} {subjectName} NCERT Solutions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3">
          ⚠️ Could not load chapters at the moment.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Please try refreshing or check back later.
        </p>
        <Link
          href="/ncert"
          className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <Home className="w-4 h-4" />
          Back to NCERT
        </Link>
      </div>
    )
  }

  // ===== Empty State =====
  if (!chapters || chapters.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/ncert" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            NCERT
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/ncert/${params.class}`}
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Class {classNum}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {subjectName}
          </span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold">
          Class {classNum} {subjectName}
        </h1>

        <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            📭 Chapters coming soon
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Content is being added. Check back later.
          </p>
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            <Home className="w-4 h-4" />
            Browse Other Subjects
          </Link>
        </div>
      </div>
    )
  }

  // ===== Normal View =====
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/ncert" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          NCERT
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/ncert/${params.class}`}
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
      <header className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold">
              Class {classNum} – {subjectName}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Complete NCERT Solutions, chapter-wise notes, aur free PDF
              downloads — CBSE syllabus ke according updated.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300">
                <FileText className="w-3.5 h-3.5" />
                {chapters.length} Chapters
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300">
                <Download className="w-3.5 h-3.5" />
                Free PDF
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300">
                <Clock className="w-3.5 h-3.5" />
                Updated 2026
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chapters List */}
      <section>
        <h2 className="text-2xl font-bold mb-4">All Chapters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((ch, index) => (
            <div
              key={ch.id}
              className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-5 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              {/* Chapter Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                  {ch.chapter_num || index + 1}
                </div>
                <h3 className="flex-1 text-lg font-semibold leading-tight line-clamp-2">
                  {ch.chapter_title}
                </h3>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                {ch.pdf_url && (
                  <a
                    href={ch.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                  >
                    <FileText className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
                <Link
                  href={`/ncert/${classNum}/${encodeURIComponent(subject)}/${ch.chapter_num}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition ml-auto"
                >
                  <BookOpen className="w-4 h-4" />
                  Read Notes
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — Cross-link to Notes */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 rounded-2xl p-6 md:p-8 text-white text-center">
        <h2 className="text-xl md:text-2xl font-bold">
          Looking for notes too?
        </h2>
        <p className="mt-2 text-indigo-100 text-sm max-w-xl mx-auto">
          Class {classNum} {subjectName} ke saare notes, important questions,
          aur revision material ek jagah.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <Link
            href={`/notes/${classNum}/${encodeURIComponent(subject)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-medium hover:bg-indigo-50 transition shadow-lg"
          >
            <FileText className="w-4 h-4" />
            View Notes
          </Link>
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-medium hover:bg-white/20 transition"
          >
            <Home className="w-4 h-4" />
            All Classes
          </Link>
        </div>
      </section>

      {/* Related Links */}
      <section className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aur bhi dekho:{' '}
          <Link
            href="/competitive-exams"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Competitive Exams
          </Link>
          {' · '}
          <Link
            href="/rojgar-samachar"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Rojgar Samachar
          </Link>
          {' · '}
          <Link
            href="/results"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Results
          </Link>
        </p>
      </section>
    </div>
  )
}