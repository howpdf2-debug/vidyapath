import { Download, ExternalLink, FileText } from 'lucide-react'
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
// UI meta — consistent with admin
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

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function formatSize(kb: number | null, lang: 'hi' | 'en'): string {
  if (!kb) return ''
  if (kb < 1024) return lang === 'hi' ? `${kb} KB` : `${kb} KB`
  const mb = (kb / 1024).toFixed(1)
  return `${mb} MB`
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export default function ChapterPdfSection({
  pdfs,
  lang,
  chapterTitle,
}: Props) {
  // ─── D1: Hide if no PDFs ───
  if (!pdfs || pdfs.length === 0) return null

  // ─── Sort by level order ───
  const sortedPdfs = [...pdfs].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
  )

  const t =
    lang === 'hi'
      ? {
          heading: 'अध्याय PDF डाउनलोड करें',
          subheading: 'लेवल के अनुसार नोट्स PDF',
          view: 'देखें',
          download: 'डाउनलोड',
          free: 'फ्री डाउनलोड',
        }
      : {
          heading: 'Download Chapter PDFs',
          subheading: 'Level-wise notes PDF',
          view: 'View',
          download: 'Download',
          free: 'Free download',
        }

  // ─── C1: JSON-LD structured data ───
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: chapterTitle || t.heading,
    itemListElement: sortedPdfs.map((pdf, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'DigitalDocument',
        name: `${chapterTitle || 'Chapter'} — ${
          LEVEL_UI[pdf.level].label[lang]
        }`,
        encodingFormat: 'application/pdf',
        contentUrl: pdf.pdf_url,
        ...(pdf.pdf_size_kb && {
          fileSize: `${pdf.pdf_size_kb}KB`,
        }),
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

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
          <FileText
            className="w-5 h-5 text-white"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.heading}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subheading} • {t.free}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedPdfs.map((pdf) => {
          const ui = LEVEL_UI[pdf.level]
          const sizeLabel = formatSize(pdf.pdf_size_kb, lang)
          const filename = `${(chapterTitle || 'chapter')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 40)}-${pdf.level}.pdf`

          return (
            <div
              key={pdf.id}
              className={`rounded-xl border-2 ${ui.border} p-3 flex flex-col gap-2 hover:shadow-md transition`}
            >
              {/* Level badge */}
              <div className="flex items-center gap-2">
                <span
                  className="text-lg leading-none"
                  aria-hidden="true"
                >
                  {ui.emoji}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${ui.badge}`}
                >
                  {ui.label[lang]}
                </span>
                {sizeLabel && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-auto tabular-nums">
                    {sizeLabel}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto">
                {/* View button */}
                <a
                  href={pdf.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  aria-label={`${t.view} ${ui.label[lang]} PDF`}
                >
                  <ExternalLink
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  />
                  {t.view}
                </a>

                {/* Download button (with download attribute to force) */}
                <a
                  href={pdf.pdf_url}
                  download={filename}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r ${ui.gradient} text-white text-xs font-bold hover:shadow-md hover:scale-[1.02] transition`}
                  aria-label={`${t.download} ${ui.label[lang]} PDF`}
                >
                  <Download
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  />
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