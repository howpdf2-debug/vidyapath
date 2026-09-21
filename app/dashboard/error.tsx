'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home, Copy, Check } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    console.error('[dashboard] error:', error)
  }, [error])

  const copyError = async () => {
    try {
      const text = [
        '[VidyaPath Dashboard Error]',
        `Message: ${error.message}`,
        `Digest: ${error.digest ?? 'N/A'}`,
        `Time: ${new Date().toISOString()}`,
      ].join('\n')
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const showDetails = process.env.NODE_ENV !== 'production'

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div
        role="alert"
        aria-live="polite"
        className="max-w-md w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-8 text-center"
      >
        <div className="w-14 h-14 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          कुछ गड़बड़ हो गई
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          Dashboard load नहीं हो पाया। Retry करें या home जाएँ।
        </p>

        {showDetails && error.message && (
          <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-900/60 text-left">
            <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        {error.digest && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <p className="text-[10px] font-mono text-slate-400">
              ID: {error.digest}
            </p>
            <button
              type="button"
              onClick={copyError}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Copy error details"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}