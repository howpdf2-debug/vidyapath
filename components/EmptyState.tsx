import Link from 'next/link'

interface EmptyStateProps {
  emoji?: string
  title: string
  description: string
  actions?: { href: string; label: string; icon?: any; primary?: boolean }[]
}

export function EmptyState({
  emoji = '📚',
  title,
  description,
  actions = [],
}: EmptyStateProps) {
  return (
    <div className="surface-card text-center py-16 px-6 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner mb-6">
          <span className="text-5xl">{emoji}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
          {description}
        </p>

        {actions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {actions.map((action, i) => {
              const Icon = action.icon
              return (
                <Link
                  key={i}
                  href={action.href}
                  className={
                    action.primary
                      ? 'inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium shadow-brand'
                      : 'inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium'
                  }
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {action.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}