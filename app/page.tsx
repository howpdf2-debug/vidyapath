import Link from 'next/link'
import {
  BookOpen,
  FileText,
  Trophy,
  MapPin,
  Newspaper,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Layers,
  Zap,
  Smartphone,
  Languages,
  IndianRupee,
  TrendingUp,
  Star,
  Flame,
  GraduationCap,
} from 'lucide-react'

// ==================== DATA ====================
const CLASSES = [
  { num: 6, color: 'from-sky-400 to-blue-500', subjects: '2 subjects' },
  { num: 7, color: 'from-cyan-400 to-teal-500', subjects: '2 subjects' },
  { num: 8, color: 'from-emerald-400 to-green-500', subjects: '2 subjects' },
  { num: 9, color: 'from-lime-400 to-emerald-500', subjects: '2 subjects' },
  { num: 10, color: 'from-amber-400 to-orange-500', subjects: '2 subjects' },
  { num: 11, color: 'from-orange-400 to-red-500', subjects: '4 subjects' },
  { num: 12, color: 'from-rose-400 to-pink-500', subjects: '4 subjects' },
]

const QUICK_ACCESS = [
  {
    icon: BookOpen,
    title: 'NCERT Solutions',
    desc: 'Class 6-12 • 460+ chapters',
    href: '/ncert',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    glow: 'shadow-blue-500/40',
    emoji: '📚',
  },
  {
    icon: FileText,
    title: 'Study Notes',
    desc: 'Chapter-wise notes in Hindi & English',
    href: '/notes',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glow: 'shadow-emerald-500/40',
    emoji: '📝',
  },
  {
    icon: Trophy,
    title: 'Competitive Exams',
    desc: 'SSC • Railway • Bank preparation',
    href: '/competitive-exams',
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    glow: 'shadow-purple-500/40',
    emoji: '🏆',
  },
  {
    icon: MapPin,
    title: 'State Boards',
    desc: 'UP • Bihar • MP • Rajasthan',
    href: '/state-boards',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glow: 'shadow-orange-500/40',
    emoji: '🗺️',
  },
  {
    icon: Newspaper,
    title: 'Rojgar Samachar',
    desc: 'Latest sarkari job updates',
    href: '/rojgar-samachar',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    glow: 'shadow-pink-500/40',
    emoji: '📰',
  },
  {
    icon: BarChart3,
    title: 'Results',
    desc: 'Board & exam results instantly',
    href: '/results',
    gradient: 'from-indigo-500 via-blue-500 to-sky-500',
    glow: 'shadow-indigo-500/40',
    emoji: '📊',
  },
]

