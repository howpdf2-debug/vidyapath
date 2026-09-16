import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronRight, Home, Target } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { buildMetadata } from '@/lib/seo'
import { getExam, getSubject, getTopic } from '@/lib/exams'
import { ContentTabs } from '@/components/exam/ContentTabs'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { exam: string; subject: string; topic: string }
  searchParams: { group?: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const exam = getExam(params.exam)
  const subject = getSubject(params.subject)
  const topic = getTopic(params.subject, params.topic)
  if (!exam || !subject || !topic) return {}

  return buildMetadata({
    title: `${topic.name_hi} (${topic.short}) – ${exam.name_hi} ${subject.name_hi} | VidyaPath`,
    description: `${exam.name_hi} ${subject.name_hi} ${topic.name_hi} — हिंदी में नोट्स, MCQ, PYQ।`,
    path: `/competitive-exams/${exam.slug}/${subject.slug}/${topic.slug}`,
  })
}

export default async function TopicPage({ params, searchParams }: PageProps) {
  const exam = getExam(params.exam)
  const subject = getSubject(params.subject)
  const topic = getTopic(params.subject, params.topic)
  if (!exam || !subject || !topic) notFound()

  const currentGroup =
    exam.groups.find((g) => g.slug === searchParams.group) || exam.groups[0]

  // Fetch content from DB
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  let notes: any[] = []
  let mcqs: any[] = []

  try {
    // Find topic ID in DB (based on exam + subject + topic slug)
    const { data: topicRow } = await supabase
      .from('exam_topics')
      .select(`
        id,
        exam_subjects!inner (
          slug,
          exam_groups!inner (
            slug,
            exams!inner (slug)
          )
        )
      `)
      .eq('slug', topic.slug)
      .eq('exam_subjects.slug', subject.slug)
      .eq('exam_subjects.exam_groups.slug', currentGroup.slug)
      .eq('exam_subjects.exam_groups.exams.slug', exam.slug)
      .maybeSingle()

    if (topicRow?.id) {
      const [notesRes, mcqsRes] = await Promise.all([
        supabase
          .from('exam_topic_notes')
          .select('id, section_title_hi, content_html_hi')
          .eq('topic_id', topicRow.id)
          .order('order_index'),
        supabase
          .from('exam_mcqs')
          .select('id, question_html_hi, options_hi, correct_answer, explanation_html_hi, difficulty')
          .eq('topic_id', topicRow.id)
          .eq('is_active', true)
          .order('order_index'),
      ])
      notes = notesRes.data || []
      mcqs = mcqsRes.data || []
    }
  } catch (err) {
    console.error('[topic] fetch failed:', err)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Back */}
      <Link
        href={`/competitive-exams/${exam.slug}/${subject.slug}?group=${currentGroup.slug}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        {subject.name_hi}
      </Link>

      {/* Breadcrumb */}
      <nav className="breadcrumb-scroll text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">होम</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link
            href={`/competitive-exams/${exam.slug}?group=${currentGroup.slug}`}
            className="hover:text-brand-600"
          >
            {exam.name_hi}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link
            href={`/competitive-exams/${exam.slug}/${subject.slug}?group=${currentGroup.slug}`}
            className="hover:text-brand-600"
          >
            {subject.name_hi}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {topic.name_hi}
          </span>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${subject.gradient} p-6 sm:p-8 md:p-10 text-white`}
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[80px] animate-pulse-slow" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-4 border border-white/20">
            <Target className="w-3.5 h-3.5" />
            <span>{exam.name_hi} • {subject.name_hi}</span>
          </div>

          <div className="flex items-start gap-4 mb-3">
            <div className="text-4xl sm:text-5xl flex-shrink-0">
              {subject.icon}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight break-words">
                {topic.name_hi}
              </h1>
              <p className="text-sm sm:text-base text-white/80 mt-1">
                {topic.name_en}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTENT TABS ═══ */}
      <ContentTabs
        notes={notes}
        mcqs={mcqs}
        topicTitle={topic.name_hi}
      />
    </div>
  )
}