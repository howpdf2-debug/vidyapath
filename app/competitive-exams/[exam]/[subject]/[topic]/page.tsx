import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, HelpCircle, ChevronRight } from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'

interface Question {
  id?: number
  question: string
  options: Record<string, string>
  correct_answer: string
  explanation?: string
  difficulty?: string
}

const validExams = ['ssc', 'railway', 'bank']

const examLabels: Record<string, string> = {
  ssc: 'SSC',
  railway: 'Railway',
  bank: 'Bank',
}

const fallbackContent: Record<string, { notes: string; questions: Question[] }> = {
  'बीजगणित': {
    notes: '<p><strong>बीजगणित (Algebra) – महत्वपूर्ण सूत्र</strong></p><p>1. (a+b)² = a² + 2ab + b²</p><p>2. (a-b)² = a² - 2ab + b²</p><p>3. a² - b² = (a-b)(a+b)</p><p>4. (a+b)³ = a³ + 3a²b + 3ab² + b³</p>',
    questions: [
      {
        question: 'यदि x + y = 5 और xy = 6, तो x² + y² का मान क्या होगा?',
        options: { A: '11', B: '13', C: '15', D: '17' },
        correct_answer: 'B',
      },
      {
        question: 'यदि a - b = 3 और ab = 4, तो a² + b² = ?',
        options: { A: '15', B: '17', C: '19', D: '21' },
        correct_answer: 'B',
      },
    ],
  },
}

// ==================== SEO ====================
export async function generateMetadata({
  params,
}: {
  params: { exam: string; subject: string; topic: string }
}): Promise<Metadata> {
  const examSlug = params.exam
  const examLabel = examLabels[examSlug] || examSlug.toUpperCase()
  const subjectName = decodeURIComponent(params.subject)
  const topicName = decodeURIComponent(params.topic)

  return buildMetadata({
    title: `${topicName} – ${examLabel} ${subjectName} Notes | VidyaPath`,
    description: `Complete study notes on ${topicName} for ${examLabel} ${subjectName}. Free notes, examples, and practice questions.`,
    path: `/competitive-exams/${params.exam}/${params.subject}/${params.topic}`,
    keywords: [
      topicName,
      `${examLabel} ${topicName}`,
      `${subjectName} ${topicName}`,
      `${examLabel} practice questions`,
    ],
  })
}

// ==================== PAGE ====================
export default async function CompetitiveTopicPage({
  params,
}: {
  params: { exam: string; subject: string; topic: string }
}) {
  const { exam, subject, topic } = params
  const decodedSubject = decodeURIComponent(subject)
  const decodedTopic = decodeURIComponent(topic)

  if (!validExams.includes(exam)) notFound()

  const supabase = createServerClient()

  let notesContent = ''
  let questions: Question[] = []
  let dbFound = false

  try {
    const { data: noteData } = await supabase
      .from('exam_notes')
      .select('content_html')
      .eq('topic_slug', topic)
      .maybeSingle()
    if (noteData) {
      notesContent = noteData.content_html
      dbFound = true
    }

    const { data: qData } = await supabase
      .from('exam_questions')
      .select('question, options, correct_answer, explanation, difficulty')
      .eq('topic_slug', topic)
    if (qData) {
      questions = qData.map((q: any) => ({
        question: q.question,
        options: q.options || { A: '', B: '', C: '', D: '' },
        correct_answer: q.correct_answer || '',
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
      }))
      dbFound = true
    }
  } catch {}

  if (!dbFound) {
    const fallback = fallbackContent[decodedTopic]
    if (fallback) {
      notesContent = fallback.notes
      questions = fallback.questions
    } else {
      notesContent = '<p>Notes for this topic will be added soon.</p>'
      questions = []
    }
  }

  const examLabel = examLabels[exam] || exam.toUpperCase()

  return (
    <div className="space-y-6">
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
        <Link
          href={`/competitive-exams/${exam}/${encodeURIComponent(decodedSubject)}`}
          className="hover:text-indigo-600"
        >
          {decodedSubject}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {decodedTopic}
        </span>
      </nav>

      {/* Back */}
      <Link
        href={`/competitive-exams/${exam}/${encodeURIComponent(decodedSubject)}`}
        className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to topics
      </Link>

      {/* Header */}
      <header className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/40 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {examLabel} • {decodedSubject}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">{decodedTopic}</h1>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Notes */}
      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4">
          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Study Notes
        </div>
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: notesContent }}
        />
      </section>

      {/* Questions */}
      {questions.length > 0 && (
        <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
          <div className="flex items-center gap-2 text-lg font-semibold mb-4">
            <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Practice Questions ({questions.length})
          </div>
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
              >
                <p className="font-medium text-base">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-xs font-bold mr-2">
                    {idx + 1}
                  </span>
                  {q.question}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  {Object.entries(q.options).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="font-semibold">{key}.</span> {value}
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-3 text-green-600 dark:text-green-400 font-medium">
                  ✅ Correct Answer: {q.correct_answer}
                </p>
                {q.explanation && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {questions.length === 0 && (
        <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Practice questions will be added soon.
          </p>
        </div>
      )}
    </div>
  )
}