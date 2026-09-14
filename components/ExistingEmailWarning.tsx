'use client'

import Link from 'next/link'
import { AlertCircle, LogIn, Mail, KeyRound } from 'lucide-react'

interface ExistingEmailWarningProps {
  email: string
  variant?: 'signup' | 'login'
}

/**
 * Shows a friendly message when email is already registered.
 * Provides 3 action links: Login, Resend Verification, Forgot Password.
 */
export function ExistingEmailWarning({
  email,
  variant = 'signup',
}: ExistingEmailWarningProps) {
  const encodedEmail = encodeURIComponent(email)

  return (
    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
            Ye email already registered hai
          </p>
          <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
            Aap inme se koi option choose karo:
          </p>

          <div className="mt-3 space-y-2">
            {/* Option 1: Login */}
            <Link
              href="/login"
              className="flex items-center gap-2 w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition text-sm font-medium"
            >
              <LogIn className="w-4 h-4 flex-shrink-0" />
              <span>Login karo apne account me</span>
            </Link>

            {/* Option 2: Resend Verification */}
            <Link
              href={`/verify-email?email=${encodedEmail}`}
              className="flex items-center gap-2 w-full px-3 py-2 bg-white dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 rounded-lg border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/60 transition text-sm font-medium"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>Verification email dobara bhejo</span>
            </Link>

            {/* Option 3: Forgot Password */}
            <Link
              href="/forgot-password"
              className="flex items-center gap-2 w-full px-3 py-2 bg-white dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 rounded-lg border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/60 transition text-sm font-medium"
            >
              <KeyRound className="w-4 h-4 flex-shrink-0" />
              <span>Password bhool gaye? Reset karo</span>
            </Link>
          </div>

          <p className="text-amber-600 dark:text-amber-400 text-xs mt-3">
            💡 Agar aap naya account banana chahte ho, to alag email use karo.
          </p>
        </div>
      </div>
    </div>
  )
}