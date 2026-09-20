'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface BookmarkButtonProps {
  chapterId: number
  initialBookmarked?: boolean
}

export function BookmarkButton({
  chapterId,
  initialBookmarked = false,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // ✅ Mount flag for SSR safety
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Client-side user detection
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

  // ✅ Re-fetch bookmark state when user known (SSR + CSR consistency)
  useEffect(() => {
    if (!userId) {
      setBookmarked(false)
      return
    }

    let active = true
    const checkBookmark = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('ncert_id', chapterId)
        .maybeSingle()

      if (active) setBookmarked(!!data)
    }

    checkBookmark()
    return () => {
      active = false
    }
  }, [userId, chapterId])

  const toggleBookmark = async () => {
    if (!userId) {
      toast.error('Please login to bookmark')
      return
    }

    setLoading(true)

    if (bookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('ncert_id', chapterId)

      if (error) {
        toast.error(error.message)
      } else {
        setBookmarked(false)
        toast.success('Bookmark removed')
      }
    } else {
      const { error } = await supabase.from('bookmarks').insert({
        user_id: userId,
        ncert_id: chapterId,
      })

      if (error) {
        if (error.code === '23505') {
          setBookmarked(true)
          toast.success('Already bookmarked')
        } else {
          toast.error(error.message)
        }
      } else {
        setBookmarked(true)
        toast.success('Bookmarked!')
      }
    }

    setLoading(false)
  }

  // ✅ SSR safety
  if (!mounted) {
    return (
      <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    )
  }

  // ✅ Not logged in — hide
  if (!userId) return null

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition disabled:opacity-50 text-sm font-medium ${
        bookmarked
          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  )
}