const FEATURES = [
  {
    icon: IndianRupee,
    title: '100% Free',
    desc: 'No paywall, no subscription. Ever.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First',
    desc: 'Works on low-end phones & slow 4G.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Languages,
    title: 'Hindi + English',
    desc: 'Both languages for all chapters.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Loads in seconds, no ads, no popups.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
]

const TRENDING = [
  {
    href: '/ncert/10/mathematics',
    label: 'Class 10 • Math',
    title: 'Real Numbers',
    emoji: '📐',
    gradient: 'from-blue-500 to-cyan-500',
    views: '12.4k',
  },
  {
    href: '/ncert/10/science',
    label: 'Class 10 • Science',
    title: 'Chemical Reactions',
    emoji: '🧪',
    gradient: 'from-orange-500 to-red-500',
    views: '9.8k',
  },
  {
    href: '/ncert/12/physics',
    label: 'Class 12 • Physics',
    title: 'Electric Charges & Fields',
    emoji: '⚛️',
    gradient: 'from-purple-500 to-indigo-500',
    views: '8.1k',
  },
]

// ==================== HOMEPAGE ====================
export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-20 pb-12">
      {/* Skip link (a11y) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        id="hero"
        className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-10 md:p-14 lg:p-16 text-white isolation-auto"
      >
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600" />

        {/* Floating color blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/40 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-500/40 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-500/40 rounded-full blur-[100px] animate-pulse-slow" />

        {/* Noise texture (subtle) */}
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-3xl">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs sm:text-sm font-medium mb-6 border border-white/20 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>100% Free for Every Indian Student</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] mb-5 tracking-tight">
            Free Study Portal
            <br />
            for{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                Indian Students
              </span>
              {/* Underline */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-3"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 Q 100 2, 198 8"
                  stroke="url(#grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#FB923C" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl mb-8">
            NCERT Solutions, State Boards, Sarkari Naukri, and Competitive
            Exams — everything you need, in one place, absolutely free.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href="/ncert"
              className="group relative inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-white/95 transition shadow-2xl shadow-white/20 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-orange-200 opacity-0 group-hover:opacity-100 transition-opacity" />
              <BookOpen className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Start Learning</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/state-boards"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/25 rounded-2xl font-semibold hover:bg-white/20 transition"
            >
              <MapPin className="w-5 h-5" />
              State Boards
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/90">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Free Forever
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              No Ads
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-300" />
              Made in India 🇮🇳
            </span>
          </div>
        </div>

        {/* Floating card (desktop only) */}
        <div className="hidden lg:block absolute bottom-8 right-8 max-w-xs">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-lg">
                🎓
              </div>
              <div>
                <p className="text-xs text-white/70">Chapters Available</p>
                <p className="text-2xl font-bold">460+</p>
              </div>
            </div>
            <div className="flex -space-x-2">
              {['📐', '🔬', '⚛️', '🧪', '🧬'].map((e, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm"
                >
                  {e}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-brand-500 border-2 border-white/40 flex items-center justify-center text-xs font-bold">
                +13
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section
        id="stats"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 -mt-6 sm:-mt-8 relative z-20"
      >
        <StatCard value="460+" label="Chapters" icon={BookOpen} tone="brand" trend="+12" />
        <StatCard value="18" label="Subjects" icon={Layers} tone="emerald" />
        <StatCard value="4" label="State Boards" icon={MapPin} tone="amber" />
        <StatCard value="3+" label="Exams" icon={Trophy} tone="purple" />
      </section>

      {/* ═══════════════ CLASS SELECTOR — BENTO GRID ═══════════════ */}
      <section id="classes">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Pick Your Journey
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Choose Your Class
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              NCERT solutions for Classes 6 to 12
            </p>
          </div>
          <Link
            href="/ncert"
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            Browse all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bento class grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CLASSES.map((cls, idx) => (
            <Link
              key={cls.num}
              href={`/ncert/${cls.num}`}
              className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${cls.color} text-white shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                idx === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                  Class
                </p>
                <p className={`font-black leading-none mt-1 ${idx === 0 ? 'text-6xl sm:text-7xl' : 'text-4xl sm:text-5xl'}`}>
                  {cls.num}
                </p>
                <p className="text-xs font-medium opacity-90 mt-2">
                  {cls.subjects}
                </p>

                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════ QUICK ACCESS — MODERN CARDS ═══════════════ */}
      <section id="explore">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Everything You Need
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            One Portal. All Solutions.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACCESS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 sm:p-6 transition-all hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {/* Gradient border on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                />
                <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900 -z-10" />

                {/* Floating emoji */}
                <div className="absolute top-4 right-4 text-5xl opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300">
                  {item.emoji}
                </div>

                <div className="relative">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} text-white mb-5 shadow-lg ${item.glow} group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="mt-5 flex items-center gap-1.5 text-sm font-bold">
                    <span className={`bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                      Explore now
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ═══════════════ TRENDING ═══════════════ */}
      <section id="trending">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            Popular This Week
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Trending Now
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRENDING.map((item, idx) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 transition-all hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {/* Rank badge */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                #{idx + 1}
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {item.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {item.label}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="font-semibold">{item.views}</span>
                    <span>reads</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════ WHY VIDYAPATH ═══════════════ */}
      <section
        id="why"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-brand-50 to-purple-50 dark:from-slate-900 dark:via-brand-950 dark:to-purple-950 p-6 sm:p-10 md:p-14 border border-slate-200 dark:border-slate-800"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-3">
            <Star className="w-3.5 h-3.5" />
            Why Students Love Us
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Built for <span className="bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">Indian Students</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Understanding what matters most — no compromises, no hidden costs.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border ${feature.border} hover:shadow-xl transition-all hover:-translate-y-1 text-center sm:text-left`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section
        id="cta"
        className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-10 md:p-14 text-center text-white isolation-auto"
      >
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-[2px] rounded-3xl bg-slate-950" />

        {/* Color blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/40 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/40 rounded-full blur-[100px] animate-pulse-slow" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-500 mb-6 shadow-2xl shadow-brand-500/40">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
            Ready to{' '}
            <span className="bg-gradient-to-r from-yellow-200 to-orange-300 bg-clip-text text-transparent">
              Start Learning?
            </span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-8 max-w-lg mx-auto">
            460+ chapters across 18 subjects. Both Hindi & English. All free,
            forever.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ncert"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-white/95 transition shadow-2xl shadow-white/20"
            >
              <BookOpen className="w-5 h-5" />
              Start Learning
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/25 rounded-2xl font-semibold hover:bg-white/20 transition"
            >
              <FileText className="w-5 h-5" />
              Browse Notes
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ==================== SUB COMPONENTS ====================

const TONES = {
  brand: {
    icon: 'text-brand-600 dark:text-brand-400',
    bg: 'bg-brand-500/10',
    gradient: 'from-brand-500 to-purple-500',
  },
  emerald: {
    icon: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    gradient: 'from-emerald-500 to-teal-500',
  },
  amber: {
    icon: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    gradient: 'from-amber-500 to-orange-500',
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    gradient: 'from-purple-500 to-indigo-500',
  },
} as const

type Tone = keyof typeof TONES

function StatCard({
  value,
  label,
  icon: Icon,
  tone,
  trend,
}: {
  value: string
  label: string
  icon: any
  tone: Tone
  trend?: string
}) {
  const t = TONES[tone]
  return (
    <div className="group relative overflow-hidden surface-card p-4 sm:p-5 hover:shadow-xl transition-shadow">
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.gradient}`} />

      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${t.bg} ${t.icon} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
              {value}
            </p>
            {trend && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                <TrendingUp className="w-2.5 h-2.5" />
                {trend}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}