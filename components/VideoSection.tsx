'use client'

import { useState } from 'react'
import { Play, Bell, ExternalLink, Video } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface VideoSectionProps {
  chapterId?: number
  chapterTitle?: string
  youtubeId?: string | null
  language?: string
  isLoggedIn?: boolean
  youtubeChannelUrl?: string
}

const DEFAULT_CHANNEL_URL = 'https://youtube.com/@vidyapath'

export function VideoSection({
  chapterId,
  chapterTitle,
  youtubeId,
  isLoggedIn = false,
  youtubeChannelUrl = DEFAULT_CHANNEL_URL,
}: VideoSectionProps) {
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notified, setNotified] = useState(false)

  const handleNotify = async () => {
    if (!isLoggedIn) {
      toast.error('Notify karne ke liye login karo')
      return
    }
    if (!chapterId) {
      toast.error('Chapter information missing')
      return
    }

    setNotifyLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please login first')
        setNotifyLoading(false)
        return
      }

      // ✅ FIX: ncert_id (not chapter_id)
      const { error } = await supabase.from('video_notifications').insert({
        user_id: user.id,
        ncert_id: chapterId,
      })

      if (error) {
        if (error.code === '23505') {
          setNotified(true)
          toast.success('Aap pehle se subscribed ho!')
        } else if (error.code === '42P01') {
          setNotified(true)
          toast.success("We'll keep you posted! 🔔")
        } else {
          console.error('[video-notify] Error:', error)
          toast.error('Something went wrong')
        }
      } else {
        setNotified(true)
        toast.success('Video ready hone pe notify karenge! 🔔')
      }
    } catch (err) {
      console.error('[video-notify] Unexpected:', err)
      toast.error('Network error')
    } finally {
      setNotifyLoading(false)
    }
  }

  // ==================== VIDEO AVAILABLE ====================
  if (youtubeId) {
    return (
      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="p-5 pb-3 flex items-center gap-2 text-lg font-semibold">
          <Video className="w-5 h-5 text-red-600 dark:text-red-400" />
          Video Explanation
        </div>
        <div className="aspect-video w-full bg-gray-900">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            title={chapterTitle || 'Video explanation'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`https://youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 transition"
          >
            <ExternalLink className="w-4 h-4" />
            YouTube pe dekho
          </Link>
          <Link
            href={youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            📺 Subscribe
          </Link>
        </div>
      </section>
    )
  }

  // ==================== VIDEO NOT AVAILABLE ====================
  return (
    <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Video className="w-5 h-5 text-red-600 dark:text-red-400" />
          Video Explanation
        </div>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 mb-4">
            <Play className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            🎬 Video coming soon!
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Is chapter ka video abhi banaya ja raha hai.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleNotify}
              disabled={notifyLoading || notified}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {notified ? (
                <>
                  <Bell className="w-4 h-4 fill-current" />
                  Subscribed!
                </>
              ) : notifyLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Wait...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Notify me
                </>
              )}
            </button>
            <Link
              href={youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 transition text-sm font-medium"
            >
              📺 YouTube channel
            </Link>
          </div>
          {!isLoggedIn && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              💡 Notify karne ke liye{' '}
              <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                login karo
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}