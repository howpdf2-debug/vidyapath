import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Home,
  Sparkles,
  ChevronRight,
  Target,
  Trophy,
  FileText,
} from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import { EXAMS, SUBJECTS, TOPICS, getExam, getSubject, getTopics } from '@/lib/exams'

interface PageProps {
  params: { exam: string }
  searchParams: { group?: string }
}

export async function generateStaticParams() {
  return EXAMS.map((exam) => ({ exam: exam.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const exam = getExam(params.exam)
  if (!exam) return {}

  return buildMetadata({
    title: `${exam.name_hi} (${exam.name_en}) तैयारी – Free Notes, MCQ | VidyaPath`,
    description: `${exam.full_name_hi} की मुफ़्त तैयारी — हिंदी में नोट्स, MCQ, PYQ।`,
    path: `/competitive-exams/${exam.slug}`,
    keywords: [
      exam.name_hi,
      exam.name_en,
      'competitive exam',
      'free study material',
      'hindi medium',
    ],
  })
}

export default function ExamPage({ params, searchParams }: PageProps) {
  const exam = getExam(params.exam)
  if (!exam) notFound()

  const currentGroup =
    exam.groups.find((g) => g.slug === searchParams.group) || exam.groups[0]

  const groupSubjects = SUBJECTS

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* Back */}
      <Link
        href="/competitive-exams"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        सभी परीक्षाएँ
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
            प्रतियोगी परीक्षाएँ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {exam.name_hi}
          </span>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${exam.gradient} p-6 sm:p-10 md:p-12 text-white`}
      >
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/15 rounded-full blur-[100px] animate-pulse-slow" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          {/* Row 1: badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-5 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{exam.full_name_en}</span>
          </div>

          {/* Row 2: emoji + title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl sm:text-6xl">{exam.emoji}</div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {exam.name_hi}
              </h1>
              <p className="text-base text-white/80 mt-1">{exam.name_en}</p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-white/85 max-w-2xl mb-6 text-pretty">
            {exam.description_hi}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <Target className="w-3.5 h-3.5" />
              {exam.groups.length} ग्रुप
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              {SUBJECTS.length} विषय
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <FileText className="w-3.5 h-3.5" />
              {Object.values(TOPICS).flat().length} टॉपिक
            </span>
          </div>

          {/* Group tabs */}
          <GroupTabsWrapper groups={exam.groups} currentGroup={currentGroup.slug} />
        </div>
      </section>

      {/* Current group info */}
      <section className="surface-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-black shadow-lg">
            {currentGroup.name_hi.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 dark:text-white">
              {currentGroup.full_name_hi}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {currentGroup.full_name_en}
            </p>
            {currentGroup.posts_hi.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {currentGroup.posts_hi.map((post) => (
                  <span
                    key={post}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {post}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ SUBJECTS ═══ */}
      <section>
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Subjects
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            विषय चुनें
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupSubjects.map((subject) => {
            const topicCount = getTopics(subject.slug).length

            return (
              <Link
                key={subject.slug}
                href={`/competitive-exams/${exam.slug}/${subject.slug}?group=${currentGroup.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 transition-all hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${subject.gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                />
                <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900 -z-10" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform`}
                    >
                      {subject.icon}
                    </div>
                    {subject.is_gk && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 uppercase">
                        GK
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-0.5">
                    {subject.name_hi}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {subject.name_en}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {topicCount} टॉपिक
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-bold bg-gradient-to-r ${subject.gradient} bg-clip-text text-transparent`}
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
      </section>
    </div>
  )
}

// Inline group tabs (client component wrapper)
function GroupTabsWrapper({
  groups,
  currentGroup,
}: {
  groups: any[]
  currentGroup: string
}) {
  return (
    <div
      role="tablist"
      aria-label="Group selection"
      className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 overflow-x-auto scrollbar-none max-w-full"
    >
      {groups.map((group) => {
        const active = group.slug === currentGroup
        return (
          <Link
            key={group.slug}
            href={`?group=${group.slug}`}
            scroll={false}
            role="tab"
            aria-selected={active}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              active
                ? 'bg-white text-slate-900 shadow-lg'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{group.name_hi}</span>
            <span
              className={`text-[10px] font-medium ${
                active ? 'text-slate-500' : 'text-white/60'
              }`}
            >
              ({group.name_en})
            </span>
          </Link>
        )
      })}
    </div>
  )
}