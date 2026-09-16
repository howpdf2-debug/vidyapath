import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Home,
  Layers,
  Target,
} from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import { getExam, getSubject, getTopics } from '@/lib/exams'

interface PageProps {
  params: { exam: string; subject: string }
  searchParams: { group?: string }
}

export async function generateStaticParams() {
  const { EXAMS, SUBJECTS } = await import('@/lib/exams')
  const params: { exam: string; subject: string }[] = []
  for (const exam of EXAMS) {
    for (const subject of SUBJECTS) {
      params.push({ exam: exam.slug, subject: subject.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const exam = getExam(params.exam)
  const subject = getSubject(params.subject)
  if (!exam || !subject) return {}

  return buildMetadata({
    title: `${subject.name_hi} (${subject.name_en}) – ${exam.name_hi} तैयारी | VidyaPath`,
    description: `${exam.name_hi} ${subject.name_hi} — हिंदी में नोट्स, MCQ, PYQ।`,
    path: `/competitive-exams/${exam.slug}/${subject.slug}`,
  })
}

export default function SubjectPage({ params, searchParams }: PageProps) {
  const exam = getExam(params.exam)
  const subject = getSubject(params.subject)
  if (!exam || !subject) notFound()

  const currentGroup =
    exam.groups.find((g) => g.slug === searchParams.group) || exam.groups[0]

  const topics = getTopics(subject.slug)

  return (
    <div className="space-y-8 pb-16">
      {/* Back */}
      <Link
        href={`/competitive-exams/${exam.slug}?group=${currentGroup.slug}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        {exam.name_hi}
      </Link>

      {/* Breadcrumb */}
      <nav className="breadcrumb-scroll text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">होम</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href="/competitive-exams" className="hover:text-brand-600">
            परीक्षाएँ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link
            href={`/competitive-exams/${exam.slug}?group=${currentGroup.slug}`}
            className="hover:text-brand-600"
          >
            {exam.name_hi}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {subject.name_hi}
          </span>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${subject.gradient} p-6 sm:p-10 text-white`}
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/15 rounded-full blur-[100px] animate-pulse-slow" />

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-5 border border-white/20">
            <Target className="w-3.5 h-3.5" />
            <span>
              {exam.name_hi} • {currentGroup.name_hi}
            </span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl sm:text-6xl">{subject.icon}</div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {subject.name_hi}
              </h1>
              <p className="text-base text-white/80 mt-1">
                {subject.name_en}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <Layers className="w-3.5 h-3.5" />
              {topics.length} टॉपिक
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              {topics.length * 10}+ MCQ
            </span>
          </div>
        </div>
      </section>

      {/* ═══ TOPICS ═══ */}
      <section>
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Topics
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            टॉपिक चुनें
          </h2>
        </div>

        {topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topics.map((topic, idx) => (
              <Link
                key={topic.slug}
                href={`/competitive-exams/${exam.slug}/${subject.slug}/${topic.slug}?group=${currentGroup.slug}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-white font-black text-base shadow-md group-hover:scale-105 transition-transform flex-shrink-0`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition truncate">
                    {topic.name_hi}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {topic.short} • {topic.name_en}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition flex-shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="surface-card p-10 text-center">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-slate-500">टॉपिक जल्द आ रहे हैं।</p>
          </div>
        )}
      </section>
    </div>
  )
}