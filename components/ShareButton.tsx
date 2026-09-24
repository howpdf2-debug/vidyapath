'use client'

import { useState, useEffect } from 'react'
import { Share2 } from 'lucide-react'
import ShareMenu from './ShareMenu'

interface ShareButtonProps {
  title: string
  url: string
  pdfUrl?: string | null
  variant?: 'default' | 'compact'
  language?: 'en' | 'hi'
}

export function ShareButton({
  title,
  url,
  pdfUrl = null,
  variant = 'default',
  language = 'en',
}: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [mounted, setMounted] = useState(false)

  const isHi = language === 'hi'

  const labels = {
    button: isHi ? 'शेयर' : 'Share',
    nativeText: isHi
      ? `${title} — VidyaPath पर पढ़ें`
      : `${title} — Read on VidyaPath`,
  }

  // ✅ S3: check canShare API too
  useEffect(() => {
    setMounted(true)
    if (typeof navigator === 'undefined') return
    if (typeof navigator.share !== 'function') return
    setCanNativeShare(true)
  }, [])

  const handleClick = async () => {
    if (canNativeShare) {
      try {
        // ✅ S4: include PDF link if available
        const shareUrl = pdfUrl || url
        const shareData: ShareData = {
          title,
          text: labels.nativeText,
          url: shareUrl,
        }

        // ✅ S3: verify canShare if available
        if (
          typeof navigator.canShare === 'function' &&
          !navigator.canShare(shareData)
        ) {
          // Fall through to menu
          setOpen(true)
          return
        }

        await navigator.share(shareData)
        return
      } catch (err: any) {
        // User cancelled — don't fall through
        if (err?.name === 'AbortError') return
        // ✅ S5: other error — silently fall through (menu still available)
        console.warn('[share] native failed:', err)
      }
    }
    setOpen(true)
  }

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleClick}
          aria-label={isHi ? 'शेयर करें' : 'Share'}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-semibold text-sm"
        >
          <Share2 className="w-4 h-4" />
          {labels.button}
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

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={isHi ? 'शेयर करें' : 'Share'}
        className="group inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm font-semibold"
      >
        <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        {labels.button}
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