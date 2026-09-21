'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  LayoutDashboard, FileText, FileImage, Video, BookOpen,
  GraduationCap, Newspaper, Users, BarChart3, Settings,
  Wrench, X, ChevronLeft, ChevronRight, Home,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/notes', label: 'Notes', icon: FileText },
      { href: '/admin/pdfs', label: 'PDFs', icon: FileImage },
      { href: '/admin/videos', label: 'Videos', icon: Video },
      { href: '/admin/ncert', label: 'NCERT', icon: BookOpen },
      { href: '/admin/competitive-exams', label: 'Exams', icon: GraduationCap },
      { href: '/admin/rojgar-samachar', label: 'Rojgar', icon: Newspaper },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/tools', label: 'Tools', icon: Wrench },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on route change
  useEffect(() => {
    onMobileClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Scroll lock + focus first link
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      // ✅ GAP 1 FIX: Focus first link for keyboard users
      const firstLink = drawerRef.current?.querySelector<HTMLElement>('a')
      requestAnimationFrame(() => firstLink?.focus())
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      // ✅ GAP 3 FIX: Always restore on unmount
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Escape closes mobile drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) onMobileClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mobileOpen, onMobileClose])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const sidebarContent = (
    <aside
      className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ${
        collapsed ? 'lg:w-16' : 'lg:w-64'
      } w-full`}
      aria-label="Admin sidebar"
    >
      {/* Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-2 min-w-0"
          aria-label="Admin home"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-lg">V</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-black text-slate-900 dark:text-white leading-none">
                VidyaPath
              </p>
              <p className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">
                Admin
              </p>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto py-4 px-2 space-y-6"
        aria-label="Admin navigation"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      // ✅ GAP 2 FIX: aria-current for screen readers
                      aria-current={active ? 'page' : undefined}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        active
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* View site */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'View Site' : undefined}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>View Site</span>}
        </Link>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <div
          ref={drawerRef}
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Admin menu"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className="relative h-full w-64 max-w-[85vw]">{sidebarContent}</div>
        </div>
      )}
    </>
  )
}