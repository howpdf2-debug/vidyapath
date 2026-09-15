import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BookOpen,
  ChevronRight,
  Home,
  ArrowRight,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BackButton } from '@/components/BackButton'

// ==================== SEO ====================
export async function generateMetadata({
  params,
}: {
  params: { class: string }
}): Promise<Metadata> {
  const classNum = params.class
  return buildMetadata({
    title: `Class ${classNum} NCERT Solutions – All Subjects Free PDF | VidyaPath`,
    description: `Free NCERT solutions for Class ${classNum}. All subjects – chapter-wise notes and PDF downloads.`,
    path: `/ncert/${params.class}`,
    keywords: [`class ${classNum} NCERT`, `class ${classNum} solutions`, 'NCERT free'],
  })
}

// ==================== SUBJECT META ====================
const SUBJECT_META: Record<string, { icon: any; gradient: string; desc: string }> = {
  Mathematics: {
    icon: Calculator,
    gradient: 'from-blue-500 to-cyan-500',
    desc: 'Algebra, Geometry, Calculus',
  },
  Science: {
    icon: Atom,
    gradient: 'from-green-500 to-emerald-500',
    desc: 'Physics, Chemistry, Biology',
  },
  Physics: {
    icon: Atom,
    gradient: 'from-purple-500 to-indigo-500',
    desc: 'Mechanics, Optics, Electromagnetism',
  },
  Chemistry: {
    icon: FlaskConical,
    gradient: 'from-orange-500 to-red-500',
    desc: 'Organic, Inorganic, Physical',
  },
  Biology: {
    icon: Dna,
    gradient: 'from-pink-500 to-rose-500',
    desc: 'Botany, Zoology, Genetics',
  },
}

// ==================== PAGE ====================
export default async function NCERTClassPage({
  params,
  searchParams,
}: {
  params: { class: string }
  searchParams: { lang?: string }
}) {
  const classNum = parseInt(params.class, 10)
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  if (isNaN(classNum) || classNum < 1 || classNum > 12) notFound()

  const supabase = createServerClient()

  const { data: chapters, error } = await supabase
    .from('ncert')
    .select('subject')
    .eq('class', classNum)
    .eq('language', lang)

  if (error) {
    console.error('[ncert/class] Error:', error)
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <BackButton href="/ncert" label="Back to NCERT" language={lang} />
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">Class {classNum}</h1>
        <p className="text-gray-500 dark:text-gray-400">⚠️ Could not load subjects</p>
        <Link
          href="/ncert"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <Home className="w-4 h-4" /> Back to NCERT
        </Link>
      </div>
    )
  }

  // Group by subject
  const subjects: Record<string, number> = {}
  chapters?.forEach((ch) => {
    if (!subjects[ch.subject]) subjects[ch.subject] = 0
    subjects[ch.subject]++
  })

  const subjectList = Object.entries(subjects).sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  const totalChapters = chapters?.length || 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <BackButton href="/ncert" label="Back to NCERT" language={lang} />

      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/ncert" className="hover:text-indigo-600">
          NCERT
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          Class {classNum}
        </span>
      </nav>

      {/* HEADER */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 p-8 md:p-10 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium mb-3">
              <BookOpen className="w-3.5 h-3.5" /> NCERT 2026
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Class {classNum}</h1>
            <p className="mt-2 text-white/90">
              {lang === 'hi'
                ? `कक्षा ${classNum} के सभी विषय`
                : `All subjects for Class ${classNum}`}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sm">
                <FileText className="w-3.5 h-3.5" /> {subjectList.length}{' '}
                {lang === 'hi' ? 'विषय' : 'Subjects'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sm">
                <BookOpen className="w-3.5 h-3.5" /> {totalChapters}{' '}
                {lang === 'hi' ? 'अध्याय' : 'Chapters'}
              </span>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* SUBJECTS GRID */}
      {subjectList.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {lang === 'hi' ? 'विषय' : 'Subjects'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectList.map(([subject, count]) => {
              const meta = SUBJECT_META[subject] || {
                icon: BookOpen,
                gradient: 'from-indigo-500 to-purple-500',
                desc: 'Study material',
              }
              const Icon = meta.icon

              return (
                <Link
                  key={subject}
                  href={`/ncert/${classNum}/${encodeURIComponent(subject)}?lang=${lang}`}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 hover:shadow-2xl hover:scale-[1.02] transition-all"
                >
                  <div
                    className={`absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br ${meta.gradient} opacity-10 group-hover:opacity-20 transition`}
                  />
                  <div className="relative">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} text-white mb-4 shadow-lg`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {subject}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {meta.desc}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {count} {lang === 'hi' ? 'अध्याय' : 'chapters'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                        {lang === 'hi' ? 'खोलें' : 'Open'}{' '}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : (
        <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">
            {lang === 'hi' ? 'सामग्री जल्द आ रही है' : 'Content Coming Soon'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {lang === 'hi'
              ? `कक्षा ${classNum} के अध्याय अभी जोड़े जा रहे हैं।`
              : `Class ${classNum} chapters are being added.`}
          </p>
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            <Home className="w-4 h-4" />
            {lang === 'hi' ? 'वापस जाएं' : 'Back to NCERT'}
          </Link>
        </div>
      )}
    </div>
  )
}