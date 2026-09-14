'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Fetch user on mount
  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error fetching user:', error)
      router.push('/login')
      return
    }
    if (data.user) {
      setUser(data.user)
      setName(data.user.user_metadata?.full_name || '')
    } else {
      router.push('/login')
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update name if changed
      if (name !== user?.user_metadata?.full_name) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: name },
        })
        if (error) {
          toast.error('Failed to update name: ' + error.message)
          setLoading(false)
          return
        }
        toast.success('Name updated successfully!')
        // Refresh user data to reflect new name
        await fetchUser()
      }

      // Update password if provided
      if (password) {
        if (password !== confirm) {
          toast.error('Passwords do not match')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          toast.error('Minimum 6 characters')
          setLoading(false)
          return
        }
        const { error } = await supabase.auth.updateUser({ password })
        if (error) {
          toast.error('Failed to update password: ' + error.message)
        } else {
          toast.success('Password updated!')
          // Clear password fields
          setPassword('')
          setConfirm('')
        }
      }

      // If no changes were made, show a message
      if (name === user?.user_metadata?.full_name && !password) {
        toast('No changes to save')
      }

    } catch (err: any) {
      toast.error('Unexpected error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="p-6 text-center">Loading...</div>
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password (leave blank to keep)</label>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        {password && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}