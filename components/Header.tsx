'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  MapPin,
  ChevronDown,
  Briefcase,
  Search,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { SearchBar } from './SearchBar'
import { supabase } from '@/lib/supabase'
import { UserAvatar } from '@/components/UserAvatar'
import { getStyle } from '@/lib/avatar'

const stateBoards = [
  { name: 'UP Board', slug: 'up', color: 'bg-orange-500' },
  { name: 'Bihar Board', slug: 'bihar', color: 'bg-red-500' },
  { name: 'MP Board', slug: 'mp', color: 'bg-green-500' },
  { name: 'Rajasthan Board', slug: 'rajasthan', color: 'bg-blue-500' },
]

const competitiveExams = [
  { name: 'SSC', slug: 'ssc' },
  { name: 'Railway', slug: 'railway' },
  { name: 'Bank', slug: 'bank' },
]

// ✅ Admin routes pe header bilkul render nahi hoga
export function Header() {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return <HeaderContent />
}

function HeaderContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBoardOpen, setIsBoardOpen] = useState(false)
  const [isCompetitiveOpen, setIsCompetitiveOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  const boardRef = useRef<HTMLDivElement>(null)
  const competitiveRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsBoardOpen(false)
    setIsCompetitiveOpen(false)
  }, [pathname])

  // Body scroll lock + Escape key + focus return
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMenuOpen(false)
          hamburgerRef.current?.focus()
        }
      }
      document.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleEsc)
      }
    }
  }, [isMenuOpen])

  // Focus trap inside mobile drawer
  useEffect(() => {
    if (!isMenuOpen) return
    const drawer = drawerRef.current
    if (!drawer) return

    const focusables = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusables.length === 0) return

    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    const autoFocusTarget =
      Array.from(focusables).find(
        (el) => el.tagName === 'A' || el.tagName === 'BUTTON'
      ) ?? first

    const focusTimer = window.setTimeout(() => autoFocusTarget.focus(), 50)

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleTab)
    }
  }, [isMenuOpen])

  // Supabase auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        setAuthLoading(false)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boardRef.current && !boardRef.current.contains(event.target as Node)) {
        setIsBoardOpen(false)
      }
      if (
        competitiveRef.current &&
        !competitiveRef.current.contains(event.target as Node)
      ) {
        setIsCompetitiveOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsMenuOpen(false)
    const protectedPrefixes = ['/dashboard', '/bookmarks', '/profile']
    if (protectedPrefixes.some((p) => pathname?.startsWith(p))) {
      router.push('/')
    }
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const closeMobileMenu = () => {
    setIsMenuOpen(false)
    hamburgerRef.current?.focus()
  }

  // ✅ Avatar prefs from user_metadata (Phase 3 picker will set these)
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>
  const avatarStyle = getStyle(
    typeof meta.avatar_style === 'string' ? meta.avatar_style : null
  )
  const avatarTheme =
    typeof meta.avatar_theme === 'string' ? meta.avatar_theme : null

  const userName =
    (typeof meta.full_name === 'string' ? meta.full_name : '') ||
    user?.email?.split('@')[0] ||
    'Profile'

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group"
            aria-label="VidyaPath Home"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden shadow-md group-hover:scale-105 transition">
              <Image
                src="/icon-192.png"
                alt=""
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
              <span className="text-indigo-600 dark:text-indigo-400">Vidya</span>
              <span className="text-orange-500">Path</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 text-sm font-medium">
            <Link
              href="/ncert"
              aria-current={isActive('/ncert') ? 'page' : undefined}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap px-2 py-1.5 ${
                isActive('/ncert')
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : ''
              }`}
            >
              NCERT
            </Link>

            {/* State Boards */}
            <div className="relative" ref={boardRef}>
              <button
                onClick={() => setIsBoardOpen(!isBoardOpen)}
                className={`flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap px-2 py-1.5 ${
                  pathname?.startsWith('/state-boards')
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : ''
                }`}
                aria-label="Toggle State Boards dropdown"
                aria-expanded={isBoardOpen}
                aria-haspopup="true"
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span className="hidden lg:inline">State Boards</span>
                <span className="lg:hidden">Boards</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isBoardOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isBoardOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 py-2 animate-slide-in-top">
                  {stateBoards.map((board) => (
                    <Link
                      key={board.slug}
                      href={`/state-boards/${board.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                      onClick={() => setIsBoardOpen(false)}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${board.color}`}
                        aria-hidden="true"
                      />
                      <span className="text-sm text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {board.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Competitive Exams */}
            <div className="relative" ref={competitiveRef}>
              <button
                onClick={() => setIsCompetitiveOpen(!isCompetitiveOpen)}
                className={`flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap px-2 py-1.5 ${
                  pathname?.startsWith('/competitive-exams')
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : ''
                }`}
                aria-label="Toggle Competitive Exams dropdown"
                aria-expanded={isCompetitiveOpen}
                aria-haspopup="true"
              >
                <Briefcase className="w-4 h-4" aria-hidden="true" />
                Exams
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isCompetitiveOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isCompetitiveOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slide-in-top">
                  {competitiveExams.map((exam) => (
                    <Link
                      key={exam.slug}
                      href={`/competitive-exams/${exam.slug}`}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition hover:text-indigo-600 dark:hover:text-indigo-400"
                      onClick={() => setIsCompetitiveOpen(false)}
                    >
                      {exam.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/notes"
              aria-current={isActive('/notes') ? 'page' : undefined}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap px-2 py-1.5 ${
                isActive('/notes')
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : ''
              }`}
            >
              Notes
            </Link>
            <Link
              href="/results"
              aria-current={isActive('/results') ? 'page' : undefined}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap px-2 py-1.5 hidden lg:inline-flex ${
                isActive('/results')
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : ''
              }`}
            >
              Results
            </Link>
            <Link
              href="/rojgar-samachar"
              aria-current={isActive('/rojgar-samachar') ? 'page' : undefined}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap px-2 py-1.5 hidden lg:inline-flex ${
                isActive('/rojgar-samachar')
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : ''
              }`}
            >
              Rojgar
            </Link>

            <div className="ml-auto hidden lg:block">
              <SearchBar />
            </div>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Mobile search */}
            <Link
              href="/search"
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition tap-target flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </Link>

            {/* Theme toggle — reserved 20x20 space, prevents CLS */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition tap-target flex items-center justify-center"
              aria-label={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              suppressHydrationWarning
            >
              <span className="inline-flex w-5 h-5 items-center justify-center">
                {!mounted ? null : theme === 'dark' ? (
                  <Sun className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Moon className="w-5 h-5" aria-hidden="true" />
                )}
              </span>
            </button>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2 min-w-[140px] justify-end">
              {authLoading ? (
                <div
                  className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                  aria-hidden="true"
                />
              ) : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap hidden lg:inline"
                  >
                    Dashboard
                  </Link>
                  {/* ✅ Avatar + name → profile link */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-full pl-0.5 pr-1 py-0.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-label="Open profile"
                  >
                    <UserAvatar
                      name={
                        typeof meta.full_name === 'string'
                          ? meta.full_name
                          : null
                      }
                      email={user.email}
                      style={avatarStyle}
                      themeId={avatarTheme}
                      size="sm"
                      ariaLabel=""
                    />
                    <span className="hidden lg:inline max-w-[100px] truncate">
                      {userName}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger */}
            <button
              ref={hamburgerRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition tap-target flex items-center justify-center"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[45] md:hidden animate-fade-in"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
            className="fixed top-14 sm:top-16 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100dvh-3.5rem)] overflow-y-auto animate-slide-in-top"
          >
            <div className="p-4 space-y-1 safe-bottom">
              <div className="pb-3 mb-2 border-b border-gray-200 dark:border-gray-700">
                <SearchBar />
              </div>

              <Link
                href="/ncert"
                className="block py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                onClick={closeMobileMenu}
              >
                📚 NCERT
              </Link>
              <Link
                href="/notes"
                className="block py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                onClick={closeMobileMenu}
              >
                📝 Notes
              </Link>

              <div className="py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1 px-3">
                  State Boards
                </p>
                {stateBoards.map((board) => (
                  <Link
                    key={board.slug}
                    href={`/state-boards/${board.slug}`}
                    className="flex items-center gap-2 py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                    onClick={closeMobileMenu}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${board.color}`}
                      aria-hidden="true"
                    />
                    {board.name}
                  </Link>
                ))}
              </div>

              <div className="py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1 px-3">
                  Competitive Exams
                </p>
                {competitiveExams.map((exam) => (
                  <Link
                    key={exam.slug}
                    href={`/competitive-exams/${exam.slug}`}
                    className="block py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                    onClick={closeMobileMenu}
                  >
                    {exam.name}
                  </Link>
                ))}
              </div>

              <Link
                href="/results"
                className="block py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                onClick={closeMobileMenu}
              >
                📊 Results
              </Link>
              <Link
                href="/rojgar-samachar"
                className="block py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                onClick={closeMobileMenu}
              >
                📰 Rojgar Samachar
              </Link>

              <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                {authLoading ? (
                  <div
                    className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-3"
                    aria-hidden="true"
                  />
                ) : user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                      onClick={closeMobileMenu}
                    >
                      Dashboard
                    </Link>
                    {/* ✅ Mobile profile link with avatar */}
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-indigo-600 dark:text-indigo-400"
                      onClick={closeMobileMenu}
                    >
                      <UserAvatar
                        name={
                          typeof meta.full_name === 'string'
                            ? meta.full_name
                            : null
                        }
                        email={user.email}
                        style={avatarStyle}
                        themeId={avatarTheme}
                        size="sm"
                        ariaLabel=""
                      />
                      <span className="truncate">{userName}</span>
                    </Link>
                    <Link
                      href="/bookmarks"
                      className="block py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                      onClick={closeMobileMenu}
                    >
                      Bookmarks
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-3 px-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block py-3 px-3 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 font-medium"
                      onClick={closeMobileMenu}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}