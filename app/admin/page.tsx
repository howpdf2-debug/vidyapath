import Link from 'next/link'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import {
  FileText, FileImage, Video, Users as UsersIcon,
  TrendingUp, AlertTriangle, Clock, Plus, Upload,
  BookOpen, ArrowRight, Sparkles, Activity, Zap,
  CheckCircle2, Flame,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface RecentNote {
  id: string
  topic: string
  created_at: string
  pdf_url: string | null
  ncert?: { class: number; subject: string; chapter_num: number } | null
}

async function getDashboardData() {
  try {
    const supabase = createServerClientWithCookies()

    const [notesR, pdfsR, videosR, usersR, chaptersR, recentR, noPdfR, commentsR] = await Promise.all([
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true }),
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true }).not('pdf_url', 'is', null),
      supabase.from('chapter_videos').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('ncert').select('*', { count: 'exact', head: true }),
      supabase.from('chapter_notes')
        .select('id, topic, created_at, pdf_url, ncert:ncert_id(class, subject, chapter_num)')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true }).is('pdf_url', null),
      supabase.from('chapter_comments').select('*', { count: 'exact', head: true }),
    ])

    return {
      ok: true,
      metrics: {
        notes: notesR.count ?? 0,
        pdfs: pdfsR.count ?? 0,
        videos: videosR.count ?? 0,
        users: usersR.count ?? 0,
        chapters: chaptersR.count ?? 0,
        comments: commentsR.count ?? 0,
      },
      recentNotes: (recentR.data ?? []) as unknown as RecentNote[],
      attention: { notesWithoutPdf: noPdfR.count ?? 0 },
    }
  } catch (err) {
    console.error('[admin/dashboard]', err)
    return {
      ok: false,
      metrics: { notes: 0, pdfs: 0, videos: 0, users: 0, chapters: 0, comments: 0 },
      recentNotes: [] as RecentNote[],
      attention: { notesWithoutPdf: 0 },
    }
  }
}

function timeAgo(date: string): string {
  try {
    const t = new Date(date).getTime()
    if (isNaN(t)) return ''
    const diff = Date.now() - t
    if (diff < 0) return 'just now'
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'just now'
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}h ago`
    const day = Math.floor(hr / 24)
    if (day < 30) return `${day}d ago`
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

export default async function AdminDashboard() {
  const { ok, metrics, recentNotes, attention } = await getDashboardData()

  const cards = [
    {
      label: 'Notes',
      value: metrics.notes,
      icon: FileText,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      glow: 'shadow-indigo-500/40',
      href: '/admin/notes',
      hint: 'Chapter notes',
    },
    {
      label: 'PDFs',
      value: metrics.pdfs,
      icon: FileImage,
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
      glow: 'shadow-rose-500/40',
      href: '/admin/pdfs',
      hint: 'Attached files',
    },
    {
      label: 'Videos',
      value: metrics.videos,
      icon: Video,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      glow: 'shadow-emerald-500/40',
      href: '/admin/videos',
      hint: 'YouTube links',
    },
    {
      label: 'Users',
      value: metrics.users,
      icon: UsersIcon,
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      glow: 'shadow-amber-500/40',
      href: '/admin/users',
      hint: 'Registered',
    },
  ]

  const quickActions = [
    { label: 'Add Note', href: '/admin/notes?action=new', icon: Plus, gradient: 'from-indigo-500 to-purple-600' },
    { label: 'Upload PDF', href: '/admin/notes?action=upload', icon: Upload, gradient: 'from-rose-500 to-pink-600' },
    { label: 'Add Video', href: '/admin/videos', icon: Video, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Manage Chapters', href: '/admin/ncert', icon: BookOpen, gradient: 'from-amber-500 to-orange-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Partial failure banner */}
      {!ok && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
              कुछ metrics load नहीं हो पाए
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Page refresh करें।
            </p>
          </div>
        </div>
      )}

      {/* HERO with animated blobs */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white shadow-2xl shadow-indigo-500/30">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 opacity-30 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                VidyaPath Admin
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">
                Namaste, SK 👋
              </h2>
              <p className="text-white/85 text-sm sm:text-base max-w-lg">
                आज का overview — content, users, aur engagement एक जगह।
              </p>
            </div>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-sm font-bold transition"
            >
              <TrendingUp className="w-4 h-4" />
              Full Analytics
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Inline mini stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Chapters', value: metrics.chapters, icon: BookOpen },
              { label: 'Comments', value: metrics.comments, icon: Activity },
              { label: 'PDFs', value: metrics.pdfs, icon: FileImage },
              { label: 'Users', value: metrics.users, icon: UsersIcon },
            ].map((s) => {
              const I = s.icon
              return (
                <div key={s.label} className="rounded-xl bg-white/10 backdrop-blur border border-white/15 p-3">
                  <I className="w-4 h-4 text-white/70 mb-1.5" />
                  <p className="text-2xl font-black leading-none tabular-nums">
                    {s.value.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/70 mt-1">
                    {s.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* METRIC CARDS — colorful */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group relative surface-card p-4 sm:p-5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {/* Colored glow */}
              <div
                className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${card.gradient} opacity-20 group-hover:opacity-30 transition blur-3xl`}
              />
              <div className="relative">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg ${card.glow} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
                  {card.value.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {card.hint}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent + Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </span>
                Recent Notes
              </h3>
            </div>
            <Link
              href="/admin/notes"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="py-10 text-center">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Abhi tak koi note nahi banaa
              </p>
              <Link
                href="/admin/notes?action=new"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                पहला note बनाएँ →
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentNotes.map((note) => (
                <li key={note.id}>
                  <Link
                    href="/admin/notes"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {note.topic}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {note.ncert && (
                          <span>
                            Class {note.ncert.class} • {note.ncert.subject} • Ch {note.ncert.chapter_num}
                            {' • '}
                          </span>
                        )}
                        {timeAgo(note.created_at)}
                        {note.pdf_url && ' • 📄'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Attention panel */}
        <div className="surface-card p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </span>
            Needs Attention
          </h3>

          <ul className="space-y-3">
            {attention.notesWithoutPdf > 0 ? (
              <li>
                <Link
                  href="/admin/notes"
                  className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/50 hover:shadow-md transition group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <FileImage className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {attention.notesWithoutPdf} notes बिना PDF
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      PDF attach करें students के लिए
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </Link>
              </li>
            ) : (
              <li className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/50">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  सब कुछ ठीक है ✨
                </p>
              </li>
            )}

            {/* Extras */}
            <li className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {metrics.chapters} chapters live
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Class 6–12 across boards
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="surface-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-transparent hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-800/50 dark:hover:to-slate-800/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 text-center">
                  {action.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}