'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

function VerifyEmailContent() {
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [status, setStatus] = useState<'checking' | 'verified' | 'pending'>(
    'checking'
  )
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) setEmail(emailParam)

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        console.log('[verify-email] Session:', session?.user?.email)
        console.log('[verify-email] Error:', error)

        if (session?.user) {
          console.log('[verify-email] ✅ Session found — verified!')
          setStatus('verified')
          setTimeout(() => {
            router.push('/dashboard')
            router.refresh()
          }, 800)
          return
        }

        setStatus('pending')
      } catch (err) {
        console.error('[verify-email] Error:', err)
        setStatus('pending')
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[verify-email] Auth event:', event)
      if (event === 'SIGNED_IN' && session?.user) {
        setStatus('verified')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 800)
      }
    })

    return () => subscription.unsubscribe()
  }, [searchParams, router])

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found. Please sign up again.')
      return
    }

    if (countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before resending.`)
      return
    }

    setResendLoading(true)

    try {
      // ✅ FIX: Added emailRedirectTo + proper error handling
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log('[resend] Response:', { data, error })

      if (error) {
        const msg = error.message.toLowerCase()
        console.error('[resend] Error:', error)

        if (msg.includes('rate limit') || msg.includes('too many')) {
          toast.error(
            'Bahut zyada attempts. 1 ghante baad try karo.',
            { duration: 6000 }
          )
          setCountdown(3600) // 1 hour
        } else if (msg.includes('already confirmed') || msg.includes('already verified')) {
          toast.success('Email already verified! Login karo.')
          setTimeout(() => router.push('/login'), 1500)
        } else if (msg.includes('user not found') || msg.includes('not found')) {
          toast.error('Account nahi mila. Naya signup karo.')
        } else if (msg.includes('email') || msg.includes('smtp')) {
          toast.error(
            'Email service me temporary issue. Kuch der baad try karo.',
            { duration: 6000 }
          )
        } else {
          toast.error(error.message)
        }
        setResendLoading(false)
        return
      }

      console.log('[resend] Success:', data)
      toast.success(
        'Verification email bhej di! Inbox aur spam folder check karo.',
        { duration: 6000 }
      )
      setCountdown(60) // 60 second cooldown
      setResendLoading(false)
    } catch (err: any) {
      console.error('[resend] Unexpected error:', err)
      toast.error('Network error. Please try again.')
      setResendLoading(false)
    }
  }

  // Loading
  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-indigo-950 p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Checking verification status...
          </p>
        </div>
      </div>
    )
  }

  // Verified
  if (status === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-950 dark:to-emerald-950 p-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Email Verified!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    )
  }

  // Pending
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
            We've sent a verification link to{' '}
            <strong className="break-all">{email || 'your email'}</strong>.
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Click the link in the email to activate your account.
          </p>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-xs text-blue-700 dark:text-blue-300 text-left">
            <p className="font-medium mb-1">📌 Email nahi mili?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Spam folder check karo</li>
              <li>2-3 minute wait karo</li>
              <li>Ya niche wala button dabao (60 sec cooldown)</li>
            </ul>
          </div>

          <button
            onClick={handleResend}
            disabled={resendLoading || countdown > 0}
            className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto font-medium"
          >
            {resendLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Bhej rahe hain...
              </>
            ) : countdown > 0 ? (
              `Wait ${countdown}s`
            ) : (
              'Resend verification email'
            )}
          </button>

          <Link
            href="/login"
            className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}