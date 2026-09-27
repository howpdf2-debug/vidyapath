import { Download, ExternalLink, FileText, AlertCircle } from 'lucide-react'
import type { NoteLevel } from '@/lib/db-types'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
export interface ChapterPdf {
  id: number
  ncert_id: number
  level: NoteLevel
  pdf_url: string
  pdf_size_kb: number | null
  title: string | null
}

interface Props {
  pdfs: ChapterPdf[]
  lang: 'hi' | 'en'
  chapterTitle?: string | null
}

// ═══════════════════════════════════════════════════════════════
// UI meta
// ═══════════════════════════════════════════════════════════════
const LEVEL_UI: Record<
  NoteLevel,
  {
    emoji: string
    label: { hi: string; en: string }
    gradient: string
    badge: string
    border: string
  }
> = {
  basic: {
    emoji: '🟢',
    label: { hi: 'बेसिक', en: 'Basic' },
    gradient: 'from-emerald-500 to-green-500',
    badge:
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
  },
  advance: {
    emoji: '🟠',
    label: { hi: 'एडवांस', en: 'Advance' },
    gradient: 'from-amber-500 to-orange-500',
    badge:
      'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
  },
  pro: {
    emoji: '🔴',
    label: { hi: 'प्रो', en: 'Pro' },
    gradient: 'from-rose-500 to-red-500',
    badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
  },
}

const LEVEL_ORDER: NoteLevel[] = ['basic', 'advance', 'pro']
const TOTAL_LEVELS = 3
const LARGE_FILE_KB = 5 * 1024 // 5 MB

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function formatSize(kb: number | null): string {
  if (!kb || kb <= 0) return ''
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function sanitizeFilename(title: string | null | undefined, level: NoteLevel): string {
  const base = (title || 'chapter')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${base || 'chapter'}-${level}.pdf`
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export default function ChapterPdfSection({
  pdfs,
  lang,
  chapterTitle,
}: Props) {
  // Hide if no PDFs
  if (!pdfs || pdfs.length === 0) return null

  const sortedPdfs = [...pdfs].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
  )

  const availableCount = sortedPdfs.length
  const hasMissing = availableCount < TOTAL_LEVELS

  const t =
    lang === 'hi'
      ? {
          heading: 'अध्याय PDF डाउनलोड करें',
          subheading: 'लेवल के अनुसार नोट्स PDF • फ्री डाउनलोड',
          levelsAvailable: (n: number) =>
            `${TOTAL_LEVELS} में से ${n} लेवल उपलब्ध`,
          allAvailable: 'सभी लेवल उपलब्ध',
          view: 'देखें',
          download: 'डाउनलोड',
          largeFile: 'बड़ी फाइल',
        }
      : {
          heading: 'Download Chapter PDFs',
          subheading: 'Level-wise notes PDF • Free download',
          levelsAvailable: (n: number) =>
            `${n} of ${TOTAL_LEVELS} levels available`,
          allAvailable: 'All levels available',
          view: 'View',
          download: 'Download',
          largeFile: 'Large file',
        }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: chapterTitle || t.heading,
    numberOfItems: availableCount,
    itemListElement: sortedPdfs.map((pdf, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'DigitalDocument',
        name: `${chapterTitle || 'Chapter'} — ${LEVEL_UI[pdf.level].label[lang]}`,
        encodingFormat: 'application/pdf',
        contentUrl: pdf.pdf_url,
        ...(pdf.pdf_size_kb && { fileSize: `${pdf.pdf_size_kb}KB` }),
      },
    })),
  }

  return (
    <section
      aria-label={t.heading}
      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── Header ─── */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.heading}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subheading}
          </p>
          {/* Level availability count */}
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                hasMissing
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {hasMissing
                ? t.levelsAvailable(availableCount)
                : t.allAvailable}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedPdfs.map((pdf) => {
          const ui = LEVEL_UI[pdf.level]
          const sizeLabel = formatSize(pdf.pdf_size_kb)
          const isLargeFile =
            typeof pdf.pdf_size_kb === 'number' &&
            pdf.pdf_size_kb > LARGE_FILE_KB
          const filename = sanitizeFilename(chapterTitle, pdf.level)

          return (
            <div
              key={pdf.id}
              className={`rounded-xl border-2 ${ui.border} p-3 flex flex-col gap-2 hover:shadow-md transition`}
            >
              {/* Level badge + size */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg leading-none" aria-hidden="true">
                  {ui.emoji}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${ui.badge}`}
                >
                  {ui.label[lang]}
                </span>
                {sizeLabel && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-auto tabular-nums inline-flex items-center gap-1">
                    {isLargeFile && (
                      <AlertCircle
                        className="w-3 h-3 text-amber-500"
                        aria-label={t.largeFile}
                      />
                    )}
                    {sizeLabel}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto">
                <a
                  href={pdf.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  aria-label={`${t.view} ${ui.label[lang]} PDF`}
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  {t.view}
                </a>

                <a
                  href={pdf.pdf_url}
                  download={filename}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r ${ui.gradient} text-white text-xs font-bold hover:shadow-md hover:scale-[1.02] transition`}
                  aria-label={`${t.download} ${ui.label[lang]} PDF`}
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  {t.download}
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}