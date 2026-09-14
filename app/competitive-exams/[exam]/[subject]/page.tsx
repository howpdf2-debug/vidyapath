import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, ArrowRight, HelpCircle } from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'

const validExams = ['ssc', 'railway', 'bank']

const examLabels: Record<string, string> = {
  ssc: 'SSC',
  railway: 'Railway',
  bank: 'Bank',
}

const fallbackTopics: Record<string, string[]> = {
  'गणित': ['बीजगणित', 'लाभ-हानि', 'साधारण ब्याज', 'चक्रवृद्धि ब्याज', 'समय-दूरी', 'अनुपात-समानुपात'],
  'तर्क शक्ति': ['रक्त संबंध', 'दिशा-ज्ञान', 'श्रृंखला', 'कोडिंग-डिकोडिंग', 'सादृश्यता'],
  'सामान्य अंग्रेजी': ['व्याकरण', 'शब्दावली', 'गद्यांश', 'वाक्य-सुधार'],
  'सामान्य जागरूकता': ['इतिहास', 'भूगोल', 'संविधान', 'विज्ञान', 'करेंट अफेयर्स'],
  'सामान्य विज्ञान': ['भौतिकी', 'रसायन', 'जीव विज्ञान', 'पर्यावरण'],
  'मात्रात्मक अभियोग्यता': ['संख्या प्रणाली', 'बीजगणित', 'ज्यामिति', 'मेंसुरेशन', 'आंकड़े'],
  'बैंकिंग जागरूकता': ['बैंकिंग की मूल बातें', 'RBI', 'वित्तीय बाजार', 'आर्थिक शब्दावली'],
  'कंप्यूटर ज्ञान': ['बेसिक कंप्यूटर', 'MS Office', 'इंटरनेट', 'डेटाबेस'],
}

// ==================== SEO ====================
export async function generateMetadata({
  params,
}: {
  params: { exam: string; subject: string }
}): Promise<Metadata> {
  const examSlug = params.exam
  const examLabel = examLabels[examSlug] || examSlug.toUpperCase()
  const subjectName = decodeURIComponent(params.subject)

  return buildMetadata({
    title: `${examLabel} ${subjectName} – Study Notes & Practice Questions | VidyaPath`,
    description: `Free ${subjectName} study material for ${examLabel} exam. Topic-wise notes, practice questions, and important concepts.`,
    path: `/competitive-exams/${params.exam}/${params.subject}`,
    keywords: [
      `${examLabel} ${subjectName}`,
      `${subjectName} notes`,
      `${examLabel} preparation`,
      `${examLabel} practice questions`,
    ],
  })
}

// ==================== PAGE ====================
export default async function CompetitiveSubjectPage({
  params,
}: {
  params: { exam: string; subject: string }
}) {
  const { exam, subject } = params
  const decodedSubject = decodeURIComponent(subject)

  if (!validExams.includes(exam)) notFound()

  const supabase = createServerClient()

  let topics: string[] = []
  try {
    const { data } = await supabase
      .from('exam_topics')
      .select('name')
      .eq('subject_slug', subject)
      .order('name')
    if (data) topics = data.map((t: any) => t.name)
  } catch {}

  const topicList = topics.length > 0 ? topics : fallbackTopics[decodedSubject] || ['Coming soon']
  const examLabel = examLabels[exam] || exam.toUpperCase()

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/competitive-exams" className="hover:text-indigo-600">
          Competitive Exams
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/competitive-exams/${exam}`} className="hover:text-indigo-600">
          {examLabel}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {decodedSubject}
        </span>
      </nav>

      {/* Header */}
      <header className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/40 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {examLabel} Exam
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">{decodedSubject}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Topic-wise notes aur practice questions
            </p>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Topics */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topicList.map((topic) => (
            <Link
              key={topic}
              href={`/competitive-exams/${exam}/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(topic)}`}
              className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/40">
                  <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                    {topic}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Notes & questions
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}