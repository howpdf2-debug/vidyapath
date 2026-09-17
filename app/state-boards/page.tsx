import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen, ArrowRight, Sparkles, MapPin, Download, TrendingUp,
  Layers, GraduationCap, Star, Users, Award, CheckCircle2, Zap,
  Target, HelpCircle, ChevronRight, Flame, BookMarked, PlayCircle,
  ShieldCheck,
} from 'lucide-react'
import { STATE_BOARDS, CLASS_INFO, STATE_BOARD_CLASSES } from '@/lib/state-boards'
import { buildMetadata } from '@/lib/seo'

// ═══════════════════════════════════════════════════════
// ISR
// ═══════════════════════════════════════════════════════
export const revalidate = 3600

// ═══════════════════════════════════════════════════════
// SEO Metadata
// ═══════════════════════════════════════════════════════
export const metadata: Metadata = buildMetadata({
  title: 'राज्य बोर्ड कक्षा 6-10 – मुफ़्त NCERT हिंदी समाधान | VidyaPath',
  description:
    'UP, बिहार, MP और राजस्थान राज्य बोर्ड के लिए कक्षा 6-10 के NCERT हिंदी समाधान, नोट्स और मुफ़्त PDF डाउनलोड। 50,000+ छात्रों की पसंद।',
  path: '/state-boards',
  keywords: [
    'राज्य बोर्ड', 'UP Board Hindi', 'Bihar Board Hindi',
    'MP Board Hindi', 'Rajasthan Board Hindi', 'NCERT हिंदी', 'कक्षा 6-10',
  ],
})

// ═══════════════════════════════════════════════════════
// Fallback Boards
// ═══════════════════════════════════════════════════════
const FALLBACK_BOARDS = [
  {
    slug: 'up',
    name_hi: 'यूपी बोर्ड',
    name_en: 'UP Board',
    full_name_hi: 'उत्तर प्रदेश माध्यमिक शिक्षा परिषद',
    location_hi: 'प्रयागराज',
    emoji: '🏛️',
    gradient: 'from-orange-500 via-red-500 to-rose-500',
  },
  {
    slug: 'bihar',
    name_hi: 'बिहार बोर्ड',
    name_en: 'Bihar Board',
    full_name_hi: 'बिहार विद्यालय परीक्षा समिति',
    location_hi: 'पटना',
    emoji: '📚',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
  },
  {
    slug: 'mp',
    name_hi: 'एमपी बोर्ड',
    name_en: 'MP Board',
    full_name_hi: 'माध्यमिक शिक्षा मंडल',
    location_hi: 'भोपाल',
    emoji: '🎓',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    slug: 'rajasthan',
    name_hi: 'राजस्थान बोर्ड',
    name_en: 'Rajasthan Board',
    full_name_hi: 'राजस्थान माध्यमिक शिक्षा बोर्ड',
    location_hi: 'अजमेर',
    emoji: '🌟',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
  },
]

// ═══════════════════════════════════════════════════════
// Board Stats
// ═══════════════════════════════════════════════════════
const BOARD_STATS: Record<
  string,
  { chapters: number; subjects: number; students: string; badge?: string }
> = {
  up:        { chapters: 124, subjects: 2, students: '25K+', badge: 'सबसे लोकप्रिय' },
  bihar:     { chapters: 124, subjects: 2, students: '18K+', badge: 'ट्रेंडिंग' },
  mp:        { chapters: 124, subjects: 2, students: '12K+', badge: undefined },
  rajasthan: { chapters: 124, subjects: 2, students: '10K+', badge: 'नया' },
}

// ═══════════════════════════════════════════════════════
// Board Theme
// ═══════════════════════════════════════════════════════
const BOARD_THEME: Record<
  string,
  {
    card: string
    emoji: string
    badge: string
    stat: string
    cta: string
    ctaText: string
    glow: string
  }
