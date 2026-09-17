import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Home,
  Layers,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import {
  STATE_BOARDS,
  getBoard,
  getOrderedSubjects,
  STATE_BOARD_CLASSES,
  isValidClass,
} from '@/lib/state-boards'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { board: string; class: string }
}

export async function generateStaticParams() {
  const params: { board: string; class: string }[] = []
  for (const board of STATE_BOARDS) {
    for (const cls of STATE_BOARD_CLASSES) {
      params.push({ board: board.slug, class: String(cls) })
    }
  }
  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const board = getBoard(params.board)
  if (!board) return {}

  return buildMetadata({
    title: `Class ${params.class} ${board.name_hi} – NCERT हिंदी माध्यम | VidyaPath`,
    description: `${board.name_hi} Class ${params.class} के सभी विषय — NCERT हिंदी माध्यम नोट्स, PDF।`,
    path: `/state-boards/${params.board}/${params.class}`,
  })
}

export default async function ClassPage({ params }: PageProps) {
  const board = getBoard(params.board)
  const classNum = parseInt(params.class, 10)

  if (!board || !isValidClass(classNum)) notFound()

  const supabase = createClient()

  const { data: chapters } = await supabase
    .from('ncert')
    .select('subject')
    .eq('class', classNum)
    .eq('language', 'hi')

  // Count per subject (DB has English names like "Mathematics")
  const subjectCounts: Record<string, number> = {}
  chapters?.forEach((ch) => {
    if (!subjectCounts[ch.subject]) subjectCounts[ch.subject] = 0
    subjectCounts[ch.subject]++
  })

  // Ordered subjects (Math first, then Science...)
  const subjects = getOrderedSubjects(Object.keys(subjectCounts))
  const totalChapters = chapters?.length || 0

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* Back */}
      <Link
        href={`/state-boards/${board.slug}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        {board.name_hi}
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
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            Class {classNum}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${board.gradient} p-6 sm:p-10 text-white`}
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-4 border border-white/20">
            <GraduationCap className="w-3.5 h-3.5" />
            {board.name_hi} • हिंदी माध्यम
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
            Class {classNum}
          </h1>
          <p className="text-sm sm:text-base text-white/85 max-w-2xl text-pretty">
            {board.name_hi} कक्षा {classNum} के सभी विषय — NCERT हिंदी माध्यम
          </p>

          <div className="flex flex-wrap gap-2 text-xs sm:text-sm mt-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              {subjects.length} विषय
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <Layers className="w-3.5 h-3.5" />
              {totalChapters} अध्याय
            </span>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section aria-labelledby="subjects-heading">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Subjects
          </div>
          <h2
            id="subjects-heading"
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            विषय चुनें
          </h2>
        </div>

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((meta) => {
              const count = subjectCounts[meta.db_name] || 0

              return (
                <Link
                  key={meta.slug}
                  href={`/state-boards/${board.slug}/${classNum}/${meta.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 transition-all hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                  />
                  <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900 -z-10" />
                  <div
                    className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${meta.gradient} opacity-10 group-hover:opacity-20 blur-2xl transition`}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform`}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                          {meta.name_hi}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {meta.name_en}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {count} अध्याय
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-bold bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}
                      >
                        खोलें
                        <ArrowRight className="w-3.5 h-3.5 text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="surface-card text-center py-16 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-4">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              सामग्री जल्द आ रही है
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Class {classNum} के विषय जल्द ही जोड़े जा रहे हैं।
            </p>
          </div>
        )}
      </section>
    </div>
  )
}