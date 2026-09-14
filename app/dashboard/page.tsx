'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ProgressBar } from '@/components/ProgressBar'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    bookmarks: 0,
    totalChapters: 0,
    completedChapters: 0,
  })

  useEffect(() => {
    const load = async () => {
      try {
        // ✅ Client-side — reads session from localStorage
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          console.warn('[dashboard] No user:', error?.message)
          router.push('/login')
          return
        }

        // ✅ Check email verification
        const isConfirmed = Boolean(
          user.email_confirmed_at || user.confirmed_at
        )

        if (!isConfirmed) {
          const email = user.email
          if (email) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`)
          } else {
            router.push('/verify-email')
          }
          return
        }

        setUser(user)

        // Fetch stats in parallel
        const [bookmarksRes, progressRes] = await Promise.all([
          supabase
            .from('bookmarks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('progress')
            .select('chapter_id, completed')
            .eq('user_id', user.id),
        ])

        const totalChapters = progressRes.data?.length || 0
        const completedChapters =
          progressRes.data?.filter((p) => p.completed).length || 0

        setStats({
          bookmarks: bookmarksRes.count || 0,
          totalChapters,
          completedChapters,
        })

        setLoading(false)
      } catch (err) {
        console.error('[dashboard] Error:', err)
        router.push('/login')
      }
    }

    load()
  }, [router])

  // ==================== LOADING ====================
  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  // ==================== HELPERS ====================
  const getDisplayName = (): string => {
    if (!user) return 'User'
    const firstName = user.user_metadata?.first_name?.trim()
    if (firstName) return firstName
    const fullName = user.user_metadata?.full_name?.trim()
    if (fullName) return fullName.split(/\s+/)[0] || fullName
    const emailPrefix = user.email?.split('@')[0]
    if (emailPrefix) {
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    }
    return 'User'
  }

  const getInitial = (): string => {
    return getDisplayName().charAt(0).toUpperCase() || 'U'
  }

  const displayName = getDisplayName()
  const initial = getInitial()

  // ==================== RENDER ====================
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold truncate">
            Welcome, {displayName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
            {user.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatBox
          number={stats.totalChapters}
          label="Total Chapters"
          icon="📚"
        />
        <StatBox
          number={stats.completedChapters}
          label="Completed"
          icon="✅"
        />
        <StatBox
          number={stats.bookmarks}
          label="Bookmarks"
          icon="🔖"
        />
      </div>

      {/* Progress */}
      <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <ProgressBar
          completed={stats.completedChapters}
          total={stats.totalChapters}
        />
      </div>

      {/* Quick Links */}
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

      {/* Profile link */}
      <div className="text-center">
        <Link
          href="/profile"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Edit your profile →
        </Link>
      </div>
    </div>
  )
}

// ==================== STAT BOX ====================
function StatBox({
  number,
  label,
  icon,
}: {
  number: number
  label: string
  icon: string
}) {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 text-center">
      <div className="text-3xl">{icon}</div>
      <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
        {number}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  )
}