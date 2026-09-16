import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BookOpen, ChevronRight, Home, Calculator, Atom, FlaskConical, Dna,
  FileText, AlertCircle, BookMarked, Sparkles, Layers, TrendingUp,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BackButton } from '@/components/BackButton'

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

const SUBJECT_META: Record<
  string,
  { icon: any; gradient: string; desc: string; emoji: string }
> = {
  Mathematics: { icon: Calculator, gradient: 'from-blue-500 to-cyan-500', desc: 'Algebra, Geometry, Calculus', emoji: '📐' },
  Science: { icon: Atom, gradient: 'from-emerald-500 to-teal-500', desc: 'Physics, Chemistry, Biology', emoji: '🔬' },
  Physics: { icon: Atom, gradient: 'from-purple-500 to-indigo-500', desc: 'Mechanics, Optics, Electromagnetism', emoji: '⚛️' },
  Chemistry: { icon: FlaskConical, gradient: 'from-orange-500 to-red-500', desc: 'Organic, Inorganic, Physical', emoji: '🧪' },
  Biology: { icon: Dna, gradient: 'from-green-500 to-emerald-500', desc: 'Botany, Zoology, Genetics', emoji: '🧬' },
  English: { icon: BookOpen, gradient: 'from-fuchsia-500 to-pink-500', desc: 'Literature, Grammar, Writing', emoji: '📖' },
  Hindi: { icon: BookMarked, gradient: 'from-amber-500 to-orange-500', desc: 'व्याकरण, साहित्य, रचना', emoji: '🕉️' },
}

const SUBJECT_ORDER: Record<string, number> = {
  Mathematics: 1, Science: 2, Physics: 3, Chemistry: 4, Biology: 5,
  'Social Science': 6, English: 7, Hindi: 8, Sanskrit: 9,
}

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
    return (
      <div className="max-w-4xl mx-auto py-12">
        <BackButton href="/ncert" label="Back to NCERT" language={lang as 'en' | 'hi'} />
        <div className="surface-card p-10 text-center mt-6">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Class {classNum}</h1>
          <p className="text-slate-500 mb-6">⚠️ Could not load subjects.</p>
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium"
          >
            <Home className="w-4 h-4" /> Back to NCERT
          </Link>
        </div>
      </div>
    )
  }

  const subjects: Record<string, number> = {}
  chapters?.forEach((ch) => {
    if (!subjects[ch.subject]) subjects[ch.subject] = 0
    subjects[ch.subject]++
  })

  const subjectList = Object.entries(subjects).sort((a, b) => {
    const orderA = SUBJECT_ORDER[a[0]] ?? 999
    const orderB = SUBJECT_ORDER[b[0]] ?? 999
    if (orderA !== orderB) return orderA - orderB
    return a[0].localeCompare(b[0])
  })

  const totalChapters = chapters?.length || 0

  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 pb-16">
      <BackButton href="/ncert" label="Back to NCERT" language={lang as 'en' | 'hi'} />

      {/* BREADCRUMB */}
      <nav className="sticky top-14 sm:top-16 z-30 -mx-4 px-4 py-2 bg-paper/80 dark:bg-ink/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 md:static md:mx-0 md:px-0 md:py-0 md:bg-transparent md:border-0 md:backdrop-blur-none">
        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 overflow-x-auto scrollbar-none whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 flex items-center gap-1 flex-shrink-0">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href="/ncert" className="hover:text-brand-600 flex-shrink-0">NCERT</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium flex-shrink-0">
            Class {classNum}
          </span>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600 p-6 sm:p-10 md:p-14 text-white">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/30 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-400/30 rounded-full blur-[100px] animate-pulse-slow" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs sm:text-sm font-medium border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Class {classNum} • NCERT 2026</span>
            </div>
            <LanguageToggle />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-4">
            Class{' '}
            <span className="bg-gradient-to-r from-yellow-200 to-amber-200 bg-clip-text text-transparent">
              {classNum}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-xl mb-6 text-pretty">
            {lang === 'hi'
              ? `कक्षा ${classNum} के सभी विषय — अध्याय-वार समाधान और मुफ्त PDF`
              : `All subjects for Class ${classNum} — chapter-wise solutions and free PDF`}
          </p>

          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <FileText className="w-3.5 h-3.5" />
              {subjectList.length} Subjects
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              {totalChapters} Chapters
            </span>
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      {subjectList.length > 0 ? (
        <section>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
              <Layers className="w-3.5 h-3.5" />
              Subjects
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {lang === 'hi' ? 'सभी विषय' : 'All Subjects'}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-3">
              {subjectList.length} subjects available for Class {classNum}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectList.map(([subject, count]) => {
              const meta = SUBJECT_META[subject] || {
                icon: BookOpen,
                gradient: 'from-brand-500 to-purple-500',
                desc: 'Study material',
                emoji: '📚',
              }

              return (
                <Link
                  key={subject}
                  href={`/ncert/${classNum}/${encodeURIComponent(subject)}?lang=${lang}`}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 transition-all hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
                  <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900 -z-10" />
                  <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${meta.gradient} opacity-10 group-hover:opacity-20 blur-2xl transition`} />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
                        <meta.icon className="w-7 h-7" />
                      </div>
                      <span className="text-3xl">{meta.emoji}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                      {subject}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                      {meta.desc}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {count} {lang === 'hi' ? 'अध्याय' : 'chapters'}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}>
                        Explore
                        <ChevronRight className="w-4 h-4 text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : (
        <div className="surface-card text-center py-16 px-6">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Class {classNum} Content Coming Soon
          </h3>
          <p className="text-slate-500 mb-6">
            Chapters for Class {classNum} are being added.
          </p>
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium"
          >
            <Home className="w-4 h-4" /> Back to NCERT
          </Link>
        </div>
      )}
    </div>
  )
}