'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Lock, LogIn } from 'lucide-react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Login successful!')
      router.push('/admin')
    } else {
      toast.error(data.error || 'Invalid password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 p-4">
      <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">Admin Access</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your secret key to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
            autoFocus
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Verifying...' : <><LogIn className="w-5 h-5" /> Login</>}
          </button>
        </form>
      </div>
    </div>
  )
}