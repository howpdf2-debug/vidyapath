import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BookOpen,
  FileText,
  ChevronRight,
  Home,
  Download,
  ArrowRight,
  Clock,
  AlertCircle,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BackButton } from '@/components/BackButton'
import { getPdfUrl, hasTwoParts } from '@/lib/pdf'

// ⚠️ Force dynamic so Vercel doesn't cache stale data
export const dynamic = 'force-dynamic'

// ==================== SEO ====================
export async function generateMetadata({
  params,
}: {
  params: { class: string; subject: string }
}): Promise<Metadata> {
  const classNum = params.class
  const subjectName = decodeURIComponent(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return buildMetadata({
    title: `Class ${classNum} ${subjectName} NCERT Solutions – Free PDF | VidyaPath`,
    description: `Free NCERT solutions for Class ${classNum} ${subjectName}. Chapter-wise notes, exercises, and PDF downloads.`,
    path: `/ncert/${params.class}/${params.subject}`,
    keywords: [
      `class ${classNum} ${subjectName}`,
      `ncert ${subjectName} class ${classNum}`,
      `${subjectName} solutions class ${classNum}`,
      'ncert solutions free',
    ],
  })
}

// ==================== SUBJECT META ====================
const SUBJECT_META: Record<string, { icon: any; gradient: string }> = {
  Mathematics: { icon: Calculator, gradient: 'from-blue-500 to-cyan-500' },
  Science: { icon: Atom, gradient: 'from-green-500 to-emerald-500' },
  Physics: { icon: Atom, gradient: 'from-purple-500 to-indigo-500' },
  Chemistry: { icon: FlaskConical, gradient: 'from-orange-500 to-red-500' },
  Biology: { icon: Dna, gradient: 'from-pink-500 to-rose-500' },
}

// ==================== PAGE ====================
export default async function NCERTSubjectPage({
  params,
  searchParams,
}: {
  params: { class: string; subject: string }
  searchParams: { lang?: string }
}) {
  const classNum = parseInt(params.class, 10)
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  if (isNaN(classNum)) notFound()

  // ⚠️ FIX: Capitalize subject for DB matching
  // URL me 'mathematics' aata hai, DB me 'Mathematics' hai
  const subject = decodeURIComponent(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const subjectName = subject // alias for display consistency

  const subjectMeta = SUBJECT_META[subject] || {
    icon: BookOpen,
    gradient: 'from-indigo-500 to-purple-500',
  }
  const SubjectIcon = subjectMeta.icon
  const twoParts = hasTwoParts(classNum, subject)

  const supabase = createServerClient()

  const { data: chapters, error } = await supabase
    .from('ncert')
    .select('id, class, subject, chapter_num, chapter_title, book_code, language')
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('language', lang)
    .order('chapter_num', { ascending: true })

  // ==================== ERROR STATE ====================
  if (error) {
    console.error('[ncert/subject] Error:', error)
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <BackButton
          href={`/ncert/${classNum}`}
          label="Back to Class"
          language={lang}
        />
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">
          Class {classNum} {subjectName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          ⚠️ Could not load chapters at the moment.
        </p>
        <Link
          href="/ncert"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <Home className="w-4 h-4" />
          Back to NCERT
        </Link>
      </div>
    )
  }

  // ==================== EMPTY STATE ====================
  if (!chapters || chapters.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6">
        <BackButton
          href={`/ncert/${classNum}`}
          label="Back to Class"
          language={lang}
        />
        <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">
            Class {classNum} {subjectName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            📭 Chapters coming soon
          </p>
          <Link
            href={`/ncert/${classNum}`}
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            <Home className="w-4 h-4" /> Back to Class
          </Link>
        </div>
      </div>
    )
  }

  const totalChapters = chapters.length

  // Group chapters by part (if 2-part book)
  const part1Chapters = twoParts
    ? chapters.filter((ch) => ch.book_code?.endsWith('1'))
    : chapters
  const part2Chapters = twoParts
    ? chapters.filter((ch) => ch.book_code?.endsWith('2'))
    : []

  // ==================== CHAPTER CARD ====================
  const ChapterCard = ({
    ch,
    partLabel,
  }: {
    ch: any
    partLabel?: string
  }) => {
    const pdfUrl = getPdfUrl(ch.book_code, classNum, ch.chapter_num)
    const chapterHref = `/ncert/${classNum}/${encodeURIComponent(
      subject
    )}/${ch.chapter_num}?lang=${lang}`

    return (
      <div className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 overflow-hidden">
        <div className="p-5">
          <Link
            href={chapterHref}
            className="flex items-start gap-3 mb-4 group/link"
          >
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${subjectMeta.gradient} flex items-center justify-center font-bold text-white text-lg shadow-md group-hover/link:scale-105 transition`}
            >
              {ch.chapter_num}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {lang === 'hi' ? 'अध्याय' : 'Chapter'} {ch.chapter_num}
                </p>
                {partLabel && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                    {partLabel}
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 mt-0.5 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition">
                {ch.chapter_title}
              </h3>
            </div>
          </Link>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 text-xs font-medium transition"
                title="Download NCERT PDF"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </a>
            )}
            <Link
              href={chapterHref}
              className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 text-xs font-medium transition"
            >
              {lang === 'hi' ? 'पढ़ें' : 'Read'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <BackButton
        href={`/ncert/${classNum}`}
        label="Back to Class"
        language={lang}
      />

      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link
          href="/"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
        >
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href="/ncert"
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          NCERT
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/ncert/${classNum}`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          Class {classNum}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {subjectName}
        </span>
      </nav>

      {/* HEADER */}
      <header
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${subjectMeta.gradient} p-8 md:p-10 text-white`}
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0 border border-white/30">
              <SubjectIcon className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                Class {classNum} •{' '}
                {lang === 'hi' ? 'हिंदी माध्यम' : 'English Medium'}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold break-words">
                {subjectName}
              </h1>
              <p className="mt-2 text-white/90 max-w-xl">
                {lang === 'hi'
                  ? 'पूर्ण NCERT समाधान, नोट्स, और मुफ्त PDF डाउनलोड'
                  : 'Complete NCERT Solutions, notes, and free PDF downloads'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20">
                  <FileText className="w-3.5 h-3.5" />
                  {totalChapters} {lang === 'hi' ? 'अध्याय' : 'Chapters'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20">
                  <Download className="w-3.5 h-3.5" /> Free PDF
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20">
                  <Clock className="w-3.5 h-3.5" /> Updated 2026
                </span>
              </div>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* CHAPTERS LIST */}
      {twoParts ? (
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                1
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {lang === 'hi' ? 'भाग 1' : 'Part 1'}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({part1Chapters.length}{' '}
                {lang === 'hi' ? 'अध्याय' : 'chapters'})
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {part1Chapters.map((ch) => (
                <ChapterCard
                  key={ch.id}
                  ch={ch}
                  partLabel={lang === 'hi' ? 'भाग 1' : 'Part 1'}
                />
              ))}
            </div>
          </section>

          {part2Chapters.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  2
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {lang === 'hi' ? 'भाग 2' : 'Part 2'}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({part2Chapters.length}{' '}
                  {lang === 'hi' ? 'अध्याय' : 'chapters'})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {part2Chapters.map((ch) => (
                  <ChapterCard
                    key={ch.id}
                    ch={ch}
                    partLabel={lang === 'hi' ? 'भाग 2' : 'Part 2'}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {lang === 'hi' ? 'सभी अध्याय' : 'All Chapters'}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalChapters} {lang === 'hi' ? 'कुल' : 'total'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((ch) => (
              <ChapterCard key={ch.id} ch={ch} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 p-6 md:p-8 text-center">
        <BookOpen className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {lang === 'hi' ? 'अन्य विषय देखें' : 'Explore Other Subjects'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto">
          {lang === 'hi'
            ? `कक्षा ${classNum} के अन्य विषयों के लिए NCERT समाधान देखें`
            : `Check out NCERT solutions for other Class ${classNum} subjects`}
        </p>
        <Link
          href={`/ncert/${classNum}?lang=${lang}`}
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          {lang === 'hi' ? 'कक्षा' : 'Class'} {classNum}
        </Link>
      </section>
    </div>
  )
}