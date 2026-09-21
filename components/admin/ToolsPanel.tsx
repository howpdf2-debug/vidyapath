'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Wrench, FileX, Download, Database, RefreshCw,
  Shield, AlertTriangle, FileText, Users, FileImage,
  FileSpreadsheet, Loader2, CheckCircle2, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

export interface ToolsStats {
  totalNotes: number
  notesWithoutPdf: number
  totalPdfs: number
  totalUsers: number
}

interface Props {
  initialStats: ToolsStats
  error: string | null
}

export default function ToolsPanel({ initialStats, error }: Props) {
  const [stats] = useState(initialStats)
  const [running, setRunning] = useState<string | null>(null)

  const runTool = async (toolId: string, label: string) => {
    setRunning(toolId)
    try {
      // Placeholder — Sprint 3 mein real endpoints wire up honge
      await new Promise((r) => setTimeout(r, 800))
      toast.success(`${label} — Coming soon`)
    } catch {
      toast.error(`${label} failed`)
    } finally {
      setRunning(null)
    }
  }

  const tools = [
    {
      id: 'orphan-cleanup',
      title: 'Orphan PDF Cleanup',
      description: 'Supabase Storage mein jo PDFs notes se linked nahi hain, unhe dhoondh ke delete karein.',
      icon: FileX,
      gradient: 'from-rose-500 to-pink-600',
      action: 'Scan & Clean',
      badge: stats.totalPdfs > 0 ? `${stats.totalPdfs} PDFs` : null,
    },
    {
      id: 'missing-pdf-report',
      title: 'Missing PDF Report',
      description: `कौन से notes बिना PDF हैं — उनकी list देखें और review करें।`,
      icon: FileText,
      gradient: 'from-amber-500 to-orange-600',
      action: 'View Report',
      badge: stats.notesWithoutPdf > 0 ? `${stats.notesWithoutPdf} notes` : null,
      link: '/admin/notes',
    },
    {
      id: 'export-notes',
      title: 'Export Notes Data',
      description: 'सारे notes JSON या CSV में export करें — backup के लिए।',
      icon: FileSpreadsheet,
      gradient: 'from-emerald-500 to-teal-600',
      action: 'Export',
    },
    {
      id: 'export-users',
      title: 'Export Users Data',
      description: 'User list export करें — email, name, signup date के साथ।',
      icon: Users,
      gradient: 'from-indigo-500 to-purple-600',
      action: 'Export',
    },
    {
      id: 'db-stats',
      title: 'Database Stats',
      description: 'Row counts, storage usage, index health — full report।',
      icon: Database,
      gradient: 'from-cyan-500 to-blue-600',
      action: 'View Stats',
    },
    {
      id: 'cache-clear',
      title: 'Clear Caches',
      description: 'Build cache, image cache, API cache — साफ़ करें।',
      icon: RefreshCw,
      gradient: 'from-fuchsia-500 to-pink-600',
      action: 'Clear',
    },
    {
      id: 'security-scan',
      title: 'Security Scan',
      description: 'RLS policies, env vars, exposed keys — check करें।',
      icon: Shield,
      gradient: 'from-slate-600 to-slate-800',
      action: 'Scan',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-purple-400/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-bold mb-3">
            <Wrench className="w-3.5 h-3.5" />
            Maintenance
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-1">Admin Tools</h2>
          <p className="text-white/80 text-sm">
            Database utilities, cleanup, exports, और health checks।
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="surface-card p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
            Notes
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {stats.totalNotes.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
            With PDF
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {stats.totalPdfs.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
            Missing PDF
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {stats.notesWithoutPdf.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
            Users
          </p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
            {stats.totalUsers.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isRunning = running === tool.id
          const inner = (
            <div className="surface-card p-5 sm:p-6 h-full hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {tool.title}
                    </h3>
                    {tool.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Running…
                      </>
                    ) : (
                      <>
                        {tool.action}
                        <CheckCircle2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )

          if (tool.link) {
            return (
              <Link key={tool.id} href={tool.link} className="block">
                {inner}
              </Link>
            )
          }

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => runTool(tool.id, tool.title)}
              disabled={isRunning}
              className="text-left disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {inner}
            </button>
          )
        })}
      </div>

      {/* Info footer */}
      <div className="surface-card p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
            Sprint 3 में आ रहे हैं
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real endpoints, bulk operations, activity log, और auto-cleanup schedules।
          </p>
        </div>
      </div>
    </div>
  )
}