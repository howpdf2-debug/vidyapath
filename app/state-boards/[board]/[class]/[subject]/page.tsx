import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Download,
  Home,
  Layers,
  BookOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import {
  STATE_BOARDS,
  getBoard,
  getSubjectBySlug,
  getDbSubjectName,
  isValidClass,
  SUBJECT_HI_MAP,
} from '@/lib/state-boards'
import { getPdfUrl } from '@/lib/pdf'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { board: string; class: string; subject: string }
}

export async function generateStaticParams() {
  const params: { board: string; class: string; subject: string }[] = []
  for (const board of STATE_BOARDS) {
    for (const cls of [6, 7, 8, 9, 10]) {
      for (const meta of Object.values(SUBJECT_HI_MAP)) {
        params.push({
          board: board.slug,
          class: String(cls),
          subject: meta.slug,
        })
      }
    }
  }
  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const board = getBoard(params.board)
  const subjectMeta = getSubjectBySlug(params.subject)
  if (!board || !subjectMeta) return {}

  return buildMetadata({
    title: `Class ${params.class} ${subjectMeta.name_hi} – ${board.name_hi} हिंदी माध्यम | VidyaPath`,
    description: `${board.name_hi} Class ${params.class} ${subjectMeta.name_hi} — NCERT हिंदी माध्यम चैप्टर-wise notes, PDF।`,
    path: `/state-boards/${params.board}/${params.class}/${params.subject}`,
  })
}

export default async function SubjectPage({ params }: PageProps) {
  const board = getBoard(params.board)
  const classNum = parseInt(params.class, 10)

  if (!board || !isValidClass(classNum)) notFound()

  const subjectMeta = getSubjectBySlug(params.subject)
  if (!subjectMeta) notFound()

  const dbSubjectName = getDbSubjectName(params.subject)
  if (!dbSubjectName) notFound()

  const supabase = createClient()

  const { data: chapters } = await supabase
    .from('ncert')
    .select('id, chapter_num, chapter_title, book_code')
    .eq('class', classNum)
    .eq('subject', dbSubjectName)
    .eq('language', 'hi')
    .order('chapter_num', { ascending: true })

  return (
    <div className="space-y-8 pb-16">
      {/* Back */}
      <Link
        href={`/state-boards/${board.slug}/${classNum}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Class {classNum}
      </Link>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="breadcrumb-scroll text-sm text-slate-500 dark:text-slate-400"
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">होम</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href="/state-boards" className="hover:text-brand-600">
            राज्य बोर्ड
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link
            href={`/state-boards/${board.slug}`}
            className="hover:text-brand-600"
          >
            {board.name_hi}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link
            href={`/state-boards/${board.slug}/${classNum}`}
            className="hover:text-brand-600"
          >
            Class {classNum}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {subjectMeta.name_hi}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${subjectMeta.gradient} p-6 sm:p-10 text-white`}
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/20 rounded-full blur-[100px] animate-pulse-slow" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-4 border border-white/20">
            {board.name_hi} • Class {classNum}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl sm:text-6xl">{subjectMeta.icon}</div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {subjectMeta.name_hi}
              </h1>
              <p className="text-base text-white/80 mt-1">{subjectMeta.name_en}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <Layers className="w-3.5 h-3.5" />
              {chapters?.length || 0} अध्याय
            </span>
          </div>
        </div>
      </section>

      {/* Chapters */}
      <section aria-labelledby="chapters-heading">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Chapters
          </div>
          <h2
            id="chapters-heading"
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            अध्याय चुनें
          </h2>
        </div>

        {chapters && chapters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chapters.map((ch) => {
              const pdfUrl = getPdfUrl(ch.book_code, classNum, ch.chapter_num)
              const href = `/state-boards/${board.slug}/${classNum}/${params.subject}/${ch.chapter_num}`

              return (
                <div
                  key={ch.id}
                  className="group relative surface-card hover:shadow-cardHover hover:border-brand-300 dark:hover:border-brand-700 transition-all overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${subjectMeta.gradient} opacity-0 group-hover:opacity-100 transition`}
                  />

                  <div className="p-4 sm:p-5">
                    <Link
                      href={href}
                      className="flex items-start gap-3 mb-3 group/link"
                    >
                      <div
                        className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${subjectMeta.gradient} flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-md group-hover/link:scale-105 transition`}
                      >
                        {ch.chapter_num}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">
                          अध्याय {ch.chapter_num}
                        </p>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover/link:text-brand-600 transition">
                          {ch.chapter_title}
                        </h3>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                      {pdfUrl && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-medium transition tap-target"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </a>
                      )}
                      <Link
                        href={href}
                        className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 text-xs font-medium transition tap-target group-hover:gap-2"
                      >
                        पढ़ें
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="surface-card text-center py-16 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-4">
              <span className="text-4xl">📖</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              अध्याय जल्द आ रहे हैं
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {subjectMeta.name_hi} के अध्याय तैयार किए जा रहे हैं।
            </p>
          </div>
        )}
      </section>
    </div>
  )
}