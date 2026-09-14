'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import {
  BookOpen,
  GraduationCap,
  Briefcase,
  Newspaper,
  ArrowRight,
  ChevronDown,
  MapPin,
  Sparkles,
  TrendingUp,
  Target,
} from 'lucide-react'

const stateBoards = [
  { name: 'UP Board', slug: 'up', color: 'bg-orange-500' },
  { name: 'Bihar Board', slug: 'bihar', color: 'bg-red-500' },
  { name: 'MP Board', slug: 'mp', color: 'bg-green-500' },
  { name: 'Rajasthan Board', slug: 'rajasthan', color: 'bg-blue-500' },
]

export default function HomePage() {
  const [isBoardOpen, setIsBoardOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsBoardOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-16 animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-soft p-8 md:p-16 border border-white/30 dark:border-gray-700/30 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-300/40 dark:bg-indigo-700/30 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-300/40 dark:bg-purple-700/30 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 dark:bg-pink-700/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-indigo-600 dark:text-indigo-300 border border-white/30 dark:border-gray-700/50 shadow-lg">
              <Sparkles className="w-4 h-4" /> 🇮🇳 Free for Every Indian Student
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              <span className="text-gradient-soft">Free Study Portal</span>
              <br />
              <span className="text-gray-800 dark:text-white">
                for Indian Students
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed">
              NCERT Solutions, State Boards,{' '}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Sarkari Naukri
              </span>{' '}
              — everything in one place, absolutely free.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/ncert"
                className="btn-soft flex items-center gap-2 text-lg font-medium"
              >
                <BookOpen className="w-6 h-6" /> Explore NCERT{' '}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsBoardOpen(!isBoardOpen)}
                  className="px-8 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-2xl flex items-center gap-2 hover:border-indigo-400 dark:hover:border-indigo-500 transition text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md"
                >
                  <MapPin className="w-5 h-5 text-indigo-500" /> State Boards
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isBoardOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isBoardOpen && (
                  <div className="absolute left-0 mt-3 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-60 z-50 py-2">
                    {stateBoards.map((board) => (
                      <Link
                        key={board.slug}
                        href={`/state-boards/${board.slug}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-indigo-50 dark:hover:bg-gray-800 transition group"
                        onClick={() => setIsBoardOpen(false)}
                      >
                        <span
                          className={`w-3 h-3 rounded-full ${board.color}`}
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {board.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <StatCard
              number="100+"
              label="NCERT Chapters"
              icon={<BookOpen className="w-6 h-6 text-indigo-500" />}
            />
            <StatCard
              number="4"
              label="State Boards"
              icon={<MapPin className="w-6 h-6 text-orange-500" />}
            />
            <StatCard
              number="5+"
              label="Exam Results"
              icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            />
            <StatCard
              number="Free"
              label="Always"
              icon={<Sparkles className="w-6 h-6 text-blue-500" />}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <FeatureCard
          icon={<GraduationCap className="w-10 h-10 text-indigo-500" />}
          title="NCERT Books"
          description="Class 6-10 Maths, Science, Social Science with chapter-wise notes."
          href="/ncert"
        />
        <FeatureCard
          icon={<MapPin className="w-10 h-10 text-orange-500" />}
          title="State Boards"
          description="UP, Bihar, MP, Rajasthan Board books and study material."
          href="/state-boards"
        />
        <FeatureCard
          icon={<Newspaper className="w-10 h-10 text-green-500" />}
          title="Results"
          description="Board exam results for CBSE, UP, Bihar, MP, Rajasthan."
          href="/results"
        />
        <FeatureCard
          icon={<Briefcase className="w-10 h-10 text-blue-500" />}
          title="Rojgar Samachar"
          description="Latest employment news and govt job updates."
          href="/rojgar-samachar"
        />
        <FeatureCard
          icon={<Target className="w-10 h-10 text-purple-500" />}
          title="Competitive Exams"
          description="SSC, Railway, Bank – notes and practice questions in Hindi."
          href="/competitive-exams"
        />
      </section>

      {/* Trust Section */}
      <section className="glass rounded-3xl p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Trusted by students across India
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm">
          <span className="text-gray-700 dark:text-gray-300">
            📚 100+ NCERT Chapters
          </span>
          <span className="text-gray-700 dark:text-gray-300">
            🏛️ 4 State Boards
          </span>
          <span className="text-gray-700 dark:text-gray-300">
            📊 5+ Exam Boards
          </span>
          <span className="text-gray-700 dark:text-gray-300">💰 100% Free</span>
          <span className="text-gray-700 dark:text-gray-300">
            🎯 SSC, Railway, Bank
          </span>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  number,
  label,
  icon,
}: {
  number: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className="glass-card p-4 text-center hover:scale-105 transition">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-2xl font-extrabold text-gray-800 dark:text-white">
        {number}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="glass-card p-6 hover:shadow-2xl hover:scale-[1.02] group"
    >
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {description}
      </p>
      <span className="inline-block mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition">
        Explore →
      </span>
    </Link>
  )
}