import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Home, BookOpen, ArrowRight } from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'

const validExams = ['ssc', 'railway', 'bank']

const examDetails: Record<string, { name: string; icon: string; description: string }> = {
  ssc: {
    name: 'SSC (Staff Selection Commission)',
    icon: '📘',
    description: 'SSC CGL, CHSL, MTS, CPO – notes and practice questions in Hindi.',
  },
  railway: {
    name: 'Railway Exams (RRB)',
    icon: '🚆',
    description: 'RRB NTPC, Group D, ALP, JE – notes and practice questions in Hindi.',
  },
  bank: {
    name: 'Bank Exams (IBPS, SBI, RBI)',
    icon: '🏦',
    description: 'IBPS PO/Clerk, SBI PO/Clerk, RBI Assistant – notes and practice questions in Hindi.',
  },
}

const fallbackSubjects: Record<string, string[]> = {
  ssc: ['गणित', 'तर्क शक्ति', 'सामान्य अंग्रेजी', 'सामान्य जागरूकता'],
  railway: ['गणित', 'तर्क शक्ति', 'सामान्य विज्ञान', 'सामान्य जागरूकता'],
  bank: ['मात्रात्मक अभियोग्यता', 'तर्क शक्ति', 'अंग्रेजी भाषा', 'बैंकिंग जागरूकता', 'कंप्यूटर ज्ञान'],
}

// ==================== SEO ====================
export async function generateMetadata({
  params,
}: {
  params: { exam: string }
}): Promise<Metadata> {
  const examSlug = params.exam
  const examInfo = examDetails[examSlug]
  const examName = examInfo?.name || examSlug.toUpperCase()

  return buildMetadata({
    title: `${examName} 2026 – Syllabus, Notes, Practice Questions | VidyaPath`,
    description: `${examInfo?.description || `${examName} preparation guide`}. Free study notes, practice questions, and exam pattern for Indian students.`,
    path: `/competitive-exams/${examSlug}`,
    keywords: [
      `${examName} exam`,
      `${examName} syllabus`,
      `${examName} preparation`,
      `${examName} notes`,
      'competitive exam preparation',
    ],
  })
}

// ==================== PAGE ====================
export default async function CompetitiveExamPage({
  params,
}: {
  params: { exam: string }
}) {
  const { exam } = params
  const examInfo = examDetails[exam]

  if (!validExams.includes(exam) || !examInfo) notFound()

  const supabase = createServerClient()

  let subjects: string[] = []
  try {
    const { data } = await supabase
      .from('exam_subjects')
      .select('name')
      .eq('exam_id', exam)
      .order('name')
    if (data) subjects = data.map((s: any) => s.name)
  } catch {}

  const subjectList = subjects.length > 0 ? subjects : fallbackSubjects[exam] || []

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
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {examInfo.name}
        </span>
      </nav>

      {/* Header */}
      <header className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/40 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="text-4xl">{examInfo.icon}</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{examInfo.name}</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {examInfo.description}
              </p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Subjects */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Subjects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectList.map((subject) => (
            <Link
              key={subject}
              href={`/competitive-exams/${exam}/${encodeURIComponent(subject)}`}
              className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/40">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                {subject}
              </h3>
              <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                View topics <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>

        {subjectList.length === 0 && (
          <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              Subjects will be added soon.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}