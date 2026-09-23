'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  FileText,
  FileImage,
  Download,
  ExternalLink,
  Share2,
  Clock,
  HardDrive,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { NotesContent } from '@/components/NotesContent'
import type { Note, Lang } from '@/lib/db-types'

interface NoteCardProps {
  note: Note
  language?: Lang
}

function formatSize(kb: number | null): string {
  if (kb == null || kb <= 0) return ''
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  try {
    const t = new Date(iso).getTime()
    if (isNaN(t)) return ''
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

function formatRelative(iso: string | null): string {
  if (!iso) return ''
  try {
    const t = new Date(iso).getTime()
    if (isNaN(t)) return ''
    const diff = Date.now() - t
    if (diff < 0) return '' // future dates
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'just now'
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}h ago`
    const day = Math.floor(hr / 24)
    if (day < 30) return `${day}d ago`
    return formatDate(iso)
  } catch {
    return ''
  }
}

function estimateReadingTime(html: string | null, lang: Lang): string | null {
  if (!html) return null
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text.split(' ').filter(Boolean).length
  if (words < 30) return null
  const mins = Math.max(1, Math.round(words / 200))
  return lang === 'hi' ? `${mins} मिनट` : `${mins} min read`
}

const DIFFICULTY_META: Record<
  'easy' | 'medium' | 'hard',
  { labelEn: string; labelHi: string; cls: string }
> = {
  easy: {
    labelEn: 'Easy',
    labelHi: 'आसान',
    cls: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  },
  medium: {
    labelEn: 'Medium',
    labelHi: 'मध्यम',
    cls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  },
  hard: {
    labelEn: 'Hard',
    labelHi: 'कठिन',
    cls: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',
  },
}

export function NoteCard({ note, language = 'en' }: NoteCardProps) {
  const [sharing, setSharing] = useState(false)

  const hasHtml =
    !!note.content_html?.trim() &&
    note.content_html.trim() !== '<p><br></p>' &&
    note.content_html.trim() !== '<p></p>'
  const hasPdf = !!note.pdf_url
  const isEmpty = !hasHtml && !hasPdf

  const pdfSize = formatSize(note.pdf_size_kb)
  const pdfUploaded = formatRelative(note.pdf_uploaded_at)
  const createdAt = formatDate(note.created_at)
  const readingTime = estimateReadingTime(note.content_html, language)
  const difficulty = note.difficulty_level
    ? DIFFICULTY_META[note.difficulty_level]
    : null
  const difficultyLabel =
    difficulty && (language === 'hi' ? difficulty.labelHi : difficulty.labelEn)

  const t =
    language === 'hi'
      ? {
          pdfAvailable: 'यह note PDF में उपलब्ध है',
          empty: 'Content अभी उपलब्ध नहीं है',
          openPdf: 'PDF खोलें',
          download: 'Download',
          share: 'Share',
          sharing: 'Sharing…',
          copySuccess: 'Link copy हो गया!',
        }
      : {
          pdfAvailable: 'This note is available as PDF',
          empty: 'Content not available yet',
          openPdf: 'Open PDF',
          download: 'Download',
          share: 'Share',
          sharing: 'Sharing…',
          copySuccess: 'Link copied!',
        }

  const handleShare = async () => {
    if (!note.pdf_url || sharing) return
    setSharing(true)
    try {
      const shareData = {
        title: note.topic,
        text: `${note.topic} — VidyaPath`,
        url: note.pdf_url,
      }

      // ✅ Type-safe: standard browser API detection
      const nav = typeof navigator !== 'undefined' ? navigator : null
      const canShare = !!nav && typeof nav.share === 'function'
      const canCopy =
        !!nav &&
        typeof nav.clipboard !== 'undefined' &&
        typeof nav.clipboard.writeText === 'function'

      if (canShare) {
        await nav.share(shareData)
      } else if (canCopy) {
        await nav.clipboard.writeText(note.pdf_url)
        toast.success(t.copySuccess)
      }
    } catch {
      // User cancelled — silent
    } finally {
      setSharing(false)
    }
  }

  return (
    <article
      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md motion-safe:transition-shadow p-5 sm:p-6"
      aria-labelledby={`note-${note.id}-title`}
    >
      <header className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"
            aria-hidden="true"
          >
            {hasPdf && !hasHtml ? (
              <FileImage className="w-5 h-5" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id={`note-${note.id}-title`}
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white break-words"
              title={note.topic}
            >
              {note.topic}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
              {createdAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" aria-hidden="true" />
                  {createdAt}
                </span>
              )}
              {readingTime && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {readingTime}
                </span>
              )}
              {pdfSize && (
                <span className="inline-flex items-center gap-1">
                  <HardDrive className="w-3 h-3" aria-hidden="true" />
                  {pdfSize}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {difficultyLabel && (
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${difficulty!.cls}`}
            >
              {difficultyLabel}
            </span>
          )}
          {hasPdf && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
              aria-label="PDF available"
            >
              <FileImage className="w-3 h-3" aria-hidden="true" />
              PDF
            </span>
          )}
        </div>
      </header>

      {hasHtml && (
        <div className="prose-sm max-w-none">
          <NotesContent html={note.content_html!} />
        </div>
      )}

      {!hasHtml && hasPdf && (
        <div className="p-6 rounded-xl border-2 border-dashed border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 text-center">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 items-center justify-center mb-3 shadow-lg shadow-rose-500/20">
            <FileImage className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <p className="font-bold text-slate-900 dark:text-white mb-1">
            {t.pdfAvailable}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {pdfSize ? `${pdfSize} • ` : ''}PDF Document
            {pdfUploaded ? ` • ${pdfUploaded}` : ''}
          </p>
        </div>
      )}

      {isEmpty && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <AlertCircle
            className="w-4 h-4 text-slate-400 flex-shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            {t.empty}
          </p>
        </div>
      )}

      {hasPdf && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <a
            href={note.pdf_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
            aria-label={`${t.openPdf} — ${note.topic}`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            {t.openPdf}
          </a>
          <a
            href={note.pdf_url!}
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 border border-slate-200 dark:border-slate-700"
            aria-label={`${t.download} — ${note.topic}`}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {t.download}
          </a>
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold motion-safe:transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 border border-slate-200 dark:border-slate-700"
            aria-label={`${t.share} — ${note.topic}`}
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
            {sharing ? t.sharing : t.share}
          </button>
        </div>
      )}
    </article>
  )
}