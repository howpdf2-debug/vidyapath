import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen, ArrowRight, Sparkles, FileText, Download, TrendingUp,
  Users, Layers, Play, Calculator, Atom, FlaskConical, Dna,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'

export const metadata: Metadata = buildMetadata({
  title: 'NCERT Solutions Class 6-12 – Free PDF & Notes | VidyaPath',
  description: 'Free NCERT solutions for Class 6-12. Mathematics, Science, Physics, Chemistry, Biology.',
  path: '/ncert',
  keywords: ['NCERT solutions', 'NCERT books', 'free NCERT PDF'],
})

const CLASSES = [
  { num: 6, gradient: 'from-sky-400 to-blue-500' },
  { num: 7, gradient: 'from-cyan-400 to-teal-500' },
  { num: 8, gradient: 'from-emerald-400 to-green-500' },
  { num: 9, gradient: 'from-lime-400 to-emerald-500' },
  { num: 10, gradient: 'from-amber-400 to-orange-500' },
  { num: 11, gradient: 'from-orange-400 to-red-500' },
  { num: 12, gradient: 'from-rose-400 to-pink-500' },
]

export default async function NCERTPage({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'
  const supabase = createServerClient()

  const { data: chapters } = await supabase
    .from('ncert')
    .select('class, subject')
    .eq('language', lang)

  const classData: Record<number, Record<string, number>> = {}
  chapters?.forEach((ch) => {
    if (!classData[ch.class]) classData[ch.class] = {}
    if (!classData[ch.class][ch.subject]) classData[ch.class][ch.subject] = 0
    classData[ch.class][ch.subject]++
  })

  const totalChapters = chapters?.length || 0
  const totalSubjects = new Set(chapters?.map((c) => c.subject) || []).size

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600 p-6 sm:p-10 md:p-14 text-white">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/30 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-400/30 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-400/30 rounded-full blur-[100px] animate-pulse-slow" />

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
              <Sparkles className="w-3.5 h-3.5" />
              <span>NCERT 2026 • Updated</span>
            </div>
            <LanguageToggle />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-5">
            NCERT Solutions,
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
              Class 6 se 12 Tak.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-8 text-pretty">
            Chapter-wise solutions, notes, aur free PDF downloads — sab kuch ek hi jagah, bilkul free.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href="#classes"
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-white/95 transition shadow-2xl shadow-black/20 hover:scale-[1.02]"
            >
              <BookOpen className="w-5 h-5" />
              Choose Class
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </a>
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/25 rounded-2xl font-semibold hover:bg-white/20 transition"
            >
              <FileText className="w-5 h-5" />
              Study Notes
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/90">
            <span className="inline-flex items-center gap-2">
              <span className="text-emerald-300">✓</span> {totalChapters}+ Chapters
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-yellow-300">✓</span> 7 Classes
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-pink-300">✓</span> 100% Free
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 sm:-mt-16 relative z-20">
        <BigStat value={`${totalChapters}+`} label="Chapters" gradient="from-brand-500 to-purple-500" />
        <BigStat value={`${totalSubjects}`} label="Subjects" gradient="from-emerald-500 to-teal-500" />
        <BigStat value="7" label="Classes" gradient="from-amber-500 to-orange-500" />
        <BigStat value="100%" label="Free" gradient="from-pink-500 to-rose-500" />
      </section>

      {/* ═══════════ CLASSES ═══════════ */}
      <section id="classes">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            <Layers className="w-3.5 h-3.5" />
            Pick Your Class
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Kaunsi Class Padhni Hai?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-3">
            Har class ke saare subjects, chapter-wise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CLASSES.map((cls) => {
            const subjects = classData[cls.num] || {}
            const subjectList = Object.keys(subjects)
            const total = Object.values(subjects).reduce((a, b) => a + b, 0)
            const remaining = subjectList.length - 3

            return (
              <Link
                key={cls.num}
                href={`/ncert/${cls.num}?lang=${lang}`}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 transition-all hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cls.gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
                <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900 -z-10" />
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cls.gradient} opacity-0 group-hover:opacity-100 transition`} />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cls.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                        Class
                      </p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                        {cls.num}
                      </p>
                    </div>
                  </div>

                  {subjectList.length > 0 ? (
                    <div className="space-y-1 mb-4">
                      {subjectList.slice(0, 3).map((sub) => (
                        <p key={sub} className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          • {sub}
                        </p>
                      ))}
                      {remaining > 0 && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                          +{remaining} more subject{remaining > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic mb-4">Coming soon</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {total} chapters
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400 group-hover:gap-2 transition-all">
                      Open
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ═══════════ WHAT YOU GET ═══════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-10 md:p-14 border border-slate-200 dark:border-slate-800">
        <div className="relative text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Everything Included
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Kya Kya Milta Hai?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Sab kuch jo exam ke liye chahiye — free, forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={BookOpen}
            title="Chapter-wise Notes"
            desc="Important points, formulas, aur exam-focused explanations."
            gradient="from-brand-500 to-purple-500"
          />
          <InfoCard
            icon={Download}
            title="Free PDF Downloads"
            desc="Official NCERT PDFs directly download karo — no watermark."
            gradient="from-red-500 to-pink-500"
          />
          <InfoCard
            icon={TrendingUp}
            title="Progress Tracking"
            desc="Login karke apna progress track karo — kabhi bhoole nahi."
            gradient="from-emerald-500 to-teal-500"
          />
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

function InfoCard({
  icon: Icon,
  title,
  desc,
  gradient,
}: {
  icon: any
  title: string
  desc: string
  gradient: string
}) {
  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}