> = {
  up: {
    card: 'from-orange-50 via-amber-50 to-rose-50 dark:from-orange-950/40 dark:via-amber-950/20 dark:to-slate-900 border-orange-200/60 dark:border-orange-900/40 hover:shadow-2xl hover:shadow-orange-500/25',
    emoji: 'from-orange-400 via-orange-500 to-red-500',
    badge: 'from-orange-500 to-red-500',
    stat: 'text-orange-700 dark:text-orange-300',
    cta: 'group-hover:from-orange-500 group-hover:via-red-500 group-hover:to-rose-500',
    ctaText: 'text-orange-600 dark:text-orange-400',
    glow: 'from-orange-400 to-red-400',
  },
  bihar: {
    card: 'from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border-blue-200/60 dark:border-blue-900/40 hover:shadow-2xl hover:shadow-blue-500/25',
    emoji: 'from-blue-400 via-blue-500 to-indigo-600',
    badge: 'from-blue-500 to-indigo-600',
    stat: 'text-blue-700 dark:text-blue-300',
    cta: 'group-hover:from-blue-500 group-hover:via-indigo-500 group-hover:to-violet-500',
    ctaText: 'text-blue-600 dark:text-blue-400',
    glow: 'from-blue-400 to-indigo-400',
  },
  mp: {
    card: 'from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border-emerald-200/60 dark:border-emerald-900/40 hover:shadow-2xl hover:shadow-emerald-500/25',
    emoji: 'from-emerald-400 via-teal-500 to-cyan-500',
    badge: 'from-emerald-500 to-teal-600',
    stat: 'text-emerald-700 dark:text-emerald-300',
    cta: 'group-hover:from-emerald-500 group-hover:via-teal-500 group-hover:to-cyan-500',
    ctaText: 'text-emerald-600 dark:text-emerald-400',
    glow: 'from-emerald-400 to-teal-400',
  },
  rajasthan: {
    card: 'from-fuchsia-50 via-pink-50 to-rose-50 dark:from-fuchsia-950/40 dark:via-pink-950/20 dark:to-slate-900 border-fuchsia-200/60 dark:border-fuchsia-900/40 hover:shadow-2xl hover:shadow-fuchsia-500/25',
    emoji: 'from-fuchsia-400 via-pink-500 to-rose-500',
    badge: 'from-fuchsia-500 to-pink-600',
    stat: 'text-fuchsia-700 dark:text-fuchsia-300',
    cta: 'group-hover:from-fuchsia-500 group-hover:via-pink-500 group-hover:to-rose-500',
    ctaText: 'text-fuchsia-600 dark:text-fuchsia-400',
    glow: 'from-fuchsia-400 to-pink-400',
  },
}

// ═══════════════════════════════════════════════════════
// FAQ Data
// ═══════════════════════════════════════════════════════
const FAQS = [
  {
    q: 'क्या सामग्री पूरी तरह मुफ़्त है?',
    a: 'हाँ, सभी NCERT समाधान, नोट्स और PDF पूरी तरह मुफ़्त हैं — कोई छिपा शुल्क नहीं, कोई लॉगिन अनिवार्य नहीं।',
  },
  {
    q: 'क्या सामग्री NCERT आधारित है?',
    a: 'हाँ, सभी सामग्री NCERT पाठ्यक्रम पर आधारित है। UP, बिहार, MP और राजस्थान — सभी राज्य बोर्ड NCERT का पालन करते हैं।',
  },
  {
    q: 'कौन सी कक्षाएँ उपलब्ध हैं?',
    a: 'कक्षा 6 से 10 तक के सभी प्रमुख विषय (गणित, विज्ञान, सामाजिक विज्ञान) हिंदी माध्यम में उपलब्ध हैं।',
  },
  {
    q: 'PDF डाउनलोड कैसे करें?',
    a: 'किसी भी अध्याय के पेज पर जाएँ और "PDF डाउनलोड" बटन पर क्लिक करें — बिना वॉटरमार्क के मुफ़्त डाउनलोड करें।',
  },
]

