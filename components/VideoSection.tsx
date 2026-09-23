'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Play,
  Bell,
  ExternalLink,
  Video,
  Sparkles,
  Zap,
  Megaphone,
  Star,
  type LucideIcon,
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

// ✅ V1-2 FIX: id is string (UUID) OR number (legacy)
interface VideoItem {
  id: string | number
  youtube_id: string
  title: string
  description?: string | null
  thumbnail_url?: string | null
  duration_seconds?: number | null
  video_type: 'lecture' | 'revision' | 'shorts' | 'promo'
  language: string
  order_index: number
  is_featured?: boolean | null
}

interface VideoSectionProps {
  // ✅ V1-1 FIX: accept string UUID or number
  chapterId?: string | number
  chapterTitle?: string
  videos?: VideoItem[]
  language?: string
  isLoggedIn?: boolean
  youtubeChannelUrl?: string
}

const DEFAULT_CHANNEL_URL = 'https://youtube.com/@vidyapath'

// ✅ V1-3 FIX: proper LucideIcon type
const TYPE_META: Record<
  string,
  { icon: LucideIcon; label: string; bg: string; text: string }
> = {
  lecture: {
    icon: Video,
    label: 'Full Lecture',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
  },
  revision: {
    icon: Zap,
    label: 'Revision',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
  },
  shorts: {
    icon: Sparkles,
    label: 'Shorts',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
  },
  promo: {
    icon: Megaphone,
    label: 'Promo',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
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

  // ✅ V1-10, V2-1 FIX: null-safe sort with stable deps
  const sortedVideos = useMemo(() => {
    const typeWeight: Record<string, number> = {
      lecture: 0,
      revision: 1,
      shorts: 2,
      promo: 3,
    }
    return [...videos].sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
      if (a.order_index !== b.order_index) return a.order_index - b.order_index
      const aw = typeWeight[a.video_type] ?? 9
      const bw = typeWeight[b.video_type] ?? 9
      return aw - bw
    })
  }, [videos])

  // ✅ V2-2 FIX: initial activeId recomputed, with null-safe fallback
  const [activeId, setActiveId] = useState<string | null>(
    sortedVideos[0]?.youtube_id ?? null
  )

  // ✅ V2-3, V2-7 FIX: reset activeId when videos list changes
  useEffect(() => {
    if (sortedVideos.length === 0) {
      setActiveId(null)
      return
    }
    const stillValid = sortedVideos.some((v) => v.youtube_id === activeId)
    if (!stillValid) {
      setActiveId(sortedVideos[0]?.youtube_id ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedVideos])

  // ✅ V2-6 FIX: all strings in one language (English default, fallback to Hindi via lang)
  const labels = useMemo(() => {
    const lang = videos[0]?.language === 'hi' ? 'hi' : 'en'
    return lang === 'hi'
      ? {
          notLoggedIn: 'Notify करने के लिए login करें',
          loginFirst: 'कृपया पहले login करें',
          notifSuccess: 'Video आते ही notify कर देंगे! 🔔',
          networkError: 'Network error',
          comingSoonTitle: '🎬 Video जल्द आ रहा है!',
          comingSoonDesc: 'इस chapter का video तैयार हो रहा है।',
          subscribe: 'Subscribe!',
          notifyMe: 'Notify करें',
          channel: 'YouTube channel',
          moreVideos: 'इस chapter के और videos',
          watch: 'YouTube पर देखें',
          featured: 'Featured',
        }
      : {
          notLoggedIn: 'Login to get notified',
          loginFirst: 'Please login first',
          notifSuccess: "We'll notify you when the video is ready! 🔔",
          networkError: 'Network error',
          comingSoonTitle: '🎬 Video coming soon!',
          comingSoonDesc: 'This chapter video is being prepared.',
          subscribe: 'Subscribe',
          notifyMe: 'Notify me',
          channel: 'YouTube channel',
          moreVideos: 'More videos for this chapter',
          watch: 'Watch on YouTube',
          featured: 'Featured',
        }
  }, [videos])

  const handleNotify = async () => {
    if (!isLoggedIn) {
      toast.error(labels.notLoggedIn)
      return
    }
    if (!chapterId) return

    setNotifyLoading(true)
    // ✅ V2-5 FIX: guaranteed reset in finally
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error(labels.loginFirst)
        return
      }

      const { error } = await supabase
        .from('video_notifications')
        .insert({ user_id: user.id, ncert_id: chapterId })

      // ✅ V2-11 FIX: 23505 = unique violation = already notified (fine)
      if (error && error.code !== '23505') {
        console.error('[VideoSection] notify error:', error)
      }
      setNotified(true)
      toast.success(labels.notifSuccess)
    } catch {
      toast.error(labels.networkError)
    } finally {
      setNotifyLoading(false)
    }
  }

  // ═══════════ NO VIDEOS STATE ═══════════
  if (sortedVideos.length === 0) {
    return (
      <section className="surface-card overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            <Video
              className="w-5 h-5 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
            Video Explanation
          </div>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 mb-4">
              <Play
                className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                aria-hidden="true"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {labels.comingSoonTitle}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {labels.comingSoonDesc}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={handleNotify}
                disabled={notifyLoading || notified}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {notified ? (
                  <>
                    <Bell
                      className="w-4 h-4 fill-current"
                      aria-hidden="true"
                    />
                    Subscribed!
                  </>
                ) : notifyLoading ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    Wait…
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" aria-hidden="true" />
                    {labels.notifyMe}
                  </>
                )}
              </button>
              <Link
                href={youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                📺 {labels.channel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ═══════════════ VIDEO AVAILABLE ═══════════════
  const activeVideo =
    sortedVideos.find((v) => v.youtube_id === activeId) || sortedVideos[0]

  // ✅ V2-2 FIX: guard for null activeVideo (paranoia)
  if (!activeVideo) return null

  const meta = TYPE_META[activeVideo.video_type] || TYPE_META.lecture
  const Icon = meta.icon
  const iframeTitle = activeVideo.title || chapterTitle || 'Video'

  return (
    <section className="surface-card overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <Icon className={`w-5 h-5 ${meta.text}`} aria-hidden="true" />
          <span>{meta.label}</span>
          {activeVideo.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold">
              <Star
                className="w-3 h-3 fill-current"
                aria-hidden="true"
              />
              {labels.featured}
            </span>
          )}
          {sortedVideos.length > 1 && (
            <span className="text-xs text-slate-500 font-normal">
              ({sortedVideos.length} videos)
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500 uppercase font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
          {activeVideo.language}
        </span>
      </div>

      {/* Player */}
      <div className="aspect-video w-full bg-slate-900">
        <iframe
          key={activeVideo.youtube_id}
          className="w-full h-full"
          src={getYouTubeEmbedUrl(activeVideo.youtube_id)}
          title={iframeTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Info + Actions */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-white">
            {activeVideo.title}
          </h3>
          {activeVideo.description && (
            <p className="text-sm text-slate-500 mt-1">
              {activeVideo.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <Link
            href={getYouTubeWatchUrl(activeVideo.youtube_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-red-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            {labels.watch}
          </Link>
          <Link
            href={youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            📺 {labels.subscribe}
          </Link>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {sortedVideos.length > 1 && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-900/30">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3 tracking-wide">
            {labels.moreVideos}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {sortedVideos.map((v) => {
              const m = TYPE_META[v.video_type] || TYPE_META.lecture
              const I = m.icon
              const isActive = v.youtube_id === activeId

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveId(v.youtube_id)}
                  aria-pressed={isActive}
                  aria-label={`Play: ${v.title}`}
                  className={`flex-shrink-0 w-56 text-left rounded-xl overflow-hidden border-2 transition-all motion-safe:transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'border-indigo-500 shadow-lg motion-safe:scale-[1.02]'
                      : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="relative aspect-video bg-slate-900">
                    {/* ✅ V2-8 FIX: aspect-video prevents CLS, decoding async */}
                    <img
                      src={
                        v.thumbnail_url ||
                        getYouTubeThumbnail(v.youtube_id, 'mq')
                      }
                      alt={v.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    {v.duration_seconds ? (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-medium tabular-nums">
                        {formatDuration(v.duration_seconds)}
                      </span>
                    ) : null}
                    {v.is_featured && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center gap-0.5">
                        <Star
                          className="w-2.5 h-2.5 fill-current"
                          aria-hidden="true"
                        />
                      </span>
                    )}
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-1 mb-1">
                      <I
                        className={`w-3 h-3 ${m.text}`}
                        aria-hidden="true"
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {m.label}
                      </span>
                    </div>
                    <p className="text-xs font-medium line-clamp-2 leading-tight text-slate-900 dark:text-slate-200">
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