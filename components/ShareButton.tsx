'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [loading, setLoading] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Check out: ${title}`, url })
      } catch (e) { /* user cancelled */ }
    } else {
      setLoading(true)
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
    >
      <Share2 className="w-4 h-4" /> Share
    </button>
  )
}