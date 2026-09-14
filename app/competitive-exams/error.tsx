'use client'

import { AlertTriangle, RefreshCw, Target } from 'lucide-react'
import Link from 'next/link'

export default function CompetitiveExamsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Competitive Exams content load nahi ho paaya
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Unable to load competitive exam content. Please try again.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="px-5 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 transition flex items-center gap-2"
          >
            <Target className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  )
}