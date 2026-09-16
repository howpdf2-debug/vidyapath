import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'

interface ChapterCardProps {
  // ✅ FIX: removed unused `chapterId`
  chapterNum: number
  title: string
  gradient: string
  pdfUrl?: string | null
  href: string
  lang?: string
  partLabel?: string
  index?: number
}

export function ChapterCard({
  chapterNum,
  title,
  gradient,
  pdfUrl,
  href,
  lang = 'en',
  partLabel,
  index = 0,
}: ChapterCardProps) {
  return (
    <div
      className="group relative surface-card hover:shadow-cardHover hover:border-brand-300 dark:hover:border-brand-700 transition-all overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-950"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="p-4 sm:p-5">
        <Link href={href} className="flex items-start gap-3 mb-3 group/link">
          <div className="relative flex-shrink-0">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-md group-hover/link:scale-105 transition-transform`}>
              {chapterNum}
            </div>
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-0 group-hover/link:opacity-30 group-hover/link:scale-125 blur-md transition-all -z-10`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                {lang === 'hi' ? 'अध्याय' : 'Chapter'} {chapterNum}
              </p>
              {partLabel && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 uppercase">
                  {partLabel}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover/link:text-brand-600 dark:group-hover/link:text-brand-400 transition">
              {title}
            </h3>
          </div>
        </Link>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 text-xs font-medium transition tap-target"
              aria-label={`Download PDF for chapter ${chapterNum}`}
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </a>
          )}
          <Link
            href={href}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 text-xs font-medium transition tap-target group-hover:gap-2"
          >
            {lang === 'hi' ? 'पढ़ें' : 'Read'}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}