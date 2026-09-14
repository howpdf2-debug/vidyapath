'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function BookmarkButton({ chapterId, initialBookmarked }: { chapterId: number; initialBookmarked: boolean }) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleBookmark = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please login to bookmark')
      return
    }

    setLoading(true)
    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('chapter_id', chapterId)
      if (!error) {
        setIsBookmarked(false)
        toast.success('Bookmark removed')
      } else {
        toast.error('Failed to remove bookmark')
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, chapter_id: chapterId })
      if (!error) {
        setIsBookmarked(true)
        toast.success('Bookmark added')
      } else {
        toast.error('Failed to add bookmark')
      }
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`p-2 rounded-full transition ${
        isBookmarked
          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50'
          : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
    </button>
  )
}