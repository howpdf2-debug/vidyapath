'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  BookOpen,
  Bookmark,
  CheckCircle2,
  TrendingUp,
  User,
  ArrowRight,
} from 'lucide-react'
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
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          console.warn('[dashboard] No user:', error?.message)
          router.push('/login')
          return
        }

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

        // ✅ FIX: ncert_id (not chapter_id)
        const [bookmarksRes, progressRes] = await Promise.all([
          supabase
            .from('bookmarks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('progress')
            .select('ncert_id, completed')
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
  const completionPercentage = stats.totalChapters > 0
    ? Math.round((stats.completedChapters / stats.totalChapters) * 100)
    : 0

  // ==================== RENDER ====================
  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════ */}
      {/* WELCOME HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 md:p-8 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl md:text-3xl font-bold flex-shrink-0 border-2 border-white/30">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-sm">Welcome back,</p>
              <h1 className="text-2xl md:text-3xl font-bold truncate">
                {displayName}!
              </h1>
              <p className="text-white/70 text-xs md:text-sm truncate mt-1">
                {user.email}
              </p>
            </div>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-medium hover:bg-white/30 transition flex-shrink-0"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* STATS */}
      {/* ═══════════════════════════════════════════ */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Your Progress
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={BookOpen}
            label="Total Chapters"
            value={stats.totalChapters}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completedChapters}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={Bookmark}
            label="Bookmarks"
            value={stats.bookmarks}
            color="from-purple-500 to-pink-500"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* PROGRESS BAR */}
      {/* ═══════════════════════════════════════════ */}
      <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Learning Progress
          </h2>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {completionPercentage}%
          </span>
        </div>

        <ProgressBar
          completed={stats.completedChapters}
          total={stats.totalChapters}
        />

        {stats.totalChapters === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
            Start reading chapters to track your progress 📚
          </p>
        )}
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* QUICK ACTIONS */}
      {/* ═══════════════════════════════════════════ */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            href="/bookmarks"
            icon={Bookmark}
            title="My Bookmarks"
            description="View all your saved chapters"
            gradient="from-purple-500 to-pink-500"
          />
          <ActionCard
            href="/ncert"
            icon={BookOpen}
            title="Continue Learning"
            description="Pick up where you left off"
            gradient="from-indigo-500 to-blue-500"
          />
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:shadow-lg transition">
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white mb-3 shadow-md`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// ACTION CARD
// ═══════════════════════════════════════════
function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  gradient,
}: {
  href: string
  icon: any
  title: string
  description: string
  gradient: string
}) {
  return (
    <Link
      href={href}
      className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
          <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
            Open
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}