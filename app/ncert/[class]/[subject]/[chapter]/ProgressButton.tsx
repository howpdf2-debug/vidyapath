'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function ProgressButton({
  chapterId,
  isLoggedIn,
}: {
  chapterId: number
  isLoggedIn: boolean
}) {
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) return

    const fetchProgress = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      setUserId(session.user.id)

      // ✅ FIX: ncert_id (not chapter_id)
      const { data } = await supabase
        .from('progress')
        .select('completed')
        .eq('user_id', session.user.id)
        .eq('ncert_id', chapterId)
        .maybeSingle()

      setCompleted(data?.completed || false)
    }

    fetchProgress()
  }, [chapterId, isLoggedIn])

  const toggleComplete = async () => {
    if (!userId) {
      toast.error('Please login to track progress')
      return
    }

    setLoading(true)

    // ✅ FIX: ncert_id (not chapter_id)
    const { error } = await supabase.from('progress').upsert(
      {
        user_id: userId,
        ncert_id: chapterId,
        completed: !completed,
        last_accessed: new Date().toISOString(),
      },
      { onConflict: 'user_id,ncert_id' }
    )

    if (error) {
      toast.error(error.message)
    } else {
      setCompleted(!completed)
      toast.success(completed ? 'Marked incomplete' : 'Marked complete!')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggleComplete}
      disabled={loading}
      className={`px-4 py-2 rounded-xl transition disabled:opacity-50 text-sm font-medium ${
        completed
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {loading ? '...' : completed ? '✅ Completed' : '☑️ Mark Complete'}
    </button>
  )
}