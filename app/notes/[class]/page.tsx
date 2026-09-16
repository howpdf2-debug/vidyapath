import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BookOpen, ChevronRight, Home, Calculator, Atom, FlaskConical, Dna,
  AlertCircle, BookMarked, Sparkles, Layers, FileText,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { BackButton } from '@/components/BackButton'
import { HeroSection } from '@/components/HeroSection'
import { SubjectCard } from '@/components/SubjectCard'
import { EmptyState } from '@/components/EmptyState'
import { SectionHeader } from '@/components/SectionHeader'

export async function generateMetadata({
  params,
}: {
  params: { class: string }
}): Promise<Metadata> {
  const classNum = params.class
  return buildMetadata({
    title: `Class ${classNum} Study Notes – Free Chapter-wise Notes | VidyaPath`,
    description: `Free study notes for Class ${classNum}. All subjects — chapter-wise notes and revision material.`,
    path: `/notes/${params.class}`,
    keywords: [`class ${classNum} notes`, 'free study notes', 'chapter notes'],
  })
}

const SUBJECT_META: Record<string, { icon: any; gradient: string; desc: string }> = {
  Mathematics: { icon: Calculator, gradient: 'from-blue-500 to-cyan-500', desc: 'Algebra, Geometry, Calculus' },
  Science: { icon: Atom, gradient: 'from-emerald-500 to-teal-500', desc: 'Physics, Chemistry, Biology' },
  Physics: { icon: Atom, gradient: 'from-purple-500 to-indigo-500', desc: 'Mechanics, Optics, Electromagnetism' },
  Chemistry: { icon: FlaskConical, gradient: 'from-orange-500 to-red-500', desc: 'Organic, Inorganic, Physical' },
  Biology: { icon: Dna, gradient: 'from-green-500 to-emerald-500', desc: 'Botany, Zoology, Genetics' },
  English: { icon: BookOpen, gradient: 'from-fuchsia-500 to-pink-500', desc: 'Literature, Grammar' },
  Hindi: { icon: BookMarked, gradient: 'from-amber-500 to-orange-500', desc: 'व्याकरण, साहित्य' },
}

export default async function NotesClassPage({
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
        <BackButton href="/notes" label="Back to Notes" language={lang as 'en' | 'hi'} />
        <div className="surface-card p-10 text-center mt-6">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Class {classNum} Notes</h1>
          <p className="text-slate-500 mb-6">⚠️ Could not load subjects.</p>
        </div>
      </div>
    )
  }

  const subjects: Record<string, number> = {}
  chapters?.forEach((ch) => {
    if (!subjects[ch.subject]) subjects[ch.subject] = 0
    subjects[ch.subject]++
  })

  const subjectList = Object.entries(subjects).sort((a, b) => a[0].localeCompare(b[0]))
  const totalChapters = chapters?.length || 0

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <BackButton href="/notes" label="Back to Notes" language={lang as 'en' | 'hi'} />

      {/* BREADCRUMB — sticky */}
      <nav className="sticky top-14 sm:top-16 z-30 -mx-4 px-4 py-2 bg-paper/80 dark:bg-ink/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 md:static md:mx-0 md:px-0 md:py-0 md:bg-transparent md:border-0 md:backdrop-blur-none">
        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 overflow-x-auto scrollbar-none whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 flex items-center gap-1 flex-shrink-0">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href="/notes" className="hover:text-brand-600 flex-shrink-0">Notes</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium flex-shrink-0">
            Class {classNum}
          </span>
        </div>
      </nav>

      {/* HERO */}
      <HeroSection
        badge={{ icon: Sparkles, text: `Class ${classNum} • Study Notes` }}
        title={
          <>
            Class {classNum}{' '}
            <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Notes
            </span>
          </>
        }
        subtitle={
          lang === 'hi'
            ? `कक्षा ${classNum} के सभी विषयों के नोट्स`
            : `Chapter-wise notes for all Class ${classNum} subjects`
        }
        gradient="from-emerald-600 via-teal-600 to-cyan-600"
        stats={[
          { icon: FileText, label: `${subjectList.length} Subjects` },
          { icon: BookOpen, label: `${totalChapters} Chapters` },
        ]}
      />

      {/* SUBJECTS */}
      {subjectList.length > 0 ? (
        <section>
          <SectionHeader
            badge={{ icon: Layers, text: 'Subjects' }}
            title={lang === 'hi' ? 'सभी विषय' : 'All Subjects'}
            description={`${subjectList.length} subjects with notes`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectList.map(([subject, count]) => {
              const meta = SUBJECT_META[subject] || {
                icon: BookOpen,
                gradient: 'from-emerald-500 to-teal-500',
                desc: 'Study notes',
              }

              return (
                <SubjectCard
                  key={subject}
                  subject={subject}
                  icon={meta.icon}
                  gradient={meta.gradient}
                  description={meta.desc}
                  chapterCount={count}
                  href={`/notes/${classNum}/${encodeURIComponent(subject)}?lang=${lang}`}
                  lang={lang}
                  size="lg"
                />
              )
            })}
          </div>
        </section>
      ) : (
        <EmptyState
          emoji="📝"
          title={`Class ${classNum} Notes Coming Soon`}
          description={`Notes for Class ${classNum} are being added.`}
          actions={[
            { href: '/notes', label: 'Back to Notes', icon: Home, primary: true },
          ]}
        />
      )}
    </div>
  )
}