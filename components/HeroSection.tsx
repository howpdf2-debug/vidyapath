import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LanguageToggle } from './LanguageToggle'

interface HeroStat {
  icon: any
  label: string
}

interface HeroCTA {
  href: string
  label: string
  icon: any
  primary?: boolean
}

interface HeroSectionProps {
  id?: string
  badge?: { icon: any; text: string }
  title: React.ReactNode
  subtitle?: string
  gradient?: string
  stats?: HeroStat[]
  ctas?: HeroCTA[]
  showLanguageToggle?: boolean
  children?: React.ReactNode
}

export function HeroSection({
  id,
  badge,
  title,
  subtitle,
  gradient = 'from-brand-500 via-purple-500 to-pink-500',
  stats = [],
  ctas = [],
  showLanguageToggle = true,
  children,
}: HeroSectionProps) {
  const BadgeIcon = badge?.icon

  return (
    <section
      id={id}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 sm:p-10 md:p-14 text-white isolation-auto`}
    >
      {/* ✅ FIX: Blobs with better contrast in both light/dark */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/25 dark:bg-white/20 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/20 dark:bg-white/15 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-white/15 dark:bg-white/10 rounded-full blur-[100px] animate-pulse-slow" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
        style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          {badge && BadgeIcon && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs sm:text-sm font-medium border border-white/20 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{badge.text}</span>
            </div>
          )}
          {showLanguageToggle && (
            <div className="flex-shrink-0">
              <LanguageToggle />
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-4 tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-6 text-pretty">
            {subtitle}
          </p>
        )}

        {stats.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 text-xs sm:text-sm">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {stat.label}
                </span>
              )
            })}
          </div>
        )}

        {ctas.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {ctas.map((cta, i) => {
              const Icon = cta.icon
              const isAnchor = cta.href.startsWith('#')

              if (isAnchor) {
                return (
                  <a
                    key={i}
                    href={cta.href}
                    className={
                      cta.primary
                        ? 'group inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-white/95 transition shadow-2xl shadow-black/10 hover:scale-[1.02]'
                        : 'inline-flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-md text-white border border-white/25 rounded-xl font-semibold hover:bg-white/20 transition'
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {cta.label}
                    {cta.primary && (
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </a>
                )
              }

              return (
                <Link
                  key={i}
                  href={cta.href}
                  className={
                    cta.primary
                      ? 'group inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-white/95 transition shadow-2xl shadow-black/10 hover:scale-[1.02]'
                      : 'inline-flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-md text-white border border-white/25 rounded-xl font-semibold hover:bg-white/20 transition'
                  }
                >
                  <Icon className="w-4 h-4" />
                  {cta.label}
                  {cta.primary && (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {children}
      </div>
    </section>
  )
}