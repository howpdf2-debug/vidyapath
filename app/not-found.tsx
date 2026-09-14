import Link from 'next/link'
import { BookOpen, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
        <div className="text-6xl font-extrabold text-primary mb-2">404</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Page not found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <Link
            href="/"
            className="px-5 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/ncert"
            className="px-5 py-2 bg-secondary text-white rounded-xl hover:bg-secondary-dark transition flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> Explore NCERT
          </Link>
        </div>
      </div>
    </div>
  )
}