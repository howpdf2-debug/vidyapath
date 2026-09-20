'use client'

import { useState, useEffect } from 'react'
import { Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ShareMenu from './ShareMenu'

interface ShareButtonProps {
  title: string
  url: string
  pdfUrl?: string | null
  variant?: 'default' | 'compact'
}

export function ShareButton({
  title,
  url,
  pdfUrl = null,
  variant = 'default',
}: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // ✅ SSR-safe: navigator.share check
  useEffect(() => {
    setMounted(true)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true)
    }
  }, [])

  const handleClick = async () => {
    // Native share (mobile — WhatsApp, Telegram, etc.)
    if (canNativeShare) {
      try {
        await navigator.share({
          title,
          text: `${title} — VidyaPath पर पढ़ें`,
          url,
        })
        return
      } catch (err: any) {
        // User cancelled — don't open menu
        if (err?.name === 'AbortError') return
        // Other error — fall through to menu
      }
    }
    // Desktop OR native failed — show menu
    setOpen(true)
  }

  // ✅ Compact variant
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleClick}
          aria-label="Share"
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-semibold text-sm"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        {open && mounted && (
          <ShareMenu
            onClose={() => setOpen(false)}
            noteTitle={title}
            shareUrl={url}
            pdfUrl={pdfUrl}
          />
        )}
      </>
    )
  }

  // ✅ Default variant
  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Share"
        className="group inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm font-semibold"
      >
        <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        शेयर
      </button>
      {open && mounted && (
        <ShareMenu
          onClose={() => setOpen(false)}
          noteTitle={title}
          shareUrl={url}
          pdfUrl={pdfUrl}
        />
      )}
    </>
  )
}