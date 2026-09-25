'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

// ═══════════════════════════════════════════════════════════════
// Password strength
// ═══════════════════════════════════════════════════════════════
function validatePasswordStrength(pw: string) {
  const checks = {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
  }
  const valid = Object.values(checks).every(Boolean)
  return { valid, checks }
}

type SessionState = 'checking' | 'valid' | 'invalid'

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionState, setSessionState] = useState<SessionState>('checking')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [successCountdown, setSuccessCountdown] = useState(0)
  const router = useRouter()

  // ✅ A11y
  const headingRef = useRef<HTMLHeadingElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const pwValidation = validatePasswordStrength(password)
  const pwMismatch = password.length > 0 && password !== confirm

  // ─── Session check on mount (handles PKCE + hash + cookie)
  useEffect(() => {
    let active = true

    const checkSession = async () => {
      try {
        // Wait a tick for Supabase hash parser
        await new Promise((r) => setTimeout(r, 300))

        // Retry up to 3 times with backoff (slow networks)
        const maxAttempts = 3
        let attempt = 0
        let session = null

        while (attempt < maxAttempts && active) {
          const { data } = await supabase.auth.getSession()
          session = data.session
          if (session?.user) break
          attempt++
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 400 * attempt))
          }
        }

        if (!active) return

        if (session?.user) {
          setSessionState('valid')
          setUserEmail(session.user.email ?? null)
          // Clean hash from URL for security
          if (window.location.hash) {
            window.history.replaceState(
              null,
              '',
              window.location.pathname
            )
          }
        } else {
          setSessionState('invalid')
        }
      } catch (err) {
        console.error('[reset-password] session check:', err)
        if (active) setSessionState('invalid')
      }
    }

    checkSession()
    return () => {
      active = false
    }
  }, [])

  // ✅ Focus password field when session valid
  useEffect(() => {
    if (sessionState === 'valid' && passwordRef.current) {
      passwordRef.current.focus()
    }
    if (
      (sessionState === 'valid' || sessionState === 'invalid') &&
      headingRef.current
    ) {
      headingRef.current.focus()
    }
  }, [sessionState])

  // ✅ Success countdown
  useEffect(() => {
    if (successCountdown <= 0) return
    const timer = setTimeout(() => setSuccessCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [successCountdown])

  // ─── Auto-redirect after successful update
  useEffect(() => {
    if (successCountdown === 0) return
    if (successCountdown === 1) {
      // Last tick
      setTimeout(() => {
        router.push(
          userEmail
            ? `/login?reset=success&email=${encodeURIComponent(userEmail)}`
            : '/login?reset=success'
        )
      }, 1000)
    }
  }, [successCountdown, router, userEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pwValidation.valid) {
      toast.error('Password strong nahi hai — sabhi conditions poori karo')
      return
    }
    if (pwMismatch) {
      toast.error('Passwords match nahi kar rahe')
      return
    }
    if (password.length > 72) {
      toast.error('Password 72 character se chhota rakho')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        console.error('[reset-password] update failed:', error)
        const msg = error.message.toLowerCase()
        if (msg.includes('expired') || msg.includes('invalid')) {
          toast.error('Reset link expire ho gaya. Nayi link request karo.')
          setSessionState('invalid')
        } else if (msg.includes('same') || msg.includes('recent')) {
          toast.error('Yeh password pehle use ho chuka hai')
        } else {
          toast.error('Password update nahi hua. Dobara try karo')
        }
        return
      }

      toast.success('Password update ho gaya 🔒')
      // Sign out user — they'll login with new password
      await supabase.auth.signOut()
      setSuccessCountdown(3)
    } catch (err) {
      console.error('[reset-password] unexpected:', err)
      toast.error('Network error. Dobara try karo')
    } finally {
      setLoading(false)
    }
  }

  // ═══════════════ CHECKING SESSION ═══════════════
  if (sessionState === 'checking') {
    return (
      <Wrapper>
        <div
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center"
          aria-live="polite"
        >
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Reset link verify kar rahe hain...
          </p>
        </div>
      </Wrapper>
    )
  }

  // ═══════════════ SUCCESS COUNTDOWN ═══════════════
  if (successCountdown > 0) {
    return (
      <Wrapper>
        <div
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center"
          aria-live="polite"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold outline-none"
          >
            Password update ho gaya!
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Login page pe redirect kar rahe hain...
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            {successCountdown}s
          </p>
          <Link
            href="/login?reset=success"
            className="mt-6 inline-block text-sm text-indigo-600 hover:underline font-medium"
          >
            Turant login karo →
          </Link>
        </div>
      </Wrapper>
    )
  }

  // ═══════════════ INVALID SESSION ═══════════════
  if (sessionState === 'invalid') {
    return (
      <Wrapper>
        <div
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center"
          aria-live="polite"
        >
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold outline-none"
          >
            Link invalid ya expire
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Reset link kaam nahi kar raha. Shayad expire ho gaya ya pehle use
            ho chuka hai.
          </p>

          <div className="mt-6 space-y-2">
            <Link
              href="/forgot-password"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
            >
              Nayi reset link request karo
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
            >
              Back to login
            </Link>
          </div>
        </div>
      </Wrapper>
    )
  }

  // ═══════════════ VALID SESSION — FORM ═══════════════
  return (
    <Wrapper>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8">
        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-center outline-none"
        >
          Naya password set karo
        </h1>
        {userEmail && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {userEmail} ke liye
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* New password */}
          <div>
            <label
              htmlFor="new-password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="new-password"
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                placeholder="Strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                maxLength={72}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Strength indicators */}
          {password.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <Req
                met={pwValidation.checks.length}
                label="At least 8 characters"
              />
              <Req
                met={pwValidation.checks.uppercase}
                label="1 uppercase letter (A-Z)"
              />
              <Req
                met={pwValidation.checks.lowercase}
                label="1 lowercase letter (a-z)"
              />
              <Req
                met={pwValidation.checks.number}
                label="1 number (0-9)"
              />
            </div>
          )}

          {/* Confirm password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                maxLength={72}
                className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none ${
                  pwMismatch
                    ? 'border-rose-300 dark:border-rose-700'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {pwMismatch && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                Passwords match nahi kar rahe
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !pwValidation.valid || pwMismatch}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Update ho raha...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </Wrapper>
  )
}

// ═══════════════════════════════════════════════════════════════
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        {children}
      </div>
    </div>
  )
}

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2
          className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0"
          aria-hidden="true"
        />
      ) : (
        <XCircle
          className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0"
          aria-hidden="true"
        />
      )}
      <span
        className={
          met
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-gray-500 dark:text-gray-400'
        }
      >
        {label}
      </span>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}