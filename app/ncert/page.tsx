import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen, ArrowRight, Sparkles, FileText, Calculator, Atom,
  FlaskConical, Dna, TrendingUp, Download,
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
  { num: 6, color: 'from-blue-500 to-cyan-500', icon: BookOpen },
  { num: 7, color: 'from-green-500 to-emerald-500', icon: BookOpen },
  { num: 8, color: 'from-yellow-500 to-orange-500', icon: BookOpen },
  { num: 9, color: 'from-orange-500 to-red-500', icon: BookOpen },
  { num: 10, color: 'from-pink-500 to-rose-500', icon: BookOpen },
  { num: 11, color: 'from-purple-500 to-indigo-500', icon: BookOpen },
  { num: 12, color: 'from-indigo-500 to-blue-600', icon: BookOpen },
]

const SUBJECT_ICONS: Record<string, any> = {
  Mathematics: Calculator,
  Science: Atom,
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Dna,
}

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

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 p-8 md:p-12 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" /> NCERT 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">NCERT Solutions</h1>
            <p className="mt-3 text-lg text-white/90 max-w-2xl">
              Class 6-12 ke saare subjects — chapter-wise solutions, notes, aur free PDF downloads.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <FileText className="w-4 h-4" /> {totalChapters}+ Chapters
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <BookOpen className="w-4 h-4" /> 7 Classes
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <Download className="w-4 h-4" /> 100% Free
              </span>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </section>

      {/* CLASSES GRID */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Choose Your Class
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {CLASSES.map((cls) => {
            const subjects = classData[cls.num] || {}
            const subjectList = Object.keys(subjects)
            const total = Object.values(subjects).reduce((a, b) => a + b, 0)

            return (
              <Link
                key={cls.num}
                href={`/ncert/${cls.num}?lang=${lang}`}
                className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                <div className={`h-1.5 bg-gradient-to-r ${cls.color}`} />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cls.color} flex items-center justify-center text-white shadow-lg`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Class {cls.num}
                      </h3>
                      <p className="text-xs text-gray-500">{subjectList.length} subjects</p>
                    </div>
                  </div>

                  {subjectList.length > 0 ? (
                    <div className="space-y-1.5 mb-4">
                      {subjectList.slice(0, 3).map((sub) => {
                        const Icon = SUBJECT_ICONS[sub] || BookOpen
                        return (
                          <div key={sub} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <Icon className="w-3.5 h-3.5 text-gray-400" /> {sub}
                            </span>
                            <span className="text-xs text-gray-500">{subjects[sub]} ch</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic mb-4">Coming soon</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500">{total} chapters</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                      Open <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* INFO */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 md:p-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          What You Get
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard icon={BookOpen} title="Chapter-wise Notes" desc="Important points, formulas, exam-focused explanations." color="from-indigo-500 to-blue-500" />
          <InfoCard icon={Download} title="Free PDF Downloads" desc="Official NCERT PDFs directly download karo." color="from-red-500 to-pink-500" />
          <InfoCard icon={TrendingUp} title="Progress Tracking" desc="Login karke apna progress track karo." color="from-green-500 to-emerald-500" />
        </div>
      </section>
    </div>
  )
}

function InfoCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} text-white mb-4 shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
    </div>
  )
}