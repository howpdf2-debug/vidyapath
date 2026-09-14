import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import { LanguageToggle } from '@/components/LanguageToggle'

export default async function StateBoardsPage({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const lang = searchParams.lang || 'english'
  const supabase = createServerClient()

  const { data: boards } = await supabase
    .from('state_books')
    .select('board_name')
    .eq('language', lang)
    .order('board_name')

  const uniqueBoards = [...new Set(boards?.map(b => b.board_name) || [])]

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
          <h1 className="text-4xl font-bold">📚 State Boards</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Choose your board – {lang === 'hindi' ? 'हिंदी' : 'English'} medium
          </p>
        </div>
        <LanguageToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {uniqueBoards.map((board) => (
          <Link
            key={board}
            href={`/state-boards/${board}?lang=${lang}`}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition hover:scale-[1.02]"
          >
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {boardNames[board] || board}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View classes</p>
          </Link>
        ))}
      </div>
    </div>
  )
}