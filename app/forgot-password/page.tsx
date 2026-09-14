'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/send-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        toast.success('Reset link sent! Check your email.')
      } else {
        setErrorMsg(data.error || 'Failed to send')
        toast.error(data.error || 'Failed to send')
      }
    } catch (err: any) {
      setErrorMsg('Unexpected error')
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-2xl text-center">
          <h1 className="text-2xl font-bold">Check your inbox</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            We've sent a password reset link to <strong>{email}</strong>.
          </p>
          <Link href="/login" className="mt-4 inline-block text-indigo-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
            Enter your email and we'll send you a link to reset your password.
          </p>
          {errorMsg && <p className="mt-2 text-sm text-red-500 text-center">{errorMsg}</p>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}