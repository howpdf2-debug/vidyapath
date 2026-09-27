import { createServerClientWithCookies } from '@/lib/supabase-server'
import Link from 'next/link'
import {
  FileText,
  Users,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Download,
  Layers,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
interface DayCount {
  date: string
  count: number
}

interface ClassCoverage {
  cls: number
  chapters: number
  withNotes: number
  withPdfs: number
}

interface LevelDist {
  level: 'basic' | 'advance' | 'pro'
  notes: number
  pdfs: number
}

interface RecentItem {
  kind: 'note' | 'pdf'
  topic: string
  level: string
  classNum: number
  subject: string
  chapterNum: number
  createdAt: string
}

// ═══════════════════════════════════════════════════════════════
// Data
// ═══════════════════════════════════════════════════════════════
async function getAnalyticsData() {
  try {
    const supabase = createServerClientWithCookies()
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      notesTotalRes,
      notesThisWeekRes,
      notesLastWeekRes,
      usersTotalRes,
      usersThisWeekRes,
      usersLastWeekRes,
      chapterPdfsTotalRes,
      chapterPdfsThisWeekRes,
      commentsTotalRes,
      bookmarksTotalRes,
      recentNotesRes,
      recentUsersRes,
      recentPdfsRes,
      allChaptersRes,
      notesByNcertRes,
      pdfsByNcertRes,
      notesByLevelRes,
      pdfsByLevelRes,
    ] = await Promise.all([
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true }),
      supabase
        .from('chapter_notes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString()),
      supabase
        .from('chapter_notes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString()),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString()),
      // ─── Chapter PDFs total ───
      supabase
        .from('chapter_level_pdfs')
        .select('*', { count: 'exact', head: true }),
      // ─── Chapter PDFs this week — uses uploaded_at (column exists) ───
      supabase
        .from('chapter_level_pdfs')
        .select('*', { count: 'exact', head: true })
        .gte('uploaded_at', sevenDaysAgo.toISOString()),
      // ─── Other counts ───
      supabase
        .from('chapter_comments')
        .select('*', { count: 'exact', head: true }),
      supabase.from('bookmarks').select('*', { count: 'exact', head: true }),
      // ─── Chart data (last 7 days) ───
      supabase
        .from('chapter_notes')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true }),
      supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true }),
      // ─── Recent PDFs ───
      supabase
        .from('chapter_level_pdfs')
        .select('level, ncert_id, uploaded_at')
        .order('uploaded_at', { ascending: false })
        .limit(10),
      // ─── All chapters ───
      supabase
        .from('ncert')
        .select('id, class, subject, chapter_num, chapter_title, language')
        .order('class')
        .order('subject')
        .order('chapter_num'),
      // ─── Notes per chapter (published only) ───
      supabase
        .from('chapter_notes')
        .select('ncert_id, level, topic, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false }),
      // ─── PDFs per chapter ───
      supabase.from('chapter_level_pdfs').select('ncert_id, level'),
      // ─── Notes by level (published only) ───
      supabase
        .from('chapter_notes')
        .select('level')
        .eq('status', 'published'),
      // ─── PDFs by level ───
      supabase.from('chapter_level_pdfs').select('level'),
    ])

    const notesTotal = notesTotalRes.count ?? 0
    const notesThisWeek = notesThisWeekRes.count ?? 0
    const notesLastWeek = notesLastWeekRes.count ?? 0
    const usersTotal = usersTotalRes.count ?? 0
    const usersThisWeek = usersThisWeekRes.count ?? 0
    const usersLastWeek = usersLastWeekRes.count ?? 0
    const chapterPdfsTotal = chapterPdfsTotalRes.count ?? 0
    const chapterPdfsThisWeek = chapterPdfsThisWeekRes.count ?? 0
    const commentsTotal = commentsTotalRes.count ?? 0
    const bookmarksTotal = bookmarksTotalRes.count ?? 0

    // ─── Build daily counts (last 7 days) ───
    const last7: DayCount[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      last7.push({ date: key, count: 0 })
    }

    ;(recentNotesRes.data ?? []).forEach((row) => {
      const key = String(row.created_at).slice(0, 10)
      const slot = last7.find((d) => d.date === key)
      if (slot) slot.count++
    })

    const usersLast7 = last7.map((d) => ({ ...d, count: 0 }))
    ;(recentUsersRes.data ?? []).forEach((row) => {
      const key = String(row.created_at).slice(0, 10)
      const slot = usersLast7.find((d) => d.date === key)
      if (slot) slot.count++
    })

    // ─── Chapters ───
    const chapters = (allChaptersRes.data ?? []) as {
      id: number
      class: number
      subject: string
      chapter_num: number
      chapter_title: string | null
      language: string
    }[]

    const chaptersByIdMap = new Map(chapters.map((c) => [c.id, c]))

    // ─── Chapter IDs with notes (published) ───
    const notesByNcert = new Map<number, number>()
    ;(notesByNcertRes.data ?? []).forEach((row: any) => {
      notesByNcert.set(row.ncert_id, (notesByNcert.get(row.ncert_id) ?? 0) + 1)
    })

    // ─── Chapter IDs with PDFs ───
    const pdfsByNcert = new Map<number, number>()
    ;(pdfsByNcertRes.data ?? []).forEach((row: any) => {
      pdfsByNcert.set(row.ncert_id, (pdfsByNcert.get(row.ncert_id) ?? 0) + 1)
    })

    // ─── Union of chapters with EITHER notes OR PDFs ───
    const chaptersWithContentSet = new Set<number>()
    for (const ch of chapters) {
      if (notesByNcert.has(ch.id) || pdfsByNcert.has(ch.id)) {
        chaptersWithContentSet.add(ch.id)
      }
    }
    const chaptersWithAnyContentTotal = chaptersWithContentSet.size

    // ─── Class-wise coverage ───
    const classMap = new Map<number, ClassCoverage>()
    for (const ch of chapters) {
      const entry = classMap.get(ch.class) ?? {
        cls: ch.class,
        chapters: 0,
        withNotes: 0,
        withPdfs: 0,
      }
      entry.chapters++
      if (notesByNcert.has(ch.id)) entry.withNotes++
      if (pdfsByNcert.has(ch.id)) entry.withPdfs++
      classMap.set(ch.class, entry)
    }
    const classCoverage = [...classMap.values()].sort((a, b) => a.cls - b.cls)

    // ─── All gaps (single source of truth) ───
    const allGaps = chapters.filter(
      (ch) => !notesByNcert.has(ch.id) && !pdfsByNcert.has(ch.id)
    )

    // ─── Level distribution ───
    const levelDistMap = new Map<
      'basic' | 'advance' | 'pro',
      { notes: number; pdfs: number }
    >([
      ['basic', { notes: 0, pdfs: 0 }],
      ['advance', { notes: 0, pdfs: 0 }],
      ['pro', { notes: 0, pdfs: 0 }],
    ])
    ;(notesByLevelRes.data ?? []).forEach((row: any) => {
      const lvl = row.level as 'basic' | 'advance' | 'pro'
      if (levelDistMap.has(lvl)) {
        levelDistMap.get(lvl)!.notes++
      }
    })
    ;(pdfsByLevelRes.data ?? []).forEach((row: any) => {
      const lvl = row.level as 'basic' | 'advance' | 'pro'
      if (levelDistMap.has(lvl)) {
        levelDistMap.get(lvl)!.pdfs++
      }
    })
    const levelDist: LevelDist[] = [...levelDistMap.entries()].map(
      ([level, v]) => ({ level, ...v })
    )

    // ─── Recent activity (notes + PDFs mixed) ───
    const recentActivity: RecentItem[] = []

    // Recent published notes (top 10 with topic)
    const recentNotesWithTopic = ((notesByNcertRes.data ?? []) as any[])
      .filter((r) => r.topic)
      .slice(0, 10)
    for (const n of recentNotesWithTopic) {
      const ch = chaptersByIdMap.get(n.ncert_id)
      if (!ch) continue
      recentActivity.push({
        kind: 'note',
        topic: n.topic,
        level: n.level,
        classNum: ch.class,
        subject: ch.subject,
        chapterNum: ch.chapter_num,
        createdAt: n.created_at,
      })
    }

    // Recent PDFs
    for (const p of (recentPdfsRes.data ?? []) as any[]) {
      const ch = chaptersByIdMap.get(p.ncert_id)
      if (!ch) continue
      recentActivity.push({
        kind: 'pdf',
        topic: ch.chapter_title ?? `Chapter ${ch.chapter_num}`,
        level: p.level,
        classNum: ch.class,
        subject: ch.subject,
        chapterNum: ch.chapter_num,
        createdAt: p.uploaded_at,
      })
    }

    // Sort descending, take top 8
    recentActivity.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    const finalRecent = recentActivity.slice(0, 8)

    return {
      ok: true,
      notes: {
        total: notesTotal,
        thisWeek: notesThisWeek,
        lastWeek: notesLastWeek,
      },
      users: {
        total: usersTotal,
        thisWeek: usersThisWeek,
        lastWeek: usersLastWeek,
      },
      pdfs: { total: chapterPdfsTotal, thisWeek: chapterPdfsThisWeek },
      comments: commentsTotal,
      bookmarks: bookmarksTotal,
      chartNotes: last7,
      chartUsers: usersLast7,
      classCoverage,
      levelDist,
      gaps: allGaps.slice(0, 15), // display only
      allGapsCount: allGaps.length, // total for stats
      chaptersWithAnyContentTotal,
      totalChapters: chapters.length,
      recent: finalRecent,
    }
  } catch (err) {
    console.error('[analytics]', err)
    return {
      ok: false,
      notes: { total: 0, thisWeek: 0, lastWeek: 0 },
      users: { total: 0, thisWeek: 0, lastWeek: 0 },
      pdfs: { total: 0, thisWeek: 0 },
      comments: 0,
      bookmarks: 0,
      chartNotes: [] as DayCount[],
      chartUsers: [] as DayCount[],
      classCoverage: [] as ClassCoverage[],
      levelDist: [] as LevelDist[],
      gaps: [] as any[],
      allGapsCount: 0,
      chaptersWithAnyContentTotal: 0,
      totalChapters: 0,
      recent: [] as RecentItem[],
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Small components
// ═══════════════════════════════════════════════════════════════
function Sparkline({
  data,
  color = '#6366f1',
}: {
  data: number[]
  color?: string
}) {
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
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-8"
      preserveAspectRatio="none"
    >
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
        const day = new Date(d.date).toLocaleDateString('en-IN', {
          weekday: 'short',
        })
        return (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center gap-1.5 group"
          >
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

function DeltaBadge({
  current,
  previous,
}: {
  current: number
  previous: number
}) {
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

const LEVEL_META = {
  basic: { emoji: '🟢', label: 'Basic', bar: 'bg-emerald-500' },
  advance: { emoji: '🟠', label: 'Advance', bar: 'bg-amber-500' },
  pro: { emoji: '🔴', label: 'Pro', bar: 'bg-rose-500' },
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════
export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  // ─── Coverage % (uses union count) ───
  const chaptersWithAnyContent = data.chaptersWithAnyContentTotal
  const rawPct =
    data.totalChapters > 0
      ? (chaptersWithAnyContent / data.totalChapters) * 100
      : 0
  const coveragePct = Math.round(rawPct)
  const coveragePctLabel =
    rawPct > 0 && rawPct < 1 ? '<1' : String(coveragePct)

  // ─── Level totals (guard division) ───
  const totalLevelNotes = data.levelDist.reduce((s, d) => s + d.notes, 0) || 1
  const totalLevelPdfs = data.levelDist.reduce((s, d) => s + d.pdfs, 0) || 1

  const cards = [
    {
      label: 'Total Notes',
      value: data.notes.total,
      delta: (
        <DeltaBadge
          current={data.notes.thisWeek}
          previous={data.notes.lastWeek}
        />
      ),
      icon: FileText,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      sparkData: data.chartNotes.map((d) => d.count),
      sparkColor: '#6366f1',
    },
    {
      label: 'Total Users',
      value: data.users.total,
      delta: (
        <DeltaBadge
          current={data.users.thisWeek}
          previous={data.users.lastWeek}
        />
      ),
      icon: Users,
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      sparkData: data.chartUsers.map((d) => d.count),
      sparkColor: '#f59e0b',
    },
    {
      label: 'Chapter PDFs',
      value: data.pdfs.total,
      delta:
        data.pdfs.thisWeek > 0 ? (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            +{data.pdfs.thisWeek} this week
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400">
            no new
          </span>
        ),
      icon: Download,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      sparkData: data.chartNotes.map((d) => d.count),
      sparkColor: '#10b981',
    },
    {
      label: 'Bookmarks',
      value: data.bookmarks,
      delta: (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400">
          {data.comments} comments
        </span>
      ),
      icon: BarChart3,
      gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
      sparkData: data.chartUsers.map((d) => d.count),
      sparkColor: '#ec4899',
    },
  ]

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
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
            Content growth, user activity aur engagement metrics.
          </p>
        </div>
      </div>

      {/* ─── Metric cards ─── */}
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
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-5 h-5 text-white" aria-hidden="true" />
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
                    <Sparkline data={card.sparkData} color={card.sparkColor} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Coverage overview ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Chapters
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {data.totalChapters}
          </p>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2
              className="w-4 h-4 text-emerald-500"
              aria-hidden="true"
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Content Coverage
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {coveragePctLabel}%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              {chaptersWithAnyContent} of {data.totalChapters} chapters
            </p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
              style={{
                // Uses rawPct (not rounded) so bar visible at 0.2%
                width: `${rawPct > 0 ? Math.max(rawPct, 2) : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle
              className="w-4 h-4 text-amber-500"
              aria-hidden="true"
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Missing Content
            </span>
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {data.allGapsCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Chapters bina notes ya PDF ke
          </p>
        </div>
      </div>

      {/* ─── Class-wise coverage ─── */}
      {data.classCoverage.length > 0 && (
        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Layers className="w-5 h-5 text-indigo-500" aria-hidden="true" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Class-wise Coverage
            </h3>
          </div>
          <div className="space-y-3">
            {data.classCoverage.map((c) => {
              const notesPct =
                c.chapters > 0 ? (c.withNotes / c.chapters) * 100 : 0
              const pdfsPct =
                c.chapters > 0 ? (c.withPdfs / c.chapters) * 100 : 0
              return (
                <div key={c.cls} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Class {c.cls}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {c.chapters} chapters • 📝 {c.withNotes} • 📥 {c.withPdfs}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                        style={{
                          width: `${c.withNotes > 0 ? Math.max(notesPct, 2) : 0}%`,
                        }}
                        title={`Notes: ${notesPct.toFixed(1)}% (${c.withNotes}/${c.chapters})`}
                      />
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                        style={{
                          width: `${c.withPdfs > 0 ? Math.max(pdfsPct, 2) : 0}%`,
                        }}
                        title={`PDFs: ${pdfsPct.toFixed(1)}% (${c.withPdfs}/${c.chapters})`}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              Notes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              PDFs
            </span>
          </div>
        </div>
      )}

      {/* ─── Level distribution ─── */}
      <div className="surface-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-purple-500" aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Level Distribution
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-3">
              Notes
            </p>
            <div className="space-y-3">
              {data.levelDist.map((d) => {
                const pct = Math.round((d.notes / totalLevelNotes) * 100)
                const meta = LEVEL_META[d.level]
                return (
                  <div key={`n-${d.level}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {meta.emoji} {meta.label}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        {d.notes} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${meta.bar}`}
                        style={{
                          width: `${d.notes > 0 ? Math.max(pct, 2) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-3">
              Chapter PDFs
            </p>
            <div className="space-y-3">
              {data.levelDist.map((d) => {
                const pct = Math.round((d.pdfs / totalLevelPdfs) * 100)
                const meta = LEVEL_META[d.level]
                return (
                  <div key={`p-${d.level}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {meta.emoji} {meta.label}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        {d.pdfs} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${meta.bar}`}
                        style={{
                          width: `${d.pdfs > 0 ? Math.max(pct, 2) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Charts row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText
                  className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
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
                <Users
                  className="w-5 h-5 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
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

      {/* ─── Content gaps ─── */}
      {data.gaps.length > 0 && (
        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle
                className="w-5 h-5 text-amber-500"
                aria-hidden="true"
              />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Content Gaps
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {data.allGapsCount} chapters • Showing first {data.gaps.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {data.gaps.map((ch: any) => (
              <div
                key={ch.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <span className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {ch.class}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {ch.chapter_title || `Chapter ${ch.chapter_num}`}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {ch.subject} • Ch {ch.chapter_num} •{' '}
                    {ch.language.toUpperCase()}
                  </p>
                </div>
                <Link
                  href={`/admin/notes?class=${ch.class}&subject=${encodeURIComponent(ch.subject)}`}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                >
                  Add →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recent activity ─── */}
      {data.recent.length > 0 && (
        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-500" aria-hidden="true" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="space-y-2">
            {data.recent.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.kind === 'pdf'
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  {item.kind === 'pdf' ? '📥' : '📝'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {item.topic}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Class {item.classNum} • {item.subject} • Ch{' '}
                    {item.chapterNum} • {item.level}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0 tabular-nums">
                  {(() => {
                    const diff = Date.now() - new Date(item.createdAt).getTime()
                    const min = Math.floor(diff / 60000)
                    if (min < 1) return 'just now'
                    if (min < 60) return `${min}m ago`
                    const hr = Math.floor(min / 60)
                    if (hr < 24) return `${hr}h ago`
                    const d = Math.floor(hr / 24)
                    if (d < 7) return `${d}d ago`
                    return new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })
                  })()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}