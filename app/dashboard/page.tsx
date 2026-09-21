import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ComponentType } from 'react'
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  TrendingUp,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { ProgressBar } from '@/components/ProgressBar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — VidyaPath',
  robots: { index: false, follow: false },
}

interface StatCardProps {
  icon: ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
}

interface ActionCardProps {
  href: string
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  gradient: string
}

export default async function DashboardPage() {
  const supabase = createServerClientWithCookies()

  // ─── 1. Auth ───
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr) {
    console.error('[dashboard] auth error:', userErr.message)
    redirect('/login?error=session')
  }

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  // ─── 2. Email confirmed ───
  const isConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at)
  if (!isConfirmed) {
    const email = user.email || ''
    redirect(
      email
        ? `/verify-email?email=${encodeURIComponent(email)}`
        : '/verify-email'
    )
  }

  // ─── 3. Profile + role ───
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profileErr) {
    console.error('[dashboard] profile query failed:', profileErr.message)
  }

  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  // ─── 4. Stats — count queries ───
  const [totalRes, completedRes, bookmarksRes] = await Promise.all([
    supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true),
    supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const totalChapters = totalRes.count ?? 0
  const completedChapters = completedRes.count ?? 0
  const bookmarksCount = bookmarksRes.count ?? 0

  const completionPercentage =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0

  // ─── 5. Display name (null-safe) ───
  // ✅ GAP B FIX: proper null guards everywhere
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const rawFirst = typeof meta.first_name === 'string' ? meta.first_name.trim() : ''
  const rawFull = typeof meta.full_name === 'string' ? meta.full_name.trim() : ''
  const emailPrefix = user.email?.split('@')[0] ?? ''
  const dbName = typeof profile?.full_name === 'string' ? profile.full_name.trim() : ''

  const displayName =
    (dbName ? dbName.split(/\s+/)[0] : '') ||
    rawFirst ||
    (rawFull ? rawFull.split(/\s+/)[0] : '') ||
    (emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : '') ||
    'User'

  const initial = (displayName.charAt(0) || 'U').toUpperCase()

  return (
    <div className="space-y-8">
      {/* WELCOME HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 md:p-8 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl md:text-3xl font-bold flex-shrink-0 border-2 border-white/30"
              role="img"
              aria-label={`Avatar for ${displayName}`}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-sm">Welcome back,</p>
              <h1 className="text-2xl md:text-3xl font-bold truncate">
                {displayName}!
              </h1>
              {user.email && (
                <p className="text-white/70 text-xs md:text-sm truncate mt-1">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-medium hover:bg-white/30 transition flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
          >
            <UserIcon className="w-4 h-4" />
            Profile
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Your Progress
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={BookOpen}
            label="Total Chapters"
            value={totalChapters}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={completedChapters}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={Bookmark}
            label="Bookmarks"
            value={bookmarksCount}
            color="from-purple-500 to-pink-500"
          />
        </div>
      </section>

      {/* PROGRESS BAR */}
      <section className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Learning Progress
          </h2>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {completionPercentage}%
          </span>
        </div>

        <ProgressBar completed={completedChapters} total={totalChapters} />

        {totalChapters === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">
            Start reading chapters to track your progress 📚
          </p>
        )}
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            href="/bookmarks"
            icon={Bookmark}
            title="My Bookmarks"
            description={
              bookmarksCount > 0
                ? `View all ${bookmarksCount} saved chapter${bookmarksCount === 1 ? '' : 's'}`
                : 'Save chapters to see them here'
            }
            gradient="from-purple-500 to-pink-500"
          />
          <ActionCard
            href="/ncert"
            icon={BookOpen}
            title="Continue Learning"
            description={
              totalChapters > 0
                ? 'Pick up where you left off'
                : 'Start exploring NCERT chapters'
            }
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
function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:shadow-lg transition">
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white mb-3 shadow-md`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
        {value.toLocaleString('en-IN')}
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
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
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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