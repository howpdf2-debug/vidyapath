'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw, Home, Copy, Check } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    console.error('[admin] error:', error)
  }, [error])

  const copyError = async () => {
    try {
      const text = [
        '[VidyaPath Admin Error]',
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
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="surface-card p-8 max-w-md w-full text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          कुछ गड़बड़ हो गई
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Page load करने में error आया। Retry करें या dashboard वापस जाएँ।
        </p>

        {showDetails && (
          <div className="mb-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-left">
            <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        {error.digest && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-[10px] font-mono text-slate-400">
              ID: {error.digest}
            </p>
            <button
              type="button"
              onClick={copyError}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              aria-label="Copy error details"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          <Link
            href="/admin"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}