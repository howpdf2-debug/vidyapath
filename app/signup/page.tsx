'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getSafeNext } from '@/lib/next-param'
import Link from 'next/link'
import {
  Mail,
  Lock,
  User,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ExistingEmailWarning } from '@/components/ExistingEmailWarning'
import {
  validatePasswordStrength,
  validateEmail,
  validateName,
  validatePasswordMatch,
  isEmailAlreadyRegistered,
  parseAuthError,
} from '@/lib/auth'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const router = useRouter()

  const passwordValidation = validatePasswordStrength(password)

  // ✅ Already logged in → next or /dashboard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const safeNext = getSafeNext(params.get('next'), '/dashboard')

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.push(safeNext)
      }
    })
  }, [router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailExists(false)

    // ─── Validation ───
    const nameCheck = validateName(name)
    if (!nameCheck.valid) {
      toast.error(nameCheck.error!)
      return
    }

    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      toast.error(emailCheck.error!)
      return
    }

    if (!passwordValidation.valid) {
      toast.error(passwordValidation.errors[0])
      setPasswordTouched(true)
      return
    }

    const matchCheck = validatePasswordMatch(password, confirm)
    if (!matchCheck.valid) {
      toast.error(matchCheck.error!)
      return
    }

    setLoading(true)

    // ✅ FIX S2: Compute safeNext BEFORE signUp call
    const params = new URLSearchParams(window.location.search)
    const safeNext = getSafeNext(params.get('next'), '/dashboard')

    // ✅ FIX S1: Build emailRedirectTo with `next` param
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (safeNext !== '/dashboard') {
      callbackUrl.searchParams.set('next', safeNext)
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: callbackUrl.toString(),
        },
      })

      if (error) {
        const parsed = parseAuthError(error.message)
        if (parsed.type === 'email_exists') {
          setEmailExists(true)
        }
        toast.error(parsed.friendlyMessage)
        setLoading(false)
        return
      }

      // Detect existing email (Supabase returns empty identities)
      if (isEmailAlreadyRegistered(data.user)) {
        setEmailExists(true)
        toast.error('This email is already registered')
        setLoading(false)
        return
      }

      // ─── Success ───
      if (data.user && !data.session) {
        toast.success('Account created! Please check your email to verify.')
        const verifyUrl = new URL('/verify-email', window.location.origin)
        verifyUrl.searchParams.set('email', email.trim())
        verifyUrl.searchParams.set('next', safeNext)
        router.push(verifyUrl.pathname + verifyUrl.search)
      } else if (data.session) {
        toast.success('Account created! Welcome!')
        router.push(safeNext)
      } else {
        toast.error('Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('[signup] Error:', err)
      toast.error('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center">Create Account</h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Verify email karna zaroori hai — link inbox me aayega.
          </p>

          {emailExists && <ExistingEmailWarning email={email} variant="signup" />}

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                minLength={2}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailExists(false)
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  autoComplete="new-password"
                />
              </div>

              {(passwordTouched || password.length > 0) && (
                <div className="mt-2 space-y-1.5 text-xs">
                  <Requirement
                    met={passwordValidation.checks.length}
                    label="At least 8 characters"
                  />
                  <Requirement
                    met={passwordValidation.checks.uppercase}
                    label="At least 1 uppercase letter (A-Z)"
                  />
                  <Requirement
                    met={passwordValidation.checks.lowercase}
                    label="At least 1 lowercase letter (a-z)"
                  />
                  <Requirement
                    met={passwordValidation.checks.number}
                    label="At least 1 number (0-9)"
                  />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none ${
                    confirm && confirm !== password
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  required
                  autoComplete="new-password"
                />
              </div>
              {confirm && confirm !== password && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordValidation.valid}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-indigo-600 hover:underline font-medium"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

// ==================== REQUIREMENT CHECK ====================
function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      )}
      <span
        className={
          met
            ? 'text-green-700 dark:text-green-400'
            : 'text-gray-500 dark:text-gray-400'
        }
      >
        {label}
      </span>
    </div>
  )
}