import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

interface ClassCardProps {
  classNum: number
  subjects: string[]
  totalChapters: number
  gradient: string
  href: string
  lang?: string
}

export function ClassCard({
  classNum,
  subjects,
  totalChapters,
  gradient,
  href,
  lang = 'en',
}: ClassCardProps) {
  // ✅ FIX: Show +N more indicator
  const visibleSubjects = subjects.slice(0, 3)
  const remaining = subjects.length - visibleSubjects.length

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 transition-all hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label={`Class ${classNum} - ${subjects.length} subjects, ${totalChapters} chapters`}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
      <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900 -z-10" />
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition`} />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
              Class
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {classNum}
            </p>
          </div>
        </div>

        {subjects.length > 0 ? (
          <div className="space-y-1 mb-4">
            {visibleSubjects.map((sub) => (
              <p
                key={sub}
                className="text-xs text-slate-600 dark:text-slate-400 truncate"
              >
                • {sub}
              </p>
            ))}
            {/* ✅ FIX: +N more indicator */}
            {remaining > 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                +{remaining} more {lang === 'hi' ? 'विषय' : 'subject'}
                {remaining > 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic mb-4">
            {lang === 'hi' ? 'जल्द आ रहा है' : 'Coming soon'}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {totalChapters} {lang === 'hi' ? 'अध्याय' : 'chapters'}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400 group-hover:gap-2 transition-all">
            {lang === 'hi' ? 'खोलें' : 'Open'}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}