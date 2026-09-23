'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Search,
  Trash2,
  Mail,
  Shield,
  ShieldCheck,
  User as UserIcon,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { AdminHeader } from '@/components/AdminHeader'

interface AdminUser {
  id: string
  email: string
  created_at: string | null
  last_sign_in_at: string | null
  email_confirmed_at: string | null
  role: string
  full_name: string | null
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await fetch('/api/admin/users?perPage=200', {
        cache: 'no-store',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        toast.error(j?.error || 'Users load nahi hue')
        return
      }
      const json = await res.json()
      setUsers(json?.data?.users ?? [])
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const handleDelete = async (user: AdminUser) => {
    if (
      !confirm(
        `Delete user "${user.email}"?\n\nYeh action undo nahi ho sakta.`
      )
    )
      return

    setDeletingId(user.id)
    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        toast.error(j?.error || 'Delete fail')
        return
      }
      toast.success('User deleted')
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch {
      toast.error('Network error')
    } finally {
      setDeletingId(null)
    }
  }

  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((u) => u.role === 'admin').length
    const confirmed = users.filter((u) => u.email_confirmed_at).length
    const recent = users.filter((u) => {
      if (!u.last_sign_in_at) return false
      const last = new Date(u.last_sign_in_at).getTime()
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      return last > weekAgo
    }).length
    return { total, admins, confirmed, recent }
  }, [users])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const hay = `${u.email} ${u.full_name ?? ''} ${u.role}`.toLowerCase()
      return hay.includes(q)
    })
  }, [users, search])

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <AdminHeader title="👥 Manage Users" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={stats.total} color="indigo" />
        <StatCard label="Admins" value={stats.admins} color="violet" />
        <StatCard label="Verified" value={stats.confirmed} color="emerald" />
        <StatCard label="Active (7d)" value={stats.recent} color="amber" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, name, or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>
        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 text-sm font-medium transition"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white/60 dark:bg-slate-800/60 rounded-2xl h-16"
            />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <UserIcon className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">
            {users.length === 0 ? 'No users yet' : 'No matches'}
          </h3>
          <p className="text-sm text-gray-500">
            {users.length === 0
              ? 'Users will appear here once they sign up.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                onDelete={() => handleDelete(u)}
                deleting={deletingId === u.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'indigo' | 'violet' | 'emerald' | 'amber'
}) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500 to-purple-500',
    violet: 'from-violet-500 to-fuchsia-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
  }
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4">
      <div
        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${colors[color]}`}
      />
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
    </div>
  )
}

function UserRow({
  user,
  onDelete,
  deleting,
}: {
  user: AdminUser
  onDelete: () => void
  deleting: boolean
}) {
  const isAdmin = user.role === 'admin'
  const isVerified = !!user.email_confirmed_at

  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  const lastSeen = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      })
    : 'Never'

  const initial =
    (user.full_name?.charAt(0) || user.email.charAt(0) || 'U').toUpperCase()

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition">
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base ${
            isAdmin
              ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
              : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
          }`}
        >
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {user.full_name || user.email.split('@')[0]}
            </p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300 text-[10px] font-bold uppercase tracking-wide">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </span>
            )}
            {!isVerified && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-bold"
                title="Email not verified"
              >
                <AlertCircle className="w-3 h-3" />
                Unverified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
            <Mail className="w-3 h-3 flex-shrink-0" />
            {user.email}
          </p>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
            <span>Joined {joined}</span>
            <span>·</span>
            <span>Last seen {lastSeen}</span>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
          {isAdmin ? (
            <Shield className="w-3.5 h-3.5" />
          ) : (
            <UserIcon className="w-3.5 h-3.5" />
          )}
          {user.role}
        </span>

        <button
          onClick={onDelete}
          disabled={deleting || isAdmin}
          className="flex-shrink-0 p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title={isAdmin ? 'Cannot delete admin' : 'Delete user'}
          aria-label="Delete user"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}