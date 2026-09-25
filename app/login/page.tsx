'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Mail,
  Lock,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { getSafeNext } from '@/lib/next-param'

// ═══════════════════════════════════════════════════════════════
// Parse Supabase login error → friendly message
// ═══════════════════════════════════════════════════════════════
function parseLoginError(msg: string): string {
  const lower = msg.toLowerCase()
  if (
    lower.includes('invalid login') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid_grant')
  ) {
    return 'Email ya password galat hai. Dobara check karo.'
  }
  if (
    lower.includes('email not confirmed') ||
    lower.includes('not verified')
  ) {
    return 'Email verify nahi hua. Inbox check karo aur verification link click karo.'
  }
  if (lower.includes('too many') || lower.includes('rate limit')) {
    return 'Bahut zyada attempts. Kuch der baad dobara try karo.'
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Internet check karke dobara try karo.'
  }
  return 'Login nahi hua. Dobara try karo.'
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resetBanner, setResetBanner] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const bannerShownRef = useRef(false)

  // ═══════════════════════════════════════════════════════════════
  // On mount: URL params + auto-redirect
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // 1) Read + sanitize `next`
    const safeNext = getSafeNext(params.get('next'), '/dashboard')
    setNextUrl(safeNext)

    // 2) Password reset success message (once per session)
    if (params.get('reset') === 'success' && !bannerShownRef.current) {
      bannerShownRef.current = true
      setResetBanner(true)
      toast.success('Password reset ho gaya! 🎉', { duration: 5000 })
    }

    // 3) Prefill email if provided
    const emailParam = params.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }

    // 4) Session expired error
    if (params.get('error') === 'session') {
      setErrorMsg('Session expire ho gayi. Dobara login karo.')
    }

    // 5) Auto-redirect if already logged in
    // ❌ REMOVED dangerous localStorage cleanup that was deleting current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        window.location.href = safeNext
      }
    })

    // 6) Auto-focus email field
    setTimeout(() => emailRef.current?.focus(), 100)

    // 7) Clean sensitive params from URL (avoid re-triggering)
    if (
      params.get('reset') ||
      params.get('error') ||
      params.get('email')
    ) {
      const clean = new URL(window.location.href)
      clean.searchParams.delete('reset')
      clean.searchParams.delete('error')
      clean.searchParams.delete('email')
      window.history.replaceState(
        null,
        '',
        clean.pathname + (clean.search || '')
      )
    }
  }, [])

  // ═══════════════════════════════════════════════════════════════
  // Focus error banner when it appears (a11y)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.focus()
    }
  }, [errorMsg])

  // ═══════════════════════════════════════════════════════════════
  // Email + password login
  // ═══════════════════════════════════════════════════════════════
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || googleLoading) return

    setErrorMsg(null)
    setResetBanner(false)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        const friendly = parseLoginError(error.message)
        setErrorMsg(friendly)
        toast.error(friendly)
        setLoading(false)
        return
      }

      toast.success('Welcome back! 👋')
      window.location.href = nextUrl ?? '/dashboard'
    } catch (err) {
      console.error('[login] unexpected:', err)
      const msg = 'Network error. Dobara try karo.'
      setErrorMsg(msg)
      toast.error(msg)
      setLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Google OAuth
  // ═══════════════════════════════════════════════════════════════
  const handleGoogleLogin = async () => {
    if (loading || googleLoading) return

    setErrorMsg(null)
    setResetBanner(false)
    setGoogleLoading(true)

    try {
      const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
      // Only append `next` if it's a non-default destination
      if (nextUrl && nextUrl !== '/dashboard') {
        callbackUrl.searchParams.set('next', nextUrl)
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl.toString() },
      })

      if (error) {
        const msg = 'Google login nahi hua. Dobara try karo.'
        setErrorMsg(msg)
        toast.error(msg)
        setGoogleLoading(false)
      }
    } catch (err) {
      console.error('[login] google unexpected:', err)
      const msg = 'Network error. Dobara try karo.'
      setErrorMsg(msg)
      toast.error(msg)
      setGoogleLoading(false)
    }
  }

  const isBusy = loading || googleLoading

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Home
        </Link>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Login karo aur apni padhai continue karo
          </p>

          {/* ═══════ RESET SUCCESS BANNER ═══════ */}
          {resetBanner && (
            <div
              className="mt-6 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-2"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2
                className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  Password reset ho gaya!
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Naye password se login karo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetBanner(false)}
                className="p-1 -m-1 rounded text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 transition"
                aria-label="Dismiss message"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* ═══════ ERROR BANNER ═══════ */}
          {errorMsg && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              aria-live="polite"
              className="mt-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-start gap-2 outline-none focus:ring-2 focus:ring-rose-400"
            >
              <AlertCircle
                className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-sm text-rose-800 dark:text-rose-300 flex-1">
                {errorMsg}
              </p>
            </div>
          )}

          {/* ═══════ FORM ═══════ */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  ref={emailRef}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={isBusy}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isBusy}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={isBusy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right -mt-1">
              <Link
                href="/forgot-password"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isBusy || !email.trim() || !password}
              aria-busy={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    aria-hidden="true"
                  />
                  Login ho raha...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* ═══════ DIVIDER ═══════ */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/70 dark:bg-gray-800/70 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* ═══════ GOOGLE BUTTON ═══════ */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isBusy}
            aria-busy={googleLoading}
            className="mt-4 w-full py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 dark:text-gray-200"
          >
            {googleLoading ? (
              <>
                <Loader2
                  className="w-5 h-5 animate-spin"
                  aria-hidden="true"
                />
                Google login...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}