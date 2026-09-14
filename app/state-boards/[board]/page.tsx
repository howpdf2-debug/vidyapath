import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { LanguageToggle } from '@/components/LanguageToggle'

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: { board: string }
  searchParams: { lang?: string }
}) {
  const board = params.board
  const lang = searchParams.lang || 'english'
  const supabase = createServerClient()

  const { data: classes, error } = await supabase
    .from('state_books')
    .select('class')
    .eq('board_name', board)
    .eq('language', lang)
    .order('class', { ascending: true })

  if (error || !classes || classes.length === 0) {
    notFound()
  }

  const uniqueClasses = [...new Set(classes.map(c => c.class))]

  const boardNames: Record<string, string> = {
    up: 'UP Board',
    bihar: 'Bihar Board',
    mp: 'MP Board',
    rajasthan: 'Rajasthan Board',
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/state-boards"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Boards
          </Link>
          <h1 className="text-4xl font-bold mt-2">{boardNames[board] || board}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Choose your class – {lang === 'hindi' ? 'हिंदी' : 'English'} medium
          </p>
        </div>
        <LanguageToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueClasses.map((cls) => (
          <Link
            key={cls}
            href={`/state-boards/${board}/${cls}?lang=${lang}`}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition hover:scale-[1.02]"
          >
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Class {cls}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View subjects</p>
          </Link>
        ))}
      </div>
    </div>
  )
}