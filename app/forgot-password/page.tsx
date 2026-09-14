'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MailCheck,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { validateEmail } from '@/lib/auth'

type Status =
  | 'idle'         // form
  | 'checking'     // checking user
  | 'sending'      // sending email
  | 'sent'         // success — email sent
  | 'unconfirmed'  // user exists but email not verified
  | 'not-exists'   // user does not exist
  | 'rate-limit'   // rate limited
  | 'error'        // generic error

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      toast.error(emailCheck.error!)
      return
    }

    setStatus('checking')
    const cleanEmail = email.trim().toLowerCase()

    try {
      // STEP 1: Check user status via API
      const checkRes = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })

      const checkData = await checkRes.json()

      // Case A: User does not exist
      if (!checkData.exists) {
        setStatus('not-exists')
        return
      }

      // Case B: User exists but unconfirmed
      if (checkData.exists && !checkData.confirmed) {
        setStatus('unconfirmed')
        return
      }

      // Case C: User exists and confirmed — send reset email
      setStatus('sending')

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      if (error) {
        const msg = error.message.toLowerCase()

        if (msg.includes('rate limit') || msg.includes('too many')) {
          setStatus('rate-limit')
          return
        }

        if (msg.includes('email') || msg.includes('smtp')) {
          console.error('[forgot-password] Email send failed:', error)
          // Still show success state for security
          // But log to console for debugging
          setStatus('sent')
          return
        }

        console.error('[forgot-password] Unknown error:', error)
        setStatus('error')
        return
      }

      setStatus('sent')
    } catch (err: any) {
      console.error('[forgot-password] Error:', err)
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setEmail('')
  }

  // ==================== RENDER STATES ====================

  // CHECKING / SENDING
  if (status === 'checking' || status === 'sending') {
    return (
      <Wrapper>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {status === 'checking'
              ? 'Account check kar rahe hain...'
              : 'Reset email bhej rahe hain...'}
          </p>
        </div>
      </Wrapper>
    )
  }

  // SENT — success
  if (status === 'sent') {
    return (
      <Wrapper>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Humne <strong>{email}</strong> pe reset link bhej diya hai.
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Inbox aur spam folder check karo. Link 1 hour me expire hoga.
          </p>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-xs text-blue-700 dark:text-blue-300 text-left">
            <p className="font-medium mb-1">📌 Email nahi mili?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Spam folder check karo</li>
              <li>2-3 minute wait karo</li>
              <li>Rate limit ho sakti hai — 1 hour baad try karo</li>
            </ul>
          </div>

          <button
            onClick={reset}
            className="mt-6 text-sm text-indigo-600 hover:underline"
          >
            Dobara try karo
          </button>
        </div>
      </Wrapper>
    )
  }

  // UNCONFIRMED — user exists but email not verified
  if (status === 'unconfirmed') {
    return (
      <Wrapper>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold">Email verify nahi hua</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            <strong>{email}</strong> registered hai, lekin email verify nahi hua.
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Password reset karne se pehle email verify karna zaroori hai.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href={`/verify-email?email=${encodeURIComponent(email)}`}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
            >
              <Mail className="w-4 h-4" />
              Verification email dobara bhejo
            </Link>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
            >
              <LogIn className="w-4 h-4" />
              Login try karo
            </Link>
          </div>

          <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-700 dark:text-amber-300 text-left">
            <p className="font-medium mb-1">💡 Kya karein:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Upar wala button dabao — verification email aayegi</li>
              <li>Email me link click karo</li>
              <li>Fir yahan wapas aakar password reset karo</li>
            </ol>
          </div>

          <button
            onClick={reset}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Alag email try karo
          </button>
        </div>
      </Wrapper>
    )
  }

  // NOT EXISTS — user does not exist
  if (status === 'not-exists') {
    return (
      <Wrapper>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold">Account nahi mila</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            <strong>{email}</strong> se koi account registered nahi hai.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href={`/signup?email=${encodeURIComponent(email)}`}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Naya account banao
            </Link>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
            >
              <LogIn className="w-4 h-4" />
              Login try karo
            </Link>
          </div>

          <button
            onClick={reset}
            className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Alag email try karo
          </button>
        </div>
      </Wrapper>
    )
  }

  // RATE LIMIT
  if (status === 'rate-limit') {
    return (
      <Wrapper>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold">Bahut zyada attempts</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Aapne bahut baar reset try kiya hai. Kuch der baad dobara try karo.
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Recommended: <strong>1 hour</strong> wait karo.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
            >
              <LogIn className="w-4 h-4" />
              Login try karo
            </Link>
          </div>

          <button
            onClick={reset}
            className="mt-6 text-sm text-indigo-600 hover:underline"
          >
            ← Wapas
          </button>
        </div>
      </Wrapper>
    )
  }

  // ERROR — generic
  if (status === 'error') {
    return (
      <Wrapper>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold">Kuch galat ho gaya</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Email service me temporary issue hai. Kuch der baad try karo.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
            >
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

  // IDLE — form
  return (
    <Wrapper>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center">Forgot Password?</h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          Email daalo — hum password reset link bhejenge.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
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

// ==================== WRAPPER ====================
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