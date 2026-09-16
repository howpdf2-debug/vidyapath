import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Trophy, Calendar, ExternalLink, Bell, Sparkles, Award,
  ArrowRight, CheckCircle2, Shield, Zap, TrendingUp,
} from 'lucide-react'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'

// ✅ FIX: generateMetadata for lang support
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  if (lang === 'hi') {
    return buildMetadata({
      title: 'परीक्षा परिणाम 2026 – नवीनतम बोर्ड परिणाम | VidyaPath',
      description:
        'UP बोर्ड, बिहार बोर्ड, MP बोर्ड, राजस्थान बोर्ड, CBSE के नवीनतम परीक्षा परिणाम। तुरंत अपडेट और direct official links।',
      path: '/results',
      keywords: ['परीक्षा परिणाम 2026', 'बोर्ड परिणाम', 'सरकारी रिजल्ट', '10वीं 12वीं रिजल्ट'],
    })
  }

  return buildMetadata({
    title: 'Exam Results 2026 – Latest Board & Competitive Exam Updates | VidyaPath',
    description:
      'Latest exam results for UP Board, Bihar Board, MP Board, Rajasthan Board, CBSE, and competitive exams. Real-time updates and direct result links.',
    path: '/results',
    keywords: ['exam results 2026', 'board results', 'sarkari result', '10th 12th result'],
  })
}

const BOARDS = [
  { name: 'CBSE', class: '10th & 12th', url: 'https://results.cbse.nic.in', gradient: 'from-blue-500 to-cyan-500', emoji: '📘' },
  { name: 'UP Board', class: '10th & 12th', url: 'https://upresults.nic.in', gradient: 'from-orange-500 to-red-500', emoji: '🟠' },
  { name: 'Bihar Board', class: '10th & 12th', url: 'https://biharboardonline.bihar.gov.in', gradient: 'from-emerald-500 to-teal-500', emoji: '🟢' },
  { name: 'MP Board', class: '10th & 12th', url: 'https://mpbse.nic.in', gradient: 'from-purple-500 to-indigo-500', emoji: '🟣' },
  { name: 'Rajasthan Board', class: '10th & 12th', url: 'https://rajresults.nic.in', gradient: 'from-pink-500 to-rose-500', emoji: '🔴' },
  { name: 'Maharashtra Board', class: '10th & 12th', url: 'https://mahresult.nic.in', gradient: 'from-amber-500 to-orange-500', emoji: '🟡' },
]

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  // ✅ FIX: i18n strings
  const t = {
    badge: lang === 'hi' ? 'लाइव परीक्षा परिणाम 2026' : 'Live Exam Results 2026',
    heroLine1: lang === 'hi' ? 'परिणाम,' : 'Results,',
    heroLine2: lang === 'hi' ? 'तुरंत अपडेट।' : 'Turant Update.',
    heroSub:
      lang === 'hi'
        ? 'नवीनतम बोर्ड परिणाम, प्रतियोगी परीक्षा परिणाम, और अपडेट — सब एक जगह। Direct official links, no cache, no fake data।'
        : 'Latest board results, competitive exam results, aur updates — sab ek jagah. Direct official links ke saath, no cache, no fake data.',
    ctaCheck: lang === 'hi' ? 'परिणाम देखें' : 'Check Result',
    ctaJobs: lang === 'hi' ? 'नौकरी अपडेट' : 'Job Updates',
    trust1: lang === 'hi' ? `${BOARDS.length}+ बोर्ड` : `${BOARDS.length}+ Boards`,
    trust2: lang === 'hi' ? 'लाइव लिंक' : 'Live Links',
    trust3: lang === 'hi' ? '100% मुफ्त' : '100% Free',
    sectionBadge: lang === 'hi' ? 'बोर्ड परिणाम' : 'Board Results',
    sectionTitle: lang === 'hi' ? 'कौन-सा बोर्ड परिणाम चाहिए?' : 'Konsa Board Result Chahiye?',
    sectionSub:
      lang === 'hi'
        ? 'हर बोर्ड का Direct Official Link — no redirects, no middleman।'
        : 'Har board ka direct official link — no redirects, no middleman.',
    checkResult: lang === 'hi' ? 'परिणाम देखें' : 'Check Result',
    comingSoonTitle: lang === 'hi' ? 'जल्द आ रहा है' : 'Coming Soon',
    comingSoonDesc:
      lang === 'hi'
        ? 'NEET, JEE, UPSC, SSC, Railway, और Banking परीक्षा परिणामों के Direct links जल्द ही जोड़े जाएँगे।'
        : 'NEET, JEE, UPSC, SSC, Railway, aur banking exam results ke direct links jald hi add honge.',
    disclaimer:
      lang === 'hi'
        ? 'यह पेज official result links provide करता है। हम कोई result data store या cache नहीं करते। Verification के लिए हमेशा official website check करें।'
        : 'Ye page official result links provide karta hai. Hum koi result data store ya cache nahi karte. Verification ke liye always official website check karo.',
  }

  const stats = [
    { value: `${BOARDS.length}+`, label: lang === 'hi' ? 'बोर्ड' : 'Boards', gradient: 'from-amber-500 to-orange-500' },
    { value: 'Live', label: lang === 'hi' ? 'स्टेटस' : 'Status', gradient: 'from-emerald-500 to-teal-500' },
    { value: '24/7', label: lang === 'hi' ? 'अपडेट' : 'Updates', gradient: 'from-brand-500 to-purple-500' },
    { value: '100%', label: lang === 'hi' ? 'मुफ्त' : 'Free', gradient: 'from-pink-500 to-rose-500' },
  ]

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* ═══════════ HERO ═══════════ */}
      <section
        id="hero"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-10 md:p-14 text-white"
      >
        {/* ✅ FIX: Blobs match hero palette */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-300/40 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-rose-300/40 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-red-300/40 rounded-full blur-[100px] animate-pulse-slow" />

        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs sm:text-sm font-medium border border-white/20 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Trophy className="w-3.5 h-3.5" />
              <span>{t.badge}</span>
            </div>
            {/* ✅ FIX: LanguageToggle added */}
            <LanguageToggle />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-5">
            {t.heroLine1}
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-amber-100 to-orange-200 bg-clip-text text-transparent">
              {t.heroLine2}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-8 text-pretty">
            {t.heroSub}
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href="#boards"
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-white/95 transition shadow-2xl shadow-black/20 hover:scale-[1.02]"
            >
              <Trophy className="w-5 h-5" />
              {t.ctaCheck}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </a>
            {/* ✅ FIX: lang param preserved */}
            <Link
              href={`/rojgar-samachar?lang=${lang}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/25 rounded-2xl font-semibold hover:bg-white/20 transition"
            >
              <Calendar className="w-5 h-5" />
              {t.ctaJobs}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/90">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" /> {t.trust1}
            </span>
            <span className="inline-flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-200" /> {t.trust2}
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield className="w-4 h-4 text-pink-200" /> {t.trust3}
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section
        aria-label="Stats"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 sm:-mt-16 relative z-20"
      >
        {stats.map((s) => (
          <BigStat key={s.label} {...s} />
        ))}
      </section>

      {/* ═══════════ BOARD RESULTS ═══════════ */}
      <section id="boards" aria-labelledby="boards-heading">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {t.sectionBadge}
          </div>
          <h2
            id="boards-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            {t.sectionTitle}
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-3">
            {t.sectionSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOARDS.map((board) => (
            <a
              key={board.name}
              href={board.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 sm:p-6 transition-all hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label={`Check ${board.name} result (opens in new tab)`}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${board.gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
              <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900 -z-10" />
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${board.gradient} opacity-10 group-hover:opacity-20 blur-2xl transition`} />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${board.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
                    {board.emoji}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {board.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {board.class}
                </p>

                <div className={`inline-flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r ${board.gradient} bg-clip-text text-transparent`}>
                  {t.checkResult}
                  <ExternalLink className="w-3.5 h-3.5 text-slate-900 dark:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ═══════════ COMING SOON ═══════════ */}
      <section
        aria-labelledby="coming-heading"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-amber-950/40 dark:to-orange-950/40 p-6 sm:p-10 md:p-14 border border-amber-100 dark:border-amber-900/40"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-xl mb-5">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h2
            id="coming-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3"
          >
            {t.comingSoonTitle}
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mb-8">
            {t.comingSoonDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* ✅ FIX: lang param preserved */}
            <Link
              href={`/rojgar-samachar?lang=${lang}`}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:shadow-xl hover:scale-[1.02] transition shadow-lg shadow-amber-500/30"
            >
              <Calendar className="w-4 h-4" />
              {lang === 'hi' ? 'रोजगार समाचार' : 'Rojgar Samachar'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href={`/competitive-exams?lang=${lang}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-semibold"
            >
              <Award className="w-4 h-4" />
              {lang === 'hi' ? 'प्रतियोगी परीक्षाएँ' : 'Competitive Exams'}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ DISCLAIMER ═══════════ */}
      <section className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-start gap-3 max-w-3xl mx-auto">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Note: </strong>
            {t.disclaimer}
          </p>
        </div>
      </section>
    </div>
  )
}

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