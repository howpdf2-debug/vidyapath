import { createServerClientWithCookies } from '@/lib/supabase-server'
import {
  FileText, Users, TrendingUp, BarChart3, Eye,
  Calendar, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface DayCount {
  date: string
  count: number
}

async function getAnalyticsData() {
  try {
    const supabase = createServerClientWithCookies()
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      notesTotal, notesThisWeek, notesLastWeek,
      usersTotal, usersThisWeek, usersLastWeek,
      pdfsTotal, commentsTotal,
      recentNotes, recentUsers,
    ] = await Promise.all([
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true }),
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .lt('created_at', sevenDaysAgo.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .lt('created_at', sevenDaysAgo.toISOString()),
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true })
        .not('pdf_url', 'is', null),
      supabase.from('chapter_comments').select('*', { count: 'exact', head: true }),
      supabase.from('chapter_notes')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true }),
      supabase.from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true }),
    ])

    // Build daily counts (last 7 days)
    const last7: DayCount[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      last7.push({ date: key, count: 0 })
    }

    ;(recentNotes.data ?? []).forEach((row) => {
      const key = String(row.created_at).slice(0, 10)
      const slot = last7.find((d) => d.date === key)
      if (slot) slot.count++
    })

    const usersLast7 = last7.map((d) => ({ ...d, count: 0 }))
    ;(recentUsers.data ?? []).forEach((row) => {
      const key = String(row.created_at).slice(0, 10)
      const slot = usersLast7.find((d) => d.date === key)
      if (slot) slot.count++
    })

    return {
      ok: true,
      notes: { total: notesTotal.count ?? 0, thisWeek: notesThisWeek.count ?? 0, lastWeek: notesLastWeek.count ?? 0 },
      users: { total: usersTotal.count ?? 0, thisWeek: usersThisWeek.count ?? 0, lastWeek: usersLastWeek.count ?? 0 },
      pdfs: pdfsTotal.count ?? 0,
      comments: commentsTotal.count ?? 0,
      chartNotes: last7,
      chartUsers: usersLast7,
    }
  } catch (err) {
    console.error('[analytics]', err)
    return {
      ok: false,
      notes: { total: 0, thisWeek: 0, lastWeek: 0 },
      users: { total: 0, thisWeek: 0, lastWeek: 0 },
      pdfs: 0,
      comments: 0,
      chartNotes: [] as DayCount[],
      chartUsers: [] as DayCount[],
    }
  }
}

// Simple SVG sparkline
function Sparkline({ data, color = '#6366f1' }: { data: number[]; color?: string }) {
  if (data.length === 0) return null
  const max = Math.max(...data, 1)
  const w = 100
  const h = 30
  const step = w / Math.max(data.length - 1, 1)
  const points = data
    .map((v, i) => `${i * step},${h - (v / max) * h}`)
    .join(' ')
  const areaPoints = `0,${h} ${points} ${w},${h}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline
        points={areaPoints}
        fill={color}
        fillOpacity="0.15"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BarChart({ data }: { data: DayCount[] }) {
  if (data.length === 0) return null
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-32">
      {data.map((d) => {
        const heightPct = (d.count / max) * 100
        const day = new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' })
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="relative w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-500 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all min-h-[4px]"
                style={{ height: `${Math.max(heightPct, 4)}%` }}
                title={`${d.count} on ${d.date}`}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {day}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) {
    return <span className="text-[10px] font-semibold text-slate-400">—</span>
  }
  if (previous === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
        <ArrowUpRight className="w-3 h-3" />
        new
      </span>
    )
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct >= 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
        <ArrowUpRight className="w-3 h-3" />
        {pct}%
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
      <ArrowDownRight className="w-3 h-3" />
      {Math.abs(pct)}%
    </span>
  )
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  const cards = [
    {
      label: 'Total Notes',
      value: data.notes.total,
      delta: <DeltaBadge current={data.notes.thisWeek} previous={data.notes.lastWeek} />,
      icon: FileText,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      sparkData: data.chartNotes.map((d) => d.count),
    },
    {
      label: 'Total Users',
      value: data.users.total,
      delta: <DeltaBadge current={data.users.thisWeek} previous={data.users.lastWeek} />,
      icon: Users,
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      sparkData: data.chartUsers.map((d) => d.count),
    },
    {
      label: 'PDFs Attached',
      value: data.pdfs,
      delta: <span className="text-[10px] font-semibold text-slate-400">—</span>,
      icon: Eye,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      sparkData: data.chartNotes.map((d) => d.count),
    },
    {
      label: 'Comments',
      value: data.comments,
      delta: <span className="text-[10px] font-semibold text-slate-400">—</span>,
      icon: BarChart3,
      gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
      sparkData: data.chartUsers.map((d) => d.count),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-pink-400/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Last 7 days
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-1">Analytics</h2>
          <p className="text-white/85 text-sm">
            Content growth, user activity और engagement metrics।
          </p>
        </div>
      </div>

      {/* Metric cards with sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="relative surface-card p-4 sm:p-5 overflow-hidden group hover:shadow-lg transition-all"
            >
              <div
                className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition blur-2xl`}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {card.delta}
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
                  {card.value.toLocaleString('en-IN')}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                  {card.label}
                </p>
                {card.sparkData.length > 0 && (
                  <div className="mt-3 -mx-1">
                    <Sparkline
                      data={card.sparkData}
                      color={
                        card.gradient.includes('indigo') ? '#6366f1'
                        : card.gradient.includes('amber') ? '#f59e0b'
                        : card.gradient.includes('emerald') ? '#10b981'
                        : '#ec4899'
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Notes Created
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Last 7 days
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                {data.chartNotes.reduce((s, d) => s + d.count, 0)}
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                this week
              </p>
            </div>
          </div>
          <BarChart data={data.chartNotes} />
        </div>

        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                New Users
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Last 7 days
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {data.chartUsers.reduce((s, d) => s + d.count, 0)}
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                this week
              </p>
            </div>
          </div>
          <BarChart data={data.chartUsers} />
        </div>
      </div>

      {/* Status banner */}
      <div className="surface-card p-5 sm:p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Deep analytics आगे आएंगे
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page views tracking, PDF downloads, search queries, और user retention — Sprint 3 में।
          </p>
        </div>
      </div>
    </div>
  )
}