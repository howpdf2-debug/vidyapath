// components/FaqSection.tsx
// P3.8 FINAL: Bilingual FAQ with page-language-aware rendering.
//
// Language principle:
//   • English page → English FAQs only
//   • Hindi page  → Hindi FAQs (primary) + English FAQs (secondary subsection)
//   • Fallback: if page language empty, show other language with badge
//
// Zero client JS. Native <details>. SEO-safe. Print-friendly.

import { HelpCircle, Globe } from 'lucide-react'
import type { FaqPublic, FaqLang, FaqBundle } from '@/lib/db-types'

interface FaqSectionProps {
  faqs: FaqBundle
  /** Page language: determines primary + secondary list */
  lang?: FaqLang
  className?: string
}

const LABELS = {
  en: {
    heading: 'Frequently Asked Questions',
    subheading: 'Common doubts, answered.',
    secondaryTitle: 'Also in Hindi',
    fallbackNote: 'Available in Hindi',
  },
  hi: {
    heading: 'FAQ · अक्सर पूछे जाने वाले प्रश्न',
    subheading: 'आम सवालों के जवाब — एक जगह।',
    secondaryTitle: 'Also in English · English में भी उपलब्ध',
    fallbackNote: 'अंग्रेज़ी में उपलब्ध',
  },
} as const

export function FaqSection({
  faqs,
  lang = 'en',
  className = '',
}: FaqSectionProps) {
  const labels = LABELS[lang]

  // ── Determine primary + secondary lists ──
  const primary =
    lang === 'hi' && faqs.hi.length > 0
      ? faqs.hi
      : lang === 'en' && faqs.en.length > 0
        ? faqs.en
        : []

  const secondary = lang === 'hi' ? faqs.en : []

  const isFallback = primary.length === 0
  const fallbackList = isFallback
    ? lang === 'hi'
      ? faqs.en
      : faqs.hi
    : []

  if (
    primary.length === 0 &&
    secondary.length === 0 &&
    fallbackList.length === 0
  ) {
    return null
  }

  const totalVisible = primary.length + fallbackList.length + secondary.length

  return (
    <section
      id="faq"
      className={`surface-card overflow-hidden ${className}`}
      aria-labelledby="faq-heading"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <span
            className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400"
            aria-hidden="true"
          >
            <HelpCircle className="w-4 h-4" />
          </span>
          <h2 id="faq-heading" className="text-base sm:text-lg leading-tight">
            {labels.heading}
          </h2>
          <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {totalVisible}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          {labels.subheading}
        </p>
      </div>

      {/* Primary list */}
      {primary.length > 0 && (
        <FaqList faqs={primary} startIndex={1} />
      )}

      {/* Fallback list (opposite language) */}
      {isFallback && fallbackList.length > 0 && (
        <>
          <div className="px-5 sm:px-6 py-3 bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/40 flex items-center gap-2">
            <Globe
              className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400"
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
              {labels.fallbackNote}
            </span>
          </div>
          <FaqList faqs={fallbackList} startIndex={1} />
        </>
      )}

      {/* Secondary list — English alongside Hindi (page lang = hi) */}
      {secondary.length > 0 && (
        <>
          <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Globe
              className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {labels.secondaryTitle}
            </span>
            <span className="ml-auto text-xs text-slate-500 dark:text-slate-500 tabular-nums">
              {secondary.length}
            </span>
          </div>
          <FaqList faqs={secondary} startIndex={primary.length + 1} />
        </>
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Inner list — re-usable
// ─────────────────────────────────────────────────────────────
function FaqList({
  faqs,
  startIndex,
}: {
  faqs: FaqPublic[]
  startIndex: number
}) {
  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {faqs.map((faq, idx) => (
        <details
          key={faq.id}
          className="group faq-item [&_summary::-webkit-details-marker]:hidden [&_summary]:list-none"
          lang={faq.lang === 'hi' ? 'hi' : 'en'}
        >
          <summary className="flex items-start gap-3 cursor-pointer list-none p-4 sm:p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 focus-visible:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 border-l-2 border-transparent open:border-brand-500 open:bg-slate-50/60 dark:open:bg-slate-800/30">
            <span
              className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold tabular-nums mt-0.5 group-open:bg-brand-100 dark:group-open:bg-brand-950/60 group-open:text-brand-700 dark:group-open:text-brand-300 transition-colors"
              aria-hidden="true"
            >
              {startIndex + idx}
            </span>
            <span className="flex-1 font-medium text-sm sm:text-base text-slate-900 dark:text-white leading-snug text-start">
              {faq.question}
            </span>
            <svg
              className="flex-shrink-0 w-5 h-5 text-slate-400 transition-transform duration-200 ease-out group-open:rotate-180 group-open:text-brand-500 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>

          <div className="px-4 sm:px-5 pb-4 sm:pb-5 ps-[3.25rem] sm:ps-[3.75rem]">
            <div
              className="faq-answer note-content text-sm sm:text-[15px] text-slate-700 dark:text-slate-300"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </div>
        </details>
      ))}
    </div>
  )
}

export default FaqSection