'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  MapPin,
  ChevronDown,
  Briefcase,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { SearchBar } from './SearchBar'
import { supabase } from '@/lib/supabase'

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

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBoardOpen, setIsBoardOpen] = useState(false)
  const [isCompetitiveOpen, setIsCompetitiveOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { theme, setTheme } = useTheme()

  const boardRef = useRef<HTMLDivElement>(null)
  const competitiveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Supabase auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
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
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* ==================== LOGO ==================== */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0 group"
          aria-label="VidyaPath Home"
        >
          <div className="relative w-9 h-9 rounded-lg overflow-hidden shadow-md group-hover:scale-105 transition">
            <Image
              src="/icon-192.png"
              alt="VidyaPath Logo"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-indigo-600 dark:text-indigo-400">Vidya</span>
            <span className="text-orange-500">Path</span>
          </span>
        </Link>

        {/* ==================== DESKTOP NAV ==================== */}
        <nav className="hidden lg:flex items-center gap-3 flex-1 text-sm font-medium">
          <Link
            href="/ncert"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap"
          >
            NCERT
          </Link>

          {/* State Boards Dropdown */}
          <div className="relative" ref={boardRef}>
            <button
              onClick={() => setIsBoardOpen(!isBoardOpen)}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap"
              aria-label="Toggle State Boards dropdown"
            >
              <MapPin className="w-4 h-4" />
              State Boards
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isBoardOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isBoardOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 py-2">
                {stateBoards.map((board) => (
                  <Link
                    key={board.slug}
                    href={`/state-boards/${board.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                    onClick={() => setIsBoardOpen(false)}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${board.color}`}
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {board.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Competitive Exams Dropdown */}
          <div className="relative" ref={competitiveRef}>
            <button
              onClick={() => setIsCompetitiveOpen(!isCompetitiveOpen)}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap"
              aria-label="Toggle Competitive Exams dropdown"
            >
              <Briefcase className="w-4 h-4" />
              Exams
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isCompetitiveOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isCompetitiveOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
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
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap"
          >
            Notes
          </Link>
          <Link
            href="/results"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap"
          >
            Results
          </Link>
          <Link
            href="/rojgar-samachar"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap"
          >
            Rojgar
          </Link>

          <div className="ml-auto">
            <SearchBar />
          </div>
        </nav>

        {/* ==================== RIGHT ACTIONS ==================== */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-2">
            {authLoading ? (
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 whitespace-nowrap"
                >
                  <UserIcon className="w-4 h-4" />
                  {user.user_metadata?.full_name ||
                    user.email?.split('@')[0] ||
                    'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* ==================== MOBILE / DRAWER MENU ==================== */}
      {isMenuOpen && (
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 space-y-2 max-h-[80vh] overflow-y-auto">
          <div className="lg:hidden pb-3">
            <SearchBar />
          </div>

          <Link
            href="/ncert"
            className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={() => setIsMenuOpen(false)}
          >
            NCERT
          </Link>

          {/* Mobile State Boards */}
          <div className="py-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              State Boards
            </p>
            {stateBoards.map((board) => (
              <Link
                key={board.slug}
                href={`/state-boards/${board.slug}`}
                className="flex items-center gap-2 py-2 pl-3 text-sm hover:text-indigo-600 dark:hover:text-indigo-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={`w-2 h-2 rounded-full ${board.color}`} />
                {board.name}
              </Link>
            ))}
          </div>

          {/* Mobile Competitive Exams */}
          <div className="py-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Competitive Exams
            </p>
            {competitiveExams.map((exam) => (
              <Link
                key={exam.slug}
                href={`/competitive-exams/${exam.slug}`}
                className="block py-2 pl-3 text-sm hover:text-indigo-600 dark:hover:text-indigo-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {exam.name}
              </Link>
            ))}
          </div>

          <Link
            href="/notes"
            className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={() => setIsMenuOpen(false)}
          >
            Notes
          </Link>
          <Link
            href="/results"
            className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={() => setIsMenuOpen(false)}
          >
            Results
          </Link>
          <Link
            href="/rojgar-samachar"
            className="block py-2 hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={() => setIsMenuOpen(false)}
          >
            Rojgar Samachar
          </Link>

          {/* Auth */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {authLoading ? (
              <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 text-gray-700 dark:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block py-2 font-medium text-indigo-600 dark:text-indigo-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user.user_metadata?.full_name ||
                    user.email?.split('@')[0] ||
                    'Profile'}
                </Link>
                <Link
                  href="/bookmarks"
                  className="block py-2 text-gray-700 dark:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Bookmarks
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-gray-700 dark:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block py-2 px-4 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}