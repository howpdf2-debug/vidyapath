'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, FileImage, Video, BookOpen,
  GraduationCap, Newspaper, Users, BarChart3, Settings,
  Wrench, Plus, Upload, Search, Home, CornerDownLeft,
} from 'lucide-react'

interface PaletteProps {
  open: boolean
  onClose: () => void
}

const ITEMS = [
  { group: 'Navigate', label: 'Dashboard', href: '/admin', icon: LayoutDashboard, keywords: 'home overview' },
  { group: 'Navigate', label: 'Analytics', href: '/admin/analytics', icon: BarChart3, keywords: 'stats charts' },
  { group: 'Navigate', label: 'Notes', href: '/admin/notes', icon: FileText, keywords: 'chapter content html' },
  { group: 'Navigate', label: 'PDFs', href: '/admin/pdfs', icon: FileImage, keywords: 'files documents' },
  { group: 'Navigate', label: 'Videos', href: '/admin/videos', icon: Video, keywords: 'youtube media' },
  { group: 'Navigate', label: 'NCERT', href: '/admin/ncert', icon: BookOpen, keywords: 'chapters books' },
  { group: 'Navigate', label: 'Exams', href: '/admin/competitive-exams', icon: GraduationCap, keywords: 'competitive' },
  { group: 'Navigate', label: 'Rojgar', href: '/admin/rojgar-samachar', icon: Newspaper, keywords: 'jobs news' },
  { group: 'Navigate', label: 'Users', href: '/admin/users', icon: Users, keywords: 'students accounts' },
  { group: 'Navigate', label: 'Tools', href: '/admin/tools', icon: Wrench, keywords: 'cleanup bulk' },
  { group: 'Navigate', label: 'Settings', href: '/admin/settings', icon: Settings, keywords: 'config preferences' },
  { group: 'Actions', label: 'Add New Note', href: '/admin/notes?action=new', icon: Plus, keywords: 'create write' },
  { group: 'Actions', label: 'Upload PDF', href: '/admin/notes?action=upload', icon: Upload, keywords: 'file pdf' },
  { group: 'Actions', label: 'View Public Site', href: '/', icon: Home, keywords: 'homepage website', external: true },
]

export default function CommandPalette({ open, onClose }: PaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)   // ✅ GAP 12 FIX

  const filtered = useMemo(() => {
    if (!query.trim()) return ITEMS
    const q = query.toLowerCase()
    return ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.includes(q)
    )
  }, [query])

  // ✅ GAP 11 FIX: Clamp active index when filtered shrinks
  useEffect(() => {
    if (activeIndex >= filtered.length) {
      setActiveIndex(Math.max(0, filtered.length - 1))
    }
  }, [filtered.length, activeIndex])

  // Open: reset, focus, remember previous focus
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      previousActiveRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      document.body.style.overflow = ''
      // ✅ GAP 12 FIX: Restore focus
      previousActiveRef.current?.focus?.()
      previousActiveRef.current = null
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        // ✅ GAP 13 FIX: Guard empty results
        const item = filtered[activeIndex]
        if (!item) return
        if (item.external) window.open(item.href, '_blank')
        else router.push(item.href)
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, activeIndex, onClose, router])

  if (!open) return null

  // Group
  const groups: Record<string, typeof ITEMS> = {}
  filtered.forEach((item) => {
    if (!groups[item.group]) groups[item.group] = []
    groups[item.group].push(item)
  })

  let flatIndex = -1

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder="Search pages, actions…"
            className="flex-1 h-14 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-sm"
            aria-label="Search"
          />
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 text-[10px] font-mono text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  {group}
                </p>
                {items.map((item) => {
                  flatIndex++
                  const isActive = flatIndex === activeIndex
                  const Icon = item.icon
                  const myIndex = flatIndex
                  return (
                    <button
                      key={item.href + item.label}
                      type="button"
                      onMouseEnter={() => setActiveIndex(myIndex)}
                      onClick={() => {
                        if (item.external) window.open(item.href, '_blank')
                        else router.push(item.href)
                        onClose()
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                      role="option"
                      aria-selected={isActive}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && <CornerDownLeft className="w-3 h-3 opacity-60" />}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600 font-mono">↑</kbd>
            <kbd className="px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600 font-mono">↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600 font-mono">↵</kbd>
            Open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600 font-mono">esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  )
}