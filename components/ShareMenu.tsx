'use client'

import { useEffect, useState, useRef } from 'react'
import {
  X, Copy, MessageCircle, Send, Twitter, Facebook,
  Linkedin, Mail, Link2, Check, FileText, Share2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareMenuProps {
  onClose: () => void
  noteTitle: string
  shareUrl: string
  pdfUrl: string | null
}

export default function ShareMenu({
  onClose,
  noteTitle,
  shareUrl,
  pdfUrl,
}: ShareMenuProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // ✅ SSR-safe checks
  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    )
    setIsMobile(
      typeof navigator !== 'undefined' &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    )
  }, [])

  // ✅ Body scroll lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [])

  // ✅ Escape key + focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    // Focus on close button for accessibility
    closeButtonRef.current?.focus()
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // ✅ Clipboard with fallback
  const copyToClipboard = async (text: string, key: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(key)
      toast.success(`${label} copy हो गया!`)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('Copy fail — manually copy करें')
    }
  }

  const handleNative = async () => {
    try {
      await navigator.share({
        title: noteTitle,
        text: `${noteTitle} — VidyaPath पर पढ़ें 📚`,
        url: shareUrl,
      })
      onClose()
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        toast.error('Share fail')
      }
    }
  }

  const handlePlatform = (id: string) => {
    const url = encodeURIComponent(shareUrl)
    const text = encodeURIComponent(`${noteTitle} — VidyaPath पर पढ़ें 📚`)
    const title = encodeURIComponent(noteTitle)

    // ✅ WhatsApp: desktop पर web.whatsapp.com, mobile पर native
    const whatsappUrl = isMobile
      ? `https://wa.me/?text=${text}%20${url}`
      : `https://web.whatsapp.com/send?text=${text}%20${url}`

    // ✅ Email with PDF link included
    const emailBody = pdfUrl
      ? `${text}%20${url}%0A%0A📄 PDF: ${encodeURIComponent(pdfUrl)}`
      : `${text}%20${url}`

    const links: Record<string, string> = {
      whatsapp: whatsappUrl,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      email: `mailto:?subject=${title}&body=${emailBody}`,
    }

    const link = links[id]
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
      onClose()
    }
  }

  const platforms = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, bg: 'from-green-500 to-emerald-600' },
    { id: 'telegram', label: 'Telegram', icon: <Send className="w-5 h-5" />, bg: 'from-sky-400 to-blue-500' },
    { id: 'twitter', label: 'Twitter', icon: <Twitter className="w-5 h-5" />, bg: 'from-sky-500 to-blue-600' },
    { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-5 h-5" />, bg: 'from-blue-600 to-blue-800' },
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, bg: 'from-blue-700 to-indigo-800' },
    { id: 'email', label: 'Email', icon: <Mail className="w-5 h-5" />, bg: 'from-slate-600 to-slate-800' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Share menu"
    >
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 flex-shrink-0">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base">शेयर करें</h3>
                <p className="text-[10px] opacity-90">दोस्तों के साथ</p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close share menu"
              className="p-1.5 rounded-lg hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Native share */}
          {canNativeShare && (
            <div className="px-5 pt-4">
              <button
                onClick={handleNative}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Share2 className="w-4 h-4" />
                सभी Apps में share करें
              </button>
            </div>
          )}

          {/* Platform Grid — responsive */}
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              प्लेटफ़ॉर्म चुनें
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePlatform(p.id)}
                  aria-label={`Share on ${p.label}`}
                  className="group flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                >
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${p.bg} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    {p.icon}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center leading-tight">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Copy Links */}
          <div className="px-5 pb-5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              लिंक copy करें
            </p>

            {/* Page URL */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
              <input
                type="text"
                readOnly
                value={shareUrl}
                aria-label="Page link"
                className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none truncate"
              />
              <button
                onClick={() => copyToClipboard(shareUrl, 'page', 'Page link')}
                aria-label="Copy page link"
                className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition"
              >
                {copied === 'page' ? (
                  <>
                    <Check className="w-3 h-3" /> Done
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>

            {/* PDF URL */}
            {pdfUrl && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50">
                <FileText className="w-4 h-4 text-red-500 flex-shrink-0 ml-1" />
                <input
                  type="text"
                  readOnly
                  value={pdfUrl}
                  aria-label="PDF link"
                  className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none truncate"
                />
                <button
                  onClick={() => copyToClipboard(pdfUrl, 'pdf', 'PDF link')}
                  aria-label="Copy PDF link"
                  className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
                >
                  {copied === 'pdf' ? (
                    <>
                      <Check className="w-3 h-3" /> Done
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> PDF
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}