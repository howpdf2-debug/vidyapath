'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function BookmarkButton({
  chapterId,
  initialBookmarked,
}: {
  chapterId: number
  initialBookmarked: boolean
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  const toggleBookmark = async () => {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      toast.error('Please login to bookmark')
      setLoading(false)
      return
    }

    if (bookmarked) {
      // Remove bookmark
      // ✅ FIX: ncert_id
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', session.user.id)
        .eq('ncert_id', chapterId)

      if (error) {
        toast.error(error.message)
      } else {
        setBookmarked(false)
        toast.success('Bookmark removed')
      }
    } else {
      // Add bookmark
      // ✅ FIX: ncert_id
      const { error } = await supabase.from('bookmarks').insert({
        user_id: session.user.id,
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
      <Bookmark
        className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`}
      />
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  )
}