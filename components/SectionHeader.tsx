import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  badge?: { icon: any; text: string; color?: string }
  title: string
  description?: string
  action?: { href: string; label: string }
}

export function SectionHeader({
  badge,
  title,
  description,
  action,
}: SectionHeaderProps) {
  const BadgeIcon = badge?.icon
  // ✅ FIX: Safe default
  const badgeColor = badge?.color || 'text-brand-600 dark:text-brand-400'

  return (
    <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
      <div className="min-w-0">
        {badge && BadgeIcon && (
          <div
            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 ${badgeColor}`}
          >
            <BadgeIcon className="w-3.5 h-3.5" />
            {badge.text}
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 flex-shrink-0"
        >
          {action.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}