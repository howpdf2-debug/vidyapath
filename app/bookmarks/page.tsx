import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function BookmarksPage() {
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

  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('chapter_id, ncert!inner(class, subject, chapter_num, chapter_title)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error)
  }

  const items = bookmarks || []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📌 Your Bookmarks</h1>
      {items.length === 0 ? (
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            You haven't bookmarked any chapters yet.
          </p>
          <Link
            href="/ncert"
            className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Explore NCERT
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item: any) => (
            <Link
              key={item.chapter_id}
              href={`/ncert/${item.ncert.class}/${encodeURIComponent(item.ncert.subject)}/${item.ncert.chapter_num}`}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-5 hover:shadow-xl transition"
            >
              <h3 className="font-semibold">
                Class {item.ncert.class} {item.ncert.subject} – Chapter {item.ncert.chapter_num}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.ncert.chapter_title}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}