import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ProgressBar } from '@/components/ProgressBar'

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')

  // ✅ Block unverified users (with email null check)
  if (!session.user.confirmed_at) {
    const email = session.user.email
    if (email) {
      redirect(`/verify-email?email=${encodeURIComponent(email)}`)
    } else {
      redirect('/verify-email')
    }
  }

  const user = session.user

  // Fetch bookmarks count
  const { count: bookmarksCount } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch progress
  const { data: progress } = await supabase
    .from('progress')
    .select('chapter_id, completed')
    .eq('user_id', user.id)

  const totalChapters = progress?.length || 0
  const completedChapters = progress?.filter((p) => p.completed).length || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
          {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {user.user_metadata?.full_name || 'User'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatBox number={totalChapters} label="Total Chapters" icon="📚" />
        <StatBox number={completedChapters} label="Completed" icon="✅" />
        <StatBox number={bookmarksCount || 0} label="Bookmarks" icon="🔖" />
      </div>

      <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <ProgressBar completed={completedChapters} total={totalChapters} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/bookmarks"
          className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
        >
          <h2 className="text-xl font-bold">📌 My Bookmarks</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            View all your saved chapters
          </p>
        </Link>
        <Link
          href="/ncert"
          className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
        >
          <h2 className="text-xl font-bold">📖 Continue Learning</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Pick up where you left off
          </p>
        </Link>
      </div>
    </div>
  )
}

function StatBox({ number, label, icon }: { number: number; label: string; icon: string }) {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 text-center">
      <div className="text-3xl">{icon}</div>
      <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{number}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  )
}