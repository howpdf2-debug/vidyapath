'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RefreshCw, AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error monitoring (Sentry/PostHog) if configured
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto py-16 sm:py-24 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-950/40 mb-6">
        <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
      </div>

      <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black text-slate-900 dark:text-white tracking-tight mb-3">
        Kuch galat ho gaya
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-2 max-w-md mx-auto">
        Page load karte waqt error aaya. Please retry karo.
      </p>
      {error.digest && (
        <p className="text-xs text-slate-400 mb-8 font-mono">
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  )
}