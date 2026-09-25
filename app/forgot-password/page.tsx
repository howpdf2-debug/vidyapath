'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Loader2,
  MailCheck,
  AlertCircle,
  LogIn,
  UserPlus,
  RefreshCw,
  Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/lib/auth'

type Status = 'idle' | 'sending' | 'sent' | 'rate-limit' | 'error'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [countdown, setCountdown] = useState(0)
  const [resending, setResending] = useState(false)

  // ✅ A11y: focus management
  const headingRef = useRef<HTMLHeadingElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  // ✅ A11y: announce status changes to screen readers
  useEffect(() => {
    if (status !== 'idle' && headingRef.current) {
      headingRef.current.focus()
    }
    if (status === 'idle' && emailRef.current) {
      emailRef.current.focus()
    }
  }, [status])

  // ✅ Resend cooldown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const sendResetEmail = async (rawEmail: string): Promise<Status> => {
    const cleanEmail = rawEmail.trim().toLowerCase()

    try {
      const callbackUrl = `${window.location.origin}/auth/callback?next=/reset-password&type=recovery`

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: callbackUrl,
      })

      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('rate limit') || msg.includes('too many')) {
          return 'rate-limit'
        }
        // ✅ SECURITY: Even on email/smtp errors, we don't reveal anything
        console.error('[forgot-password] email send failed:', error)
        return 'error'
      }

      return 'sent'
    } catch (err) {
      console.error('[forgot-password] unexpected:', err)
      return 'error'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      toast.error(emailCheck.error!)
      return
    }

    setStatus('sending')
    // ✅ SECURITY: Always behave identically regardless of email existence
    // Small artificial delay to prevent timing-based enumeration
    await new Promise((r) => setTimeout(r, 400))

    const result = await sendResetEmail(email)
    setStatus(result)
    if (result === 'sent') setCountdown(60)
  }

  const handleResend = async () => {
    if (countdown > 0 || resending) return
    setResending(true)
    try {
      const result = await sendResetEmail(email)
      if (result === 'sent') {
        toast.success('Email dobara bhej di 📧')
        setCountdown(60)
      } else if (result === 'rate-limit') {
        toast.error('Bahut zyada attempts. 1 hour baad try karo.')
        setCountdown(3600)
      } else {
        toast.error('Email nahi bheji gayi. Dobara try karo.')
      }
    } finally {
      setResending(false)
    }
  }

  const reset = () => {
    setStatus('idle')
    setEmail('')
    setCountdown(0)
  }

  // ═══════════════ SENDING STATE ═══════════════
  if (status === 'sending') {
    return (
      <Wrapper>
        <div
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center"
          aria-live="polite"
        >
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Reset email bhej rahe hain...
          </p>
        </div>
      </Wrapper>
    )
  }

  // ═══════════════ SENT — SUCCESS ═══════════════
  if (status === 'sent') {
    return (
      <Wrapper>
        <div
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center"
          aria-live="polite"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold outline-none"
          >
            Email check karo
          </h1>

          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Agar <strong>{email}</strong> registered hai, toh reset link bhej
            diya gaya hai.
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Inbox aur spam folder check karo. Link 1 hour mein expire hoga.
          </p>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-xs text-blue-700 dark:text-blue-300 text-left">
            <p className="font-medium mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Email nahi mili?
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Spam / promotions folder check karo</li>
              <li>2-3 minute wait karo</li>
              <li>Ya niche "Resend" button dabao</li>
            </ul>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Bhej rahe hain...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  Resend in {countdown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend email
                </>
              )}
            </button>

            <button
              onClick={reset}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-2"
            >
              Alag email try karo
            </button>
          </div>
        </div>
      </Wrapper>
    )
  }

  // ═══════════════ RATE LIMIT ═══════════════
  if (status === 'rate-limit') {
    return (
      <Wrapper>
        <div
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center"
          aria-live="polite"
        >
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold outline-none"
          >
            Thoda ruko
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Bahut zyada reset attempts. Kuch der baad dobara try karo.
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Recommended: 1 hour wait karo.
          </p>

          <div className="mt-6 space-y-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
            >
              <LogIn className="w-4 h-4" />
              Login try karo
            </Link>
            <button
              onClick={reset}
              className="w-full text-sm text-indigo-600 hover:underline py-2"
            >
              Wapas
            </button>
          </div>
        </div>
      </Wrapper>
    )
  }

  // ═══════════════ ERROR ═══════════════
  if (status === 'error') {
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
            Kuch galat ho gaya
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Email service mein temporary issue hai. Kuch der baad try karo.
          </p>

          <div className="mt-6 space-y-2">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Dobara try karo
            </button>
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Naya account banao
            </Link>
          </div>
        </div>
      </Wrapper>
    )
  }

  // ═══════════════ IDLE — FORM ═══════════════
  return (
    <Wrapper>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center">Forgot Password?</h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          Email daalo — hum reset link bhejenge.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!email.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 font-medium"
          >
            Send Reset Link
          </button>

          <p className="text-center text-sm text-gray-500">
            Password yaad aa gaya?{' '}
            <Link
              href="/login"
              className="text-indigo-600 hover:underline font-medium"
            >
              Login karo
            </Link>
          </p>
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