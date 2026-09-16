import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Trophy,
  ArrowRight,
  Sparkles,
  Target,
  BookOpen,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import { EXAMS } from '@/lib/exams'

export const metadata: Metadata = buildMetadata({
  title: 'प्रतियोगी परीक्षाएँ (Competitive Exams) – Free Study Material | VidyaPath',
  description:
    'SSC, Railway, Bank exams की मुफ़्त तैयारी — नोट्स, MCQ, PYQ सब कुछ हिंदी में।',
  path: '/competitive-exams',
  keywords: [
    'प्रतियोगी परीक्षाएँ',
    'SSC',
    'Railway',
    'Bank',
    'competitive exams',
    'sarkari naukri',
    'free study material',
  ],
})

export default function CompetitiveExamsPage() {
  // Stats
  const totalGroups = EXAMS.reduce((sum, e) => sum + e.groups.length, 0)

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600 p-6 sm:p-10 md:p-14 text-white">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/30 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-400/30 rounded-full blur-[100px] animate-pulse-slow" />

        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs sm:text-sm font-medium mb-6 border border-white/20 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% मुफ़्त • हिंदी में</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-5">
            प्रतियोगी परीक्षाएँ,
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
              तैयारी अब आसान।
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-8 text-pretty">
            SSC, Railway, Bank — हर परीक्षा के लिए नोट्स, MCQ, PYQ सब कुछ एक जगह। बिल्कुल मुफ़्त, हिंदी माध्यम में।
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/90">
            <span className="inline-flex items-center gap-2">
              <span className="text-emerald-200">✓</span> {EXAMS.length} परीक्षाएँ
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-yellow-200">✓</span> {totalGroups} ग्रुप
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-pink-200">✓</span> हिंदी माध्यम
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section
        aria-label="Stats"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 sm:-mt-16 relative z-20"
      >
        <BigStat value={`${EXAMS.length}`} label="परीक्षाएँ" gradient="from-brand-500 to-purple-500" />
        <BigStat value={`${totalGroups}`} label="ग्रुप" gradient="from-emerald-500 to-teal-500" />
        <BigStat value="315" label="टॉपिक" gradient="from-amber-500 to-orange-500" />
        <BigStat value="3000+" label="MCQ" gradient="from-pink-500 to-rose-500" />
      </section>

      {/* ═══════════ EXAM CARDS ═══════════ */}
      <section>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            <Target className="w-3.5 h-3.5" />
            Choose Your Exam
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            कौन सी परीक्षा की तैयारी?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-3">
            हर परीक्षा के लिए dedicated content, हिंदी माध्यम में।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {EXAMS.map((exam) => (
            <Link
              key={exam.slug}
              href={`/competitive-exams/${exam.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-transparent p-6 sm:p-8 transition-all hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 bg-white dark:bg-slate-900"
            >
              <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${exam.gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
              />
              <div className="absolute inset-[1px] rounded-3xl bg-white dark:bg-slate-900 -z-10" />
              <div
                className={`absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br ${exam.gradient} opacity-10 group-hover:opacity-25 blur-3xl transition`}
              />

              {/* Shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="relative">
                <div className="text-6xl sm:text-7xl mb-5 group-hover:scale-110 transition-transform duration-300">
                  {exam.emoji}
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
                  {exam.name_hi}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {exam.name_en}
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed line-clamp-2">
                  {exam.description_hi}
                </p>

                {/* Groups preview */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {exam.groups.map((g) => (
                    <span
                      key={g.slug}
                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wide"
                    >
                      {g.name_hi}
                    </span>
                  ))}
                </div>

                <div
                  className={`inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${exam.gradient} bg-clip-text text-transparent`}
                >
                  तैयारी शुरू करें
                  <ArrowRight className="w-4 h-4 text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ WHY US ═══════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-10 md:p-14 border border-slate-200 dark:border-slate-800">
        <div className="relative text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Why VidyaPath
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            क्यों चुनें <span className="bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">VidyaPath</span>?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={Zap}
            title="100% मुफ़्त"
            desc="कोई पेवॉल नहीं, कोई subscription नहीं।"
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
          <FeatureCard
            icon={BookOpen}
            title="हिंदी माध्यम"
            desc="हर टॉपिक हिंदी में — आसान भाषा।"
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
          <FeatureCard
            icon={Target}
            title="Exam-Focused"
            desc="PYQ-based content, weightage analysis।"
            color="text-purple-500"
            bg="bg-purple-500/10"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Progress Tracking"
            desc="अपनी प्रगति देखें, कमज़ोरी सुधारें।"
            color="text-amber-500"
            bg="bg-amber-500/10"
          />
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-10 md:p-14 text-center text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-[2px] rounded-3xl bg-slate-950" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/40 rounded-full blur-[100px] animate-pulse-slow" />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-500 mb-6 shadow-2xl shadow-brand-500/40">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
            तैयारी शुरू करने के लिए तैयार?
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-8 max-w-lg mx-auto">
            SSC, Railway, Bank — चुनो अपनी परीक्षा और शुरू करो।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/competitive-exams/railway"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-white/95 transition shadow-2xl shadow-white/20 hover:scale-[1.02]"
            >
              <Target className="w-5 h-5" />
              रेलवे से शुरू करें
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/competitive-exams/ssc"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/25 rounded-2xl font-semibold hover:bg-white/20 transition"
            >
              <BookOpen className="w-5 h-5" />
              SSC देखें
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// SUB COMPONENTS
// ═══════════════════════════════════════════════════════

function BigStat({
  value,
  label,
  gradient,
}: {
  value: string
  label: string
  gradient: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <p className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
        {value}
      </p>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5">
        {label}
      </p>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
  bg,
}: {
  icon: any
  title: string
  desc: string
  color: string
  bg: string
}) {
  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${bg} ${color} mb-4 group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}