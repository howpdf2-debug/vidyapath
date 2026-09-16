'use client'

import { useState, useMemo } from 'react'
import {
  Play, Bell, ExternalLink, Video, Sparkles, Zap, Megaphone,
  Star, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  getYouTubeWatchUrl,
  formatDuration,
} from '@/lib/youtube'

interface VideoItem {
  id: number
  youtube_id: string
  title: string
  description?: string | null
  thumbnail_url?: string | null
  duration_seconds?: number | null
  video_type: 'lecture' | 'revision' | 'shorts' | 'promo'
  language: string
  order_index: number
  is_featured?: boolean
}

interface VideoSectionProps {
  chapterId?: number
  chapterTitle?: string
  videos?: VideoItem[]
  language?: string
  isLoggedIn?: boolean
  youtubeChannelUrl?: string
}

const DEFAULT_CHANNEL_URL = 'https://youtube.com/@vidyapath'

const TYPE_META: Record<string, { icon: any; label: string; bg: string; text: string }> = {
  lecture: { icon: Video, label: 'Full Lecture', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400' },
  revision: { icon: Zap, label: 'Revision', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400' },
  shorts: { icon: Sparkles, label: 'Shorts', bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400' },
  promo: { icon: Megaphone, label: 'Promo', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400' },
}

export function VideoSection({
  chapterId,
  chapterTitle,
  videos = [],
  isLoggedIn = false,
  youtubeChannelUrl = DEFAULT_CHANNEL_URL,
}: VideoSectionProps) {
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notified, setNotified] = useState(false)

  // Sort: featured first, then order_index, then lecture before shorts
  const sortedVideos = useMemo(() => {
    const typeWeight: Record<string, number> = { lecture: 0, revision: 1, shorts: 2, promo: 3 }
    return [...videos].sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
      if (a.order_index !== b.order_index) return a.order_index - b.order_index
      return (typeWeight[a.video_type] ?? 9) - (typeWeight[b.video_type] ?? 9)
    })
  }, [videos])

  const [activeId, setActiveId] = useState<string | null>(sortedVideos[0]?.youtube_id || null)
  const activeVideo = sortedVideos.find((v) => v.youtube_id === activeId) || sortedVideos[0]

  const handleNotify = async () => {
    if (!isLoggedIn) {
      toast.error('Notify karne ke liye login karo')
      return
    }
    if (!chapterId) return

    setNotifyLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login first')
        return
      }

      const { error } = await supabase
        .from('video_notifications')
        .insert({ user_id: user.id, ncert_id: chapterId })

      if (error && error.code !== '23505') {
        console.error(error)
      }
      setNotified(true)
      toast.success('Notify kar denge jab video ready hogi! 🔔')
    } catch {
      toast.error('Network error')
    } finally {
      setNotifyLoading(false)
    }
  }

  // ═══════════ NO VIDEOS STATE ═══════════
  if (sortedVideos.length === 0) {
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
            <h3 className="text-lg font-bold">🎬 Video coming soon!</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Is chapter ka video abhi banaya ja raha hai.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleNotify}
                disabled={notifyLoading || notified}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 text-sm font-medium"
              >
                {notified ? <><Bell className="w-4 h-4 fill-current" /> Subscribed!</> :
                 notifyLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Wait...</> :
                 <><Bell className="w-4 h-4" /> Notify me</>}
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
          </div>
        </div>
      </section>
    )
  }

  // ═══════════ VIDEO AVAILABLE ═══════════
  const meta = TYPE_META[activeVideo.video_type] || TYPE_META.lecture
  const Icon = meta.icon

  return (
    <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Icon className={`w-5 h-5 ${meta.text}`} />
          <span>{meta.label}</span>
          {activeVideo.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold">
              <Star className="w-3 h-3 fill-current" /> Featured
            </span>
          )}
          {sortedVideos.length > 1 && (
            <span className="text-xs text-gray-500 font-normal">
              ({sortedVideos.length} videos)
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 uppercase font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
          {activeVideo.language}
        </span>
      </div>

      {/* Player */}
      <div className="aspect-video w-full bg-gray-900">
        <iframe
          key={activeVideo.youtube_id}
          className="w-full h-full"
          src={getYouTubeEmbedUrl(activeVideo.youtube_id)}
          title={activeVideo.title || chapterTitle || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Info + Actions */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base">{activeVideo.title}</h3>
          {activeVideo.description && (
            <p className="text-sm text-gray-500 mt-1">{activeVideo.description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={getYouTubeWatchUrl(activeVideo.youtube_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 transition"
          >
            <ExternalLink className="w-4 h-4" /> Watch on YouTube
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
      </div>

      {/* Thumbnail Strip (if multiple videos) */}
      {sortedVideos.length > 1 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-900/30">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">
            More videos for this chapter
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {sortedVideos.map((v) => {
              const m = TYPE_META[v.video_type] || TYPE_META.lecture
              const I = m.icon
              const isActive = v.youtube_id === activeId

              return (
                <button
                  key={v.id}
                  onClick={() => setActiveId(v.youtube_id)}
                  className={`flex-shrink-0 w-56 text-left rounded-xl overflow-hidden border-2 transition-all ${
                    isActive
                      ? 'border-indigo-500 shadow-lg scale-[1.02]'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={v.thumbnail_url || getYouTubeThumbnail(v.youtube_id, 'mq')}
                      alt={v.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {v.duration_seconds && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
                        {formatDuration(v.duration_seconds)}
                      </span>
                    )}
                    {v.is_featured && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </span>
                    )}
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-1 mb-1">
                      <I className={`w-3 h-3 ${m.text}`} />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        {m.label}
                      </span>
                    </div>
                    <p className="text-xs font-medium line-clamp-2 leading-tight">
                      {v.title}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}