import Link from 'next/link'
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  FileImage,
  Clock,
  Calendar,
} from 'lucide-react'

export interface PreviewNote {
  id: string
  topic: string
  difficulty_level: string | null
  pdf_url: string | null
  created_at?: string
}

interface NotesPreviewCardProps {
  href: string
  notes: PreviewNote[]
  language: 'en' | 'hi'
}

// ✅ N7 FIX: reading time estimate
function estimateReadTime(count: number): string {
  const mins = Math.max(3, count * 4)
  return `${mins} min`
}

// ✅ N8 FIX: new badge if recent
function isRecent(iso: string | undefined): boolean {
  if (!iso) return false
  try {
    const t = new Date(iso).getTime()
    if (isNaN(t)) return false
    return Date.now() - t < 7 * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

const DIFFICULTY_CLS: Record<string, string> = {
  easy: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  medium: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  hard: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',
}

export function NotesPreviewCard({
  href,
  notes,
  language,
}: NotesPreviewCardProps) {
  if (notes.length === 0) return null

  const total = notes.length
  const hasPdf = notes.some((n) => !!n.pdf_url)
  const visibleNotes = notes.slice(0, 4)
  const remaining = total - visibleNotes.length
  const isAnyNew = notes.some((n) => isRecent(n.created_at))
  const readTime = estimateReadTime(total)

  const t =
    language === 'hi'
      ? {
          title: 'इस चैप्टर के Detailed Notes',
          subtitle:
            'Admin द्वारा तैयार — diagrams, examples, PDFs सब एक जगह',
          cta: 'सभी Notes पढ़ें',
          pdfBadge: 'PDF उपलब्ध',
          newBadge: 'नया',
          countLabel: (n: number) => `${n} topic${n > 1 ? 's' : ''}`,
          moreLabel: (n: number) => `+${n} और`,
        }
      : {
          title: 'Detailed Notes for this Chapter',
          subtitle:
            'Handcrafted with diagrams, examples, and PDFs — all in one place',
          cta: 'Read all Notes',
          pdfBadge: 'PDF available',
          newBadge: 'New',
          countLabel: (n: number) => `${n} topic${n > 1 ? 's' : ''}`,
          moreLabel: (n: number) => `+${n} more`,
        }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/60 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20 p-5 sm:p-6">
      {/* Decorative glow */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              {t.title}
              <Sparkles
                className="w-4 h-4 text-indigo-500 flex-shrink-0"
                aria-hidden="true"
              />
              {/* ✅ N8 FIX: New badge */}
              {isAnyNew && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  {t.newBadge}
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* ✅ N5 FIX: Topic chips with difficulty indicator */}
        <div className="flex flex-wrap gap-2 mb-4">
          {visibleNotes.map((n) => (
            <span
              key={n.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm max-w-full"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  n.difficulty_level === 'easy'
                    ? 'bg-emerald-500'
                    : n.difficulty_level === 'hard'
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                }`}
                aria-hidden="true"
              />
              {/* ✅ N6 FIX: better responsive max-width */}
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {n.topic}
              </span>
              {n.pdf_url && (
                <FileImage
                  className="w-3 h-3 text-rose-500 flex-shrink-0"
                  aria-label="PDF available"
                />
              )}
            </span>
          ))}
          {remaining > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              {t.moreLabel(remaining)}
            </span>
          )}
        </div>

        {/* ✅ N7 FIX: Meta line with reading time + count + PDF */}
        <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 font-semibold">
            <BookOpen className="w-3 h-3" aria-hidden="true" />
            {t.countLabel(total)}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {readTime}
          </span>
          {hasPdf && (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
              <FileImage className="w-3 h-3" aria-hidden="true" />
              {t.pdfBadge}
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={href}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          {t.cta}
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  )
}