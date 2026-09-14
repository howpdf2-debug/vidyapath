import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { LanguageToggle } from '@/components/LanguageToggle'

export default async function BoardClassPage({
  params,
  searchParams,
}: {
  params: { board: string; class: string }
  searchParams: { lang?: string }
}) {
  const board = params.board
  const classNum = parseInt(params.class)
  const lang = searchParams.lang || 'english'
  const supabase = createServerClient()

  const { data: subjects, error } = await supabase
    .from('state_books')
    .select('subject')
    .eq('board_name', board)
    .eq('class', classNum)
    .eq('language', lang)
    .order('subject')

  if (error || !subjects || subjects.length === 0) {
    notFound()
  }

  const uniqueSubjects = [...new Set(subjects.map(s => s.subject))]

  const boardNames: Record<string, string> = {
    up: 'UP Board',
    bihar: 'Bihar Board',
    mp: 'MP Board',
    rajasthan: 'Rajasthan Board',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/state-boards/${board}?lang=${lang}`}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Classes
          </Link>
          <h1 className="text-3xl font-bold mt-2">
            {boardNames[board]} Class {classNum}
          </h1>
        </div>
        <LanguageToggle />
      </div>
      <p className="text-gray-500 dark:text-gray-400">
        Select a subject to view/download the book.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uniqueSubjects.map((subject) => (
          <div
            key={subject}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-5 hover:shadow-xl transition"
          >
            <h3 className="text-lg font-semibold">{subject}</h3>
            <Link
              href={`/state-boards/${board}/${classNum}/${encodeURIComponent(subject)}?lang=${lang}`}
              className="inline-block mt-3 text-sm text-indigo-600 hover:underline"
            >
              View Book →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}