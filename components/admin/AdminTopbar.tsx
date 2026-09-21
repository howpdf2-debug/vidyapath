'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Menu, Search, Bell, Sun, Moon, LogOut, User as UserIcon,
  Settings as SettingsIcon, ChevronDown, Command, Loader2,
} from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
  user: { email?: string; name?: string }
  onOpenCommand: () => void
  notificationCount?: number
}

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/analytics': 'Analytics',
  '/admin/notes': 'Notes',
  '/admin/pdfs': 'PDFs',
  '/admin/videos': 'Videos',
  '/admin/ncert': 'NCERT Chapters',
  '/admin/competitive-exams': 'Competitive Exams',
  '/admin/rojgar-samachar': 'Rojgar Samachar',
  '/admin/users': 'Users',
  '/admin/tools': 'Tools',
  '/admin/settings': 'Settings',
}

export default function AdminTopbar({
  onMenuClick,
  user,
  onOpenCommand,
  notificationCount = 0,
}: TopbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)          // ✅ GAP 6 FIX
  const [loggingOut, setLoggingOut] = useState(false)   // ✅ GAP 8 FIX
  const profileRef = useRef<HTMLDivElement>(null)

  // Hydration-safe init
  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
  }

  // ✅ GAP 8, 9 FIX: Logout with loading + refresh
  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  const pageTitle =
    PAGE_TITLES[pathname] ||
    (pathname.startsWith('/admin/notes') ? 'Notes' : 'Admin')

  const initials = (user.name || user.email || 'A')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="h-full px-4 sm:px-6 flex items-center gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
          {pageTitle}
        </h1>

        <div className="flex-1" />

        {/* Command palette */}
        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Open command palette"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Search…</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[10px] font-mono">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenCommand}
          className="sm:hidden w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Dark toggle — ✅ GAP 6 FIX: no flash */}
        <button
          type="button"
          onClick={toggleDark}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {!mounted ? (
            <div className="w-5 h-5" />
          ) : dark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications — ✅ GAP 10 FIX */}
        <button
          type="button"
          className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={
            notificationCount > 0
              ? `Notifications, ${notificationCount} unread`
              : 'Notifications'
          }
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            // ✅ GAP 7 FIX: aria-haspopup
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 h-10 pl-1 pr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Open profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {initials || 'A'}
            </div>
            <span className="hidden sm:block max-w-[120px] truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
              {user.name || user.email?.split('@')[0] || 'Admin'}
            </span>
            <ChevronDown
              className={`hidden sm:block w-4 h-4 text-slate-400 transition-transform ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user.name || 'Admin'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  role="menuitem"
                >
                  <UserIcon className="w-4 h-4" />
                  My Account
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  role="menuitem"
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </Link>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-60"
                  role="menuitem"
                >
                  {loggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  {loggingOut ? 'Logging out…' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}