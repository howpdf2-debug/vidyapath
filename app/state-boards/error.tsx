'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ChevronLeft,
  Sparkles,
  Loader2,
} from 'lucide-react'

export default function StateBoardsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [retrying, setRetrying] = useState(false)

  // ✅ Error log for debugging
  useEffect(() => {
    console.error('[state-boards] Runtime error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  // ✅ Reset with loading state
  const handleReset = () => {
    setRetrying(true)
    try {
      reset()
    } finally {
      // reset() throws away component tree — safe fallback timeout
      setTimeout(() => setRetrying(false), 1000)
    }
  }

  return (
    <div
      className="min-h-[70vh] flex items-center justify-center px-4 pb-16 pt-6"
      lang="hi"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-lg w-full">
        {/* ═══════════ ERROR CARD ═══════════ */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-10 text-center">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

          {/* Blur decoration */}
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-red-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Icon */}
            <div className="inline-flex w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 items-center justify-center mb-5 shadow-2xl shadow-red-500/30">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.2} />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-3">
              <Sparkles className="w-3 h-3" />
              त्रुटि
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-tight">
              कुछ गड़बड़ हो गई
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6 max-w-md mx-auto">
              राज्य बोर्ड सामग्री लोड नहीं हो पाई। कृपया पृष्ठ को पुनः लोड करें — समस्या बनी रहे तो कुछ देर बाद प्रयास करें।
            </p>

            {/* Digest ID — support ke liye */}
            {error.digest && (
              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-600 mb-5 select-all">
                Error ID: {error.digest}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
              <button
                onClick={handleReset}
                disabled={retrying}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                aria-label="पुनः प्रयास करें"
              >
                {retrying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    कोशिश हो रही है...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    पुनः प्रयास करें
                  </>
                )}
              </button>

              <Link
                href="/state-boards"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                aria-label="राज्य बोर्ड पर वापस जाएँ"
              >
                <ChevronLeft className="w-4 h-4" />
                राज्य बोर्ड
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════ HOME LINK ═══════════ */}
        <div className="text-center mt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md px-2 py-1"
          >
            <Home className="w-3.5 h-3.5" />
            होम पेज पर जाएँ
          </Link>
        </div>
      </div>
    </div>
  )
}