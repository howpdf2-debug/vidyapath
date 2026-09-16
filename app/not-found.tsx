import Link from 'next/link'
import { Home, BookOpen, Search, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto py-16 sm:py-24 text-center">
      <div className="relative inline-block mb-6">
        <p className="text-[clamp(6rem,20vw,12rem)] font-black leading-none bg-gradient-to-br from-brand-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          404
        </p>
      </div>

      <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black text-slate-900 dark:text-white tracking-tight mb-3">
        Page nahi mili
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        Jo page tum dhundh rahe ho, wo exist nahi karta ya move ho gaya hai.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
        <Link
          href="/ncert"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <BookOpen className="w-4 h-4" />
          Browse NCERT
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <Search className="w-4 h-4" />
          Search
        </Link>
      </div>
    </div>
  )
}