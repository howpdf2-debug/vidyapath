'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function VerifyEmailContent() {
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [status, setStatus] = useState<'checking' | 'verified' | 'pending'>(
    'checking'
  )
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

        // ✅ If session exists, email is verified (Confirm email ON)
        if (session?.user) {
          console.log('[verify-email] ✅ Session found — verified!')
          setStatus('verified')

          // Redirect after showing success briefly
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

    // Check immediately
    checkSession()

    // Also listen to auth changes (in case session is set right after)
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

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found. Please sign up again.')
      return
    }
    setResendLoading(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Verification email resent! Check your inbox.')
    }
    setResendLoading(false)
  }

  // Loading state
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

  // Verified — success
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

  // Pending — not verified yet
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
          We&apos;ve sent a verification link to{' '}
          <strong>{email || 'your email'}</strong>.
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Click the link in the email to activate your account.
        </p>

        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
        >
          {resendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Resend verification email
        </button>

        <Link
          href="/login"
          className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
        >
          Back to Login
        </Link>
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