// ═══════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════
export default function StateBoardsPage() {
  let boards: typeof FALLBACK_BOARDS = FALLBACK_BOARDS
  try {
    if (Array.isArray(STATE_BOARDS) && STATE_BOARDS.length > 0) {
      boards = STATE_BOARDS as any
    }
  } catch (err) {
    console.warn('[state-boards] Config load failed:', err)
  }

  const totalChapters = 620
  const totalSubjects = 2

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'राज्य बोर्ड – कक्षा 6-10',
    inLanguage: 'hi-IN',
    hasPart: boards.map((b) => ({
      '@type': 'EducationalOrganization',
      name: b.name_hi,
      alternateName: b.name_en,
    })),
  }

  return (
    <div className="pb-16" lang="hi">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-10 md:p-16 text-white">
        <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-blue-400/40 rounded-full blur-[120px]" />
        <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] bg-pink-400/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[28rem] h-[28rem] bg-purple-400/40 rounded-full blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/15 backdrop-blur-md text-xs sm:text-sm font-semibold border border-white/25 shadow-lg mb-7">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Sparkles className="w-4 h-4" />
            <span>NCERT 2026 • अपडेटेड</span>
            <span className="hidden sm:inline text-white/60">•</span>
            <span className="hidden sm:inline">50,000+ छात्र</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-6">
            अपने राज्य बोर्ड की
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
              पूरी तैयारी, एक जगह।
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-9 text-pretty">
            UP, बिहार, MP और राजस्थान बोर्ड के लिए कक्षा 6-10 तक —
            <span className="font-semibold"> हिंदी समाधान, नोट्स और मुफ़्त PDF</span>,
            सब कुछ structured तरीके से।
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href="#boards"
              className="group inline-flex items-center gap-2 px-7 py-4 bg-white text-slate-900 rounded-2xl font-bold shadow-2xl shadow-black/25 hover:bg-white/95 hover:scale-[1.03] transition-all"
            >
              <PlayCircle className="w-5 h-5" />
              अभी शुरू करें
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </a>
            <Link
              href="/ncert"
              className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-2xl font-semibold hover:bg-white/20 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              NCERT देखें
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/95">
            <span className="inline-flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              100% मुफ़्त
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-yellow-300" />
              NCERT आधारित
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-pink-300" />
              कोई साइनअप नहीं
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS — Clean gap below hero (NO overlap)
      ═══════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
        <BigStat icon={BookMarked} value={`${totalChapters}+`} label="अध्याय" gradient="from-indigo-500 to-purple-500" />
        <BigStat icon={Layers} value={`${totalSubjects}`} label="विषय" gradient="from-emerald-500 to-teal-500" />
        <BigStat icon={GraduationCap} value="5" label="कक्षाएँ" gradient="from-amber-500 to-orange-500" />
        <BigStat icon={Users} value="50K+" label="छात्र" gradient="from-pink-500 to-rose-500" />
      </section>

      {/* ═══════════════════════════════════════════════
          TRUST BADGES — Tight with stats
      ═══════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 sm:mt-8">
        <TrustBadge icon={ShieldCheck} text="Verified सामग्री" />
        <TrustBadge icon={Zap} text="Instant डाउनलोड" />
        <TrustBadge icon={Target} text="Exam-focused" />
        <TrustBadge icon={Award} text="टॉपर-अनुशंसित" />
      </section>

      {/* ═══════════════════════════════════════════════
          BOARDS GRID
      ═══════════════════════════════════════════════ */}
      <section id="boards" className="scroll-mt-20 mt-14 sm:mt-20">
        <SectionHeader
          badge="Pick Your Board"
          badgeIcon={Layers}
          title="अपना राज्य बोर्ड चुनें"
          subtitle="हर बोर्ड के लिए कक्षा 6-10 तक — NCERT आधारित हिंदी सामग्री, chapter-wise।"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {boards.map((board) => {
            const stats = BOARD_STATS[board.slug] || { chapters: 124, subjects: 2, students: '10K+', badge: undefined }
            const theme = BOARD_THEME[board.slug] || BOARD_THEME.up

            return (
              <Link
                key={board.slug}
                href={`/state-boards/${board.slug}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br border p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${theme.card}`}
                aria-label={`${board.name_hi} खोलें`}
              >
                <div
                  className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${theme.glow} opacity-25 blur-2xl pointer-events-none group-hover:opacity-40 transition-opacity`}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="relative">
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.emoji} blur-lg opacity-50 group-hover:opacity-80 transition-opacity`}
                      />
                      <div
                        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${theme.emoji} flex items-center justify-center text-xl sm:text-2xl shadow-lg ring-2 ring-white/70 dark:ring-slate-800/70 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                      >
                        <span className="drop-shadow-sm">{board.emoji}</span>
                      </div>
                    </div>

                    {stats.badge && (
                      <div
                        className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-full bg-gradient-to-r ${theme.badge} text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-md`}
                      >
                        <Flame className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">{stats.badge}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mb-0.5 line-clamp-1">
                    {board.name_hi}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                    {board.name_en} • कक्षा 6-10
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm text-[10px] font-black ${theme.stat} border border-white/80 dark:border-slate-700/60 shadow-sm`}
                    >
                      <BookMarked className="w-2.5 h-2.5" />
                      {stats.chapters}+
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm text-[10px] font-black ${theme.stat} border border-white/80 dark:border-slate-700/60 shadow-sm`}
                    >
                      <Layers className="w-2.5 h-2.5" />
                      {stats.subjects}
                    </span>
                  </div>

                  <div
                    className={`inline-flex items-center justify-between w-full px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/80 dark:border-slate-700/60 group-hover:border-transparent group-hover:bg-gradient-to-r ${theme.cta} transition-all duration-300 shadow-sm`}
                  >
                    <span
                      className={`text-[11px] font-black ${theme.ctaText} group-hover:text-white transition-colors`}
                    >
                      खोलें
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${theme.ctaText} group-hover:text-white group-hover:translate-x-0.5 transition-all`}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          QUICK JUMP
      ═══════════════════════════════════════════════ */}
      <section className="mt-12 sm:mt-16">
        <SectionHeader
          badge="Quick Jump"
          badgeIcon={Zap}
          title="सीधे कक्षा पर जाएँ"
          subtitle="किसी भी कक्षा को चुनें और तुरंत विषय देखें।"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {STATE_BOARD_CLASSES.map((num) => {
            const info = CLASS_INFO[num]
            return (
              <Link
                key={num}
                href={`/state-boards/up/${num}`}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 text-center transition-all hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
                <div className="absolute inset-[1px] rounded-[14px] bg-white dark:bg-slate-900" />

                <div className="relative">
                  <div
                    className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br ${info.gradient} items-center justify-center text-white font-black text-lg shadow-md mb-3 group-hover:scale-110 transition-transform`}
                  >
                    {num}
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {info.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Class {num}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900/50 dark:to-indigo-950/30 p-6 sm:p-10 md:p-14 border border-slate-200 dark:border-slate-800 mt-14 sm:mt-20">
        <div className="relative text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Everything Included
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            क्या क्या मिलता है?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Exam की तैयारी के लिए सब कुछ — मुफ़्त, हमेशा।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            icon={BookOpen}
            title="Chapter-wise समाधान"
            desc="हर अध्याय के महत्वपूर्ण बिंदु, सूत्र, परिभाषाएँ और हल — structured तरीके से।"
            gradient="from-indigo-500 to-purple-500"
            highlight="620+ अध्याय"
          />
          <FeatureCard
            icon={Download}
            title="मुफ़्त PDF डाउनलोड"
            desc="Official NCERT PDF सीधे डाउनलोड करें — बिना वॉटरमार्क, बिना लॉगिन।"
            gradient="from-rose-500 to-pink-500"
            highlight="Instant access"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Progress Tracking"
            desc="Login करके अपना progress track करें — कहाँ तक पढ़ा, क्या बाकी।"
            gradient="from-emerald-500 to-teal-500"
            highlight="Coming soon"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          WHY CHOOSE
      ═══════════════════════════════════════════════ */}
      <section className="mt-14 sm:mt-20">
        <SectionHeader
          badge="Why VidyaPath"
          badgeIcon={Award}
          title="छात्र हमें क्यों चुनते हैं?"
          subtitle="हजारों छात्रों का भरोसा, सालों का अनुभव।"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <WhyCard icon={Zap} stat="10x" label="तेज़ लर्निंग" desc="Structured content से जल्दी समझें" />
          <WhyCard icon={Target} stat="100%" label="Exam-focused" desc="Board exam के लिए बनाया गया" />
          <WhyCard icon={Users} stat="50K+" label="सक्रिय छात्र" desc="हर महीने बढ़ता समुदाय" />
          <WhyCard icon={Star} stat="4.9★" label="रेटिंग" desc="छात्रों का भरोसा" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════ */}
      <section className="mt-14 sm:mt-20">
        <SectionHeader
          badge="FAQ"
          badgeIcon={HelpCircle}
          title="अक्सर पूछे जाने वाले प्रश्न"
          subtitle="आपके सवालों के जवाब।"
        />

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none">
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex-1">
                  {faq.q}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-5 pb-5 -mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-10 md:p-14 text-white text-center mt-16 sm:mt-24">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/40 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-400/40 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-widest border border-white/25 mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Ready to Start?
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4">
            आज ही शुरू करें, <br />
            <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
              बिल्कुल मुफ़्त।
            </span>
          </h2>

          <p className="text-base sm:text-lg text-white/90 mb-8 max-w-lg mx-auto">
            अपना बोर्ड चुनें और chapter-wise तैयारी शुरू करें — किसी साइनअप की ज़रूरत नहीं।
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#boards"
              className="group inline-flex items-center gap-2 px-7 py-4 bg-white text-slate-900 rounded-2xl font-bold shadow-2xl shadow-black/25 hover:bg-white/95 hover:scale-[1.03] transition-all"
            >
              <PlayCircle className="w-5 h-5" />
              बोर्ड चुनें
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </a>
            <Link
              href="/ncert"
              className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-2xl font-semibold hover:bg-white/20 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              NCERT देखें
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          INFO NOTE — Tight with CTA
      ═══════════════════════════════════════════════ */}
      <section className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5 text-sm text-blue-900 dark:text-blue-100 leading-relaxed flex gap-3 mt-8 sm:mt-10">
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <p>
          <strong>ध्यान दें:</strong> UP, बिहार, MP और राजस्थान — सभी राज्य बोर्ड
          NCERT पाठ्यक्रम का पालन करते हैं। इसलिए यहाँ दी गई सामग्री सभी बोर्ड्स के
          छात्रों के लिए उपयोगी है।
        </p>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Local Components
// ═══════════════════════════════════════════════════════

function BigStat({
  icon: Icon,
  value,
  label,
  gradient,
}: {
  icon: any
  value: string
  label: string
  gradient: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] hover:shadow-xl transition-all hover:-translate-y-0.5">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
            {value}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}

function TrustBadge({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </div>
      <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
        {text}
      </span>
    </div>
  )
}

function SectionHeader({
  badge,
  badgeIcon: Icon,
  title,
  subtitle,
}: {
  badge: string
  badgeIcon: any
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-8 sm:mb-10">
      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
        <Icon className="w-3.5 h-3.5" />
        {badge}
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
        {title}
      </h2>
      <p className="text-base text-slate-600 dark:text-slate-400 mt-3 max-w-2xl">
        {subtitle}
      </p>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  gradient,
  highlight,
}: {
  icon: any
  title: string
  desc: string
  gradient: string
  highlight: string
}) {
  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${gradient}`} />
      <div className="flex items-start justify-between mb-5">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}
        >
          <Icon className="w-7 h-7" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
          {highlight}
        </span>
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function WhyCard({
  icon: Icon,
  stat,
  label,
  desc,
}: {
  icon: any
  stat: string
  label: string
  desc: string
}) {
  return (
    <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">
        {stat}
      </p>
      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2">{label}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}