'use client'

import { useState, useEffect } from 'react'
import { Bookmark, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface BookmarkButtonProps {
  chapterId: string | number
  initialBookmarked?: boolean
  language?: 'en' | 'hi'
}

export function BookmarkButton({
  chapterId,
  initialBookmarked = false,
  language = 'en',
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [userResolved, setUserResolved] = useState(false)

  // ✅ B1: Coerce chapterId → number (INTEGER column in DB)
  const ncertId = Number(chapterId)

  const isHi = language === 'hi'
  const labels = {
    bookmark: isHi ? 'Bookmark' : 'Bookmark',
    bookmarked: isHi ? 'Bookmarked' : 'Bookmarked',
    saving: isHi ? 'Save ho raha...' : 'Saving...',
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ C4 pattern: active flag for cleanup
  useEffect(() => {
    let active = true

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (active) {
        setUserId(user?.id || null)
        setUserResolved(true)
      }
    }

    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) {
          setUserId(session?.user?.id || null)
          setUserResolved(true)
        }
      }
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setBookmarked(false)
      return
    }

    // ✅ B1: guard invalid ncertId
    if (!Number.isFinite(ncertId) || ncertId <= 0) return

    let active = true
    const checkBookmark = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('ncert_id', ncertId) // ✅ number
        .maybeSingle()

      if (active) setBookmarked(!!data)
    }

    checkBookmark()
    return () => {
      active = false
    }
  }, [userId, ncertId])

  const toggleBookmark = async () => {
    if (!userId) {
      toast.error(
        isHi
          ? 'Bookmark karne ke liye login karo 🔖'
          : 'Login to bookmark 🔖'
      )
      return
    }

    // ✅ B1: sanity check
    if (!Number.isFinite(ncertId) || ncertId <= 0) {
      toast.error(isHi ? 'Invalid chapter' : 'Invalid chapter')
      return
    }

    setLoading(true)

    if (bookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('ncert_id', ncertId)

      if (error) {
        // ✅ B5: generic fallback, log raw
        console.error('[bookmark] delete:', error)
        toast.error(
          isHi
            ? 'Bookmark hata nahi paye. Dobara try karo'
            : 'Could not remove. Try again'
        )
      } else {
        setBookmarked(false)
        toast.success(
          isHi ? 'Bookmark hata diya' : 'Bookmark removed'
        )
      }
    } else {
      const { error } = await supabase.from('bookmarks').insert({
        user_id: userId,
        ncert_id: ncertId,
      })

      if (error) {
        if (error.code === '23505') {
          setBookmarked(true)
          toast.success(
            isHi ? 'Pehle se bookmark hai ✓' : 'Already bookmarked ✓'
          )
        } else {
          console.error('[bookmark] insert:', error)
          toast.error(
            isHi
              ? 'Bookmark save nahi hua. Dobara try karo'
              : 'Could not save. Try again'
          )
        }
      } else {
        setBookmarked(true)
        toast.success(
          isHi ? 'Bookmark ho gaya 🔖' : 'Bookmarked 🔖'
        )
      }
    }

    setLoading(false)
  }

  // ✅ B4: keep skeleton until user resolution completes
  if (!mounted || !userResolved) {
    return (
      <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    )
  }

  // Hide if not logged in
  if (!userId) return null

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      // ✅ B2: aria-pressed for toggle semantics
      aria-pressed={bookmarked}
      aria-label={
        bookmarked
          ? isHi
            ? 'Bookmark hataao'
            : 'Remove bookmark'
          : isHi
            ? 'Bookmark karo'
            : 'Add bookmark'
      }
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition disabled:opacity-50 text-sm font-medium ${
        bookmarked
          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {/* ✅ B3: loading spinner replaces icon */}
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
      )}
      <span>
        {loading
          ? labels.saving
          : bookmarked
            ? labels.bookmarked
            : labels.bookmark}
      </span>
    </button>
  )
}