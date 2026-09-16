import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SubjectCardProps {
  subject: string
  icon: any
  gradient: string
  description: string
  chapterCount: number
  href: string
  lang?: string
  size?: 'md' | 'lg'
}

export function SubjectCard({
  subject,
  icon: Icon,
  gradient,
  description,
  chapterCount,
  href,
  lang = 'en',
  size = 'md',
}: SubjectCardProps) {
  const isLarge = size === 'lg'

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 sm:p-6 transition-all hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
      <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900 -z-10" />

      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 blur-2xl transition`} />

      <div className="relative">
        <div
          className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all ${
            isLarge ? 'w-16 h-16 mb-5' : 'w-14 h-14 mb-4'
          }`}
        >
          <Icon className={isLarge ? 'w-8 h-8' : 'w-7 h-7'} />
        </div>

        <h3 className={`font-bold text-slate-900 dark:text-white mb-1.5 ${isLarge ? 'text-xl' : 'text-lg'}`}>
          {subject}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
          {description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {chapterCount} {lang === 'hi' ? 'अध्याय' : 'chapters'}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {lang === 'hi' ? 'खोलें' : 'Explore'}
            <ArrowRight className="w-4 h-4 text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}