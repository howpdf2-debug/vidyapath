import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen,
  FileText,
  ArrowRight,
  Sparkles,
  GraduationCap,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'

export const metadata: Metadata = buildMetadata({
  title: 'Study Notes Class 6-12 – Free Chapter-wise Notes | VidyaPath',
  description:
    'Free study notes for Class 6-12. Chapter-wise notes, key points, and revision material for all subjects.',
  path: '/notes',
  keywords: ['study notes', 'class notes', 'chapter notes', 'free notes'],
})

const CLASSES = [6, 7, 8, 9, 10, 11, 12]

export default async function NotesPage({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'
  const supabase = createServerClient()

  // Fetch all chapters + notes count per class
  const { data: chapters } = await supabase
    .from('ncert')
    .select('class, subject')
    .eq('language', lang)

  // Count subjects per class
  const classData: Record<number, Set<string>> = {}
  chapters?.forEach((ch) => {
    if (!classData[ch.class]) classData[ch.class] = new Set()
    classData[ch.class].add(ch.subject)
  })

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-800 dark:to-teal-800 p-8 md:p-12 text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Study Notes
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Chapter-wise Notes
            </h1>
            <p className="mt-3 text-lg text-white/90 max-w-2xl">
              Har chapter ke important points, formulas, aur revision material — exam ke liye perfect.
            </p>
          </div>
          <LanguageToggle />
        </div>
      </section>

      {/* CLASSES GRID */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Choose Your Class
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CLASSES.map((cls) => {
            const subjectCount = classData[cls]?.size || 0

            return (
              <Link
                key={cls}
                href={`/notes/${cls}?lang=${lang}`}
                className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                      Class
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cls}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {subjectCount} subjects
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* INFO */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 text-center">
        <BookOpen className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          NCERT ke saath Notes
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl mx-auto">
          Har chapter ke NCERT solutions ke saath hum chapter-wise notes bhi provide karte hain — exam preparation ke liye best.
        </p>
      </section>
    </div>
  )
}