import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardGreeting } from '@/components/DashboardGreeting'
import type { ComponentType } from 'react'
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  TrendingUp,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  Play,
  Trophy,
  GraduationCap,
  Award,
  Target,
  Zap,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { ProgressBar } from '@/components/ProgressBar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — VidyaPath',
  robots: { index: false, follow: false },
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
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

interface ChapterInfo {
  class: number
  subject: string
  chapter_num: number
  chapter_title: string | null
  language: string | null
}

interface ProgressRow {
  ncert_id: number
  completed: boolean | null
  last_accessed: string | null
  ncert: ChapterInfo[] | null
}

interface BookmarkRow {
  id: number
  ncert_id: number
  created_at: string | null
  ncert: ChapterInfo[] | null
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function subjectToSlug(subject: string): string {
  return subject.trim().toLowerCase().replace(/\s+/g, '-')
}

function chapterHref(
  cls: number,
  subject: string,
  chapterNum: number,
  language: string | null
): string {
  const lang = language === 'hi' ? 'hi' : 'en'
  return `/ncert/${cls}/${subjectToSlug(subject)}/${chapterNum}?lang=${lang}`
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════
export default async function DashboardPage() {
  const supabase = await createServerClientWithCookies()

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

  // ─── 4. Stats + recent activity — all parallel ───
  const [
    totalRes,
    completedRes,
    bookmarksRes,
    recentProgressRes,
    recentBookmarksRes,
  ] = await Promise.all([
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

    supabase
      .from('progress')
      .select(
        `
        ncert_id,
        completed,
        last_accessed,
        ncert:ncert_id (class, subject, chapter_num, chapter_title, language)
      `
      )
      .eq('user_id', user.id)
      .order('last_accessed', { ascending: false, nullsFirst: false })
      .limit(3),

    supabase
      .from('bookmarks')
      .select(
        `
        id,
        ncert_id,
        created_at,
        ncert:ncert_id (class, subject, chapter_num, chapter_title, language)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(6),
  ])

  if (recentProgressRes.error) {
    console.error(
      '[dashboard] recent progress failed:',
      recentProgressRes.error.message
    )
  }
  if (recentBookmarksRes.error) {
    console.error(
      '[dashboard] recent bookmarks failed:',
      recentBookmarksRes.error.message
    )
  }

  const totalChapters = totalRes.count ?? 0
  const completedChapters = completedRes.count ?? 0
  const bookmarksCount = bookmarksRes.count ?? 0
  const recentProgress = (recentProgressRes.data ?? []) as ProgressRow[]
  const recentBookmarks = (recentBookmarksRes.data ?? []) as BookmarkRow[]

  const completionPercentage =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0

  const xpPoints = completedChapters * 10

  // ─── 5. Display name (null-safe) ───
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const rawFirst =
    typeof meta.first_name === 'string' ? meta.first_name.trim() : ''
  const rawFull =
    typeof meta.full_name === 'string' ? meta.full_name.trim() : ''
  const emailPrefix = user.email?.split('@')[0] ?? ''
  const dbName =
    typeof profile?.full_name === 'string' ? profile.full_name.trim() : ''

  const displayName =
    (dbName ? dbName.split(/\s+/)[0] : '') ||
    rawFirst ||
    (rawFull ? rawFull.split(/\s+/)[0] : '') ||
    (emailPrefix
      ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
      : '') ||
    'User'

  const initial = (displayName.charAt(0) || 'U').toUpperCase()

  return (
    <div className="space-y-8 pb-16">
      {/* ═══════ WELCOME HERO ═══════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 md:p-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-fuchsia-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl md:text-3xl font-bold flex-shrink-0 border-2 border-white/30"
              role="img"
              aria-label={`Avatar for ${displayName}`}
            >
              {initial}
            </div>
            {/* ✅ FIX G1: Time-based greeting — client component, no hydration mismatch */}
            <DashboardGreeting
              name={displayName}
              email={user.email ?? undefined}
            />
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-medium hover:bg-white/30 transition flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
          >
            <UserIcon className="w-4 h-4" />
            Profile
          </Link>
        </div>

        {/* Quick CTAs */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-5">
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold text-sm shadow-lg hover:bg-white/95 hover:scale-[1.02] transition"
          >
            <BookOpen className="w-4 h-4" />
            Continue Learning
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/25 rounded-xl font-semibold text-sm hover:bg-white/25 transition"
          >
            <FileText className="w-4 h-4" />
            Study Notes
          </Link>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section>
        <SectionHeader
          icon={TrendingUp}
          title="Your Progress"
          subtitle="At a glance"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
            color="from-emerald-500 to-green-500"
          />
          <StatCard
            icon={Bookmark}
            label="Bookmarks"
            value={bookmarksCount}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={Zap}
            label="XP Points"
            value={xpPoints}
            color="from-amber-500 to-orange-500"
          />
        </div>
      </section>

      {/* ═══════ PROGRESS BAR ═══════ */}
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

      {/* ═══════ CONTINUE LEARNING ═══════ */}
      {recentProgress.length > 0 && (
        <section>
          <SectionHeader
            icon={Play}
            title="Continue Learning"
            subtitle="Wahin se shuru karo jahan chhoda tha"
            href="/ncert"
            hrefLabel="Browse all"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentProgress.map((p) => (
              <ContinueCard key={p.ncert_id} progress={p} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════ RECENT BOOKMARKS ═══════ */}
      <section>
        <SectionHeader
          icon={Bookmark}
          title="Recent Bookmarks"
          subtitle="Saved chapters"
          href="/bookmarks"
          hrefLabel="View all"
        />
        {recentBookmarks.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Abhi tak koi bookmark nahi"
            desc="Chapter kholo aur bookmark button dabao — yahan dikhega"
            ctaLabel="Browse NCERT"
            ctaHref="/ncert"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentBookmarks.map((b) => (
              <BookmarkCard key={b.id} bookmark={b} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════ QUICK ACTIONS ═══════ */}
      <section>
        <SectionHeader
          icon={Sparkles}
          title="Quick Actions"
          subtitle="Jump to your favourites"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            href="/bookmarks"
            icon={Bookmark}
            title="My Bookmarks"
            description={
              bookmarksCount > 0
                ? `View all ${bookmarksCount} saved chapter${
                    bookmarksCount === 1 ? '' : 's'
                  }`
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

      {/* ═══════ EXPLORE CLASSES ═══════ */}
      <section>
        <SectionHeader
          icon={GraduationCap}
          title="Explore Classes"
          subtitle="Class 6 se 12 tak"
        />
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[6, 7, 8, 9, 10, 11, 12].map((cls) => (
            <Link
              key={cls}
              href={`/ncert/${cls}`}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 text-center hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-black text-base sm:text-lg mb-2 group-hover:scale-110 transition">
                {cls}
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                Class {cls}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ ACHIEVEMENTS ═══════ */}
      <section>
        <SectionHeader
          icon={Award}
          title="Achievements"
          subtitle="Unlock badges as you learn"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Badge
            name="First Step"
            desc="Complete 1 chapter"
            unlocked={completedChapters >= 1}
            icon={Target}
          />
          <Badge
            name="Curious Mind"
            desc="Complete 5 chapters"
            unlocked={completedChapters >= 5}
            icon={Sparkles}
          />
          <Badge
            name="Bookworm"
            desc="Save 10 bookmarks"
            unlocked={bookmarksCount >= 10}
            icon={BookOpen}
          />
          <Badge
            name="Dedicated"
            desc="Complete 25 chapters"
            unlocked={completedChapters >= 25}
            icon={Trophy}
          />
        </div>
      </section>

      {/* ═══════ QUICK LINKS ═══════ */}
      <section>
        <SectionHeader
          icon={Sparkles}
          title="Quick Links"
          subtitle="Explore VidyaPath"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickLink
            href="/notes"
            label="Notes"
            icon={FileText}
            gradient="from-emerald-500 to-teal-500"
          />
          <QuickLink
            href="/results"
            label="Results"
            icon={TrendingUp}
            gradient="from-sky-500 to-blue-500"
          />
          <QuickLink
            href="/rojgar-samachar"
            label="Rojgar"
            icon={FileText}
            gradient="from-amber-500 to-orange-500"
          />
          <QuickLink
            href="/state-boards"
            label="Boards"
            icon={GraduationCap}
            gradient="from-violet-500 to-purple-500"
          />
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  href,
  hrefLabel,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  href?: string
  hrefLabel?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {href && hrefLabel && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1"
        >
          {hrefLabel}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-5 hover:shadow-lg transition-all">
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`}
      />
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
        {value.toLocaleString('en-IN')}
      </div>
      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
        {label}
      </div>
    </div>
  )
}

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
      className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition`}
        >
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
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

function ContinueCard({ progress }: { progress: ProgressRow }) {
  const chapter = progress.ncert?.[0] ?? null
  if (!chapter) return null

  const isCompleted = progress.completed === true

  return (
    <Link
      href={chapterHref(
        chapter.class,
        chapter.subject,
        chapter.chapter_num,
        chapter.language
      )}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white hover:shadow-xl hover:-translate-y-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
            Class {chapter.class}
          </span>
          <Play
            className="w-5 h-5 fill-current opacity-80 group-hover:scale-110 transition"
            aria-hidden="true"
          />
        </div>
        <p className="text-xs text-white/80 mb-0.5 truncate">
          {chapter.subject} · Ch {chapter.chapter_num}
        </p>
        <p className="font-bold text-sm leading-tight line-clamp-2 mb-3">
          {chapter.chapter_title || `Chapter ${chapter.chapter_num}`}
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold">
          {isCompleted ? 'Review' : 'Resume'}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
        </span>
      </div>
    </Link>
  )
}

function BookmarkCard({ bookmark }: { bookmark: BookmarkRow }) {
  const chapter = bookmark.ncert?.[0] ?? null
  if (!chapter) return null

  return (
    <Link
      href={chapterHref(
        chapter.class,
        chapter.subject,
        chapter.chapter_num,
        chapter.language
      )}
      className="group rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="flex items-start gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex-shrink-0">
          <BookOpen className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold truncate">
            Class {chapter.class} · {chapter.subject}
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 mt-0.5">
            {chapter.chapter_title || `Chapter ${chapter.chapter_num}`}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1.5 group-hover:gap-2 transition-all">
            Open
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function Badge({
  name,
  desc,
  unlocked,
  icon: Icon,
}: {
  name: string
  desc: string
  unlocked: boolean
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 text-center transition ${
        unlocked
          ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-amber-200 dark:border-amber-800'
          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
      }`}
    >
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
          unlocked
            ? 'bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-lg'
            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
        }`}
      >
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <p className="text-xs font-bold text-slate-900 dark:text-white">
        {name}
      </p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
        {desc}
      </p>
      {unlocked && (
        <span
          className="absolute top-2 right-2 text-[10px] font-bold text-amber-600 dark:text-amber-400"
          aria-label="Unlocked"
        >
          ✓
        </span>
      )}
    </div>
  )
}

function QuickLink({
  href,
  label,
  icon: Icon,
  gradient,
}: {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  gradient: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div
        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} text-white flex-shrink-0 group-hover:scale-110 transition`}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
        {label}
      </span>
    </Link>
  )
}

function EmptyState({
  icon: Icon,
  title,
  desc,
  ctaLabel,
  ctaHref,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  desc: string
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
        <Icon className="w-7 h-7 text-slate-400" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
        {desc}
      </p>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        {ctaLabel}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}