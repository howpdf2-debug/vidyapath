'use client'

import { useState, useEffect, useRef } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import CommandPalette from './CommandPalette'

interface ShellProps {
  user: { email?: string; name?: string }
  notificationCount?: number
  children: React.ReactNode
}

export default function AdminShell({
  user,
  notificationCount = 0,
  children,
}: ShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  // ✅ GAP 15 FIX: Hydration-safe — read from localStorage AFTER mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin-sidebar-collapsed')
      if (saved === '1') setCollapsed(true)
    } catch {}
  }, [])

  const toggleCollapse = () => {
    setCollapsed((v) => {
      const next = !v
      try {
        localStorage.setItem('admin-sidebar-collapsed', next ? '1' : '0')
      } catch {}
      return next
    })
  }

  // Global ⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ✅ GAP 14 FIX: Skip link focus target
  const skipToContent = (e: React.MouseEvent) => {
    e.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* ✅ GAP 14 FIX: Skip-to-content for keyboard users */}
      <a
        href="#admin-main"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-indigo-600 focus:text-white focus:font-bold focus:shadow-lg"
      >
        Skip to content
      </a>

      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          onMenuClick={() => setMobileOpen(true)}
          onOpenCommand={() => setCommandOpen(true)}
          user={user}
          notificationCount={notificationCount}
        />

        <main
          id="admin-main"
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto focus:outline-none"
        >
          {children}
        </main>
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  )
}