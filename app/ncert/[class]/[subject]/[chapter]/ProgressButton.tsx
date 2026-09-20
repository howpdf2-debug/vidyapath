'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ProgressButtonProps {
  chapterId: number
  isLoggedIn?: boolean
}

export function ProgressButton({ chapterId }: ProgressButtonProps) {
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // ✅ Mount flag for SSR hydration safety
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Client-side user detection (reliable)
  useEffect(() => {
    let active = true

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (active) setUserId(user?.id || null)
    }

    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) setUserId(session?.user?.id || null)
      }
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // ✅ Fetch progress once we know user
  useEffect(() => {
    if (!userId) {
      setCompleted(false)
      return
    }

    let active = true
    const fetchProgress = async () => {
      const { data } = await supabase
        .from('progress')
        .select('completed')
        .eq('user_id', userId)
        .eq('ncert_id', chapterId)
        .maybeSingle()

      if (active) setCompleted(data?.completed || false)
    }

    fetchProgress()
    return () => {
      active = false
    }
  }, [userId, chapterId])

  const toggleComplete = async () => {
    if (!userId) {
      toast.error('Please login to track progress')
      return
    }

    setLoading(true)
    const newCompleted = !completed

    const { error } = await supabase.from('progress').upsert(
      {
        user_id: userId,
        ncert_id: chapterId,
        completed: newCompleted,
        last_accessed: new Date().toISOString(),
      },
      { onConflict: 'user_id,ncert_id' }
    )

    if (error) {
      toast.error(error.message || 'Failed to update progress')
    } else {
      setCompleted(newCompleted)
      toast.success(newCompleted ? 'Marked complete!' : 'Marked incomplete')
    }
    setLoading(false)
  }

  // ✅ SSR safety: don't render until mounted
  if (!mounted) {
    return (
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    )
  }

  // ✅ Not logged in — hide button (no flash)
  if (!userId) return null

  return (
    <button
      onClick={toggleComplete}
      disabled={loading}
      className={`px-4 py-2 rounded-xl transition disabled:opacity-50 text-sm font-medium ${
        completed
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
      aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {loading ? '...' : completed ? '✅ Completed' : '☑️ Mark Complete'}
    </button>
  )
}