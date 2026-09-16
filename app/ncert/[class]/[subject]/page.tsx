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
  BookMarked,
  FlaskRound,
  Sparkles,
  TrendingUp,
  Layers,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import { LanguageToggle } from '@/components/LanguageToggle'
import { BackButton } from '@/components/BackButton'
import { getPdfUrl, hasTwoParts } from '@/lib/pdf'

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

// ==================== MOBILE SHORT NAMES ====================
const MOBILE_SHORT_NAMES: Record<string, string> = {
  Mathematics: 'Math',
  Chemistry: 'Chem',
  Biology: 'Bio',
  'Social Science': 'SST',
  'Environmental Science': 'EVS',
}

function getShortName(name: string): string {
  return MOBILE_SHORT_NAMES[name] || name
}

// ==================== SUBJECT META ====================
const SUBJECT_META: Record<
  string,
  { icon: any; gradient: string; soft: string; emoji: string }
> = {
  Mathematics: {
    icon: Calculator,
    gradient: 'from-blue-500 to-cyan-500',
    soft: 'subject-math',
    emoji: '📐',
  },
  Science: {
    icon: Atom,
    gradient: 'from-emerald-500 to-teal-500',
    soft: 'subject-science',
    emoji: '🔬',
  },
  Physics: {
    icon: Atom,
    gradient: 'from-purple-500 to-indigo-500',
    soft: 'subject-physics',
    emoji: '⚛️',
  },
  Chemistry: {
    icon: FlaskConical,
    gradient: 'from-orange-500 to-red-500',
    soft: 'subject-chemistry',
    emoji: '🧪',
  },
  Biology: {
    icon: Dna,
    gradient: 'from-green-500 to-emerald-500',
    soft: 'subject-biology',
    emoji: '🧬',
  },
  English: {
    icon: BookOpen,
    gradient: 'from-fuchsia-500 to-pink-500',
    soft: 'subject-english',
    emoji: '📖',
  },
  Hindi: {
    icon: BookMarked,
    gradient: 'from-amber-500 to-orange-500',
    soft: 'subject-hindi',
    emoji: '🕉️',
  },
  'Social Science': {
    icon: BookOpen,
    gradient: 'from-cyan-500 to-blue-500',
    soft: 'subject-general',
    emoji: '🌍',
  },
  'Environmental Science': {
    icon: FlaskRound,
    gradient: 'from-lime-500 to-green-500',
    soft: 'subject-general',
    emoji: '🌱',
  },
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

  const subject = decodeURIComponent(params.subject)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const subjectName = subject

  const subjectMeta = SUBJECT_META[subject] || {
    icon: BookOpen,
    gradient: 'from-brand-500 to-purple-500',
    soft: 'subject-general',
    emoji: '📚',
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
      <div className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <BackButton
          href={`/ncert/${classNum}`}
          label="Back to Class"
          language={lang as 'en' | 'hi'}
        />
        <div className="surface-card p-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-950/40 mb-5">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Class {classNum} {subjectName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            ⚠️ Chapters load nahi ho pa rahe. Please try again in a moment.
          </p>
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium shadow-brand"
          >
            <Home className="w-4 h-4" />
            Back to NCERT
          </Link>
        </div>
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
          language={lang as 'en' | 'hi'}
        />
        <div className="surface-card text-center py-16 px-6 relative overflow-hidden">
          {/* Decorative background */}
          <div className={`absolute inset-0 ${subjectMeta.soft} opacity-30`} />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-slate-800 shadow-lg mb-6">
              <span className="text-5xl">{subjectMeta.emoji}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Class {classNum} {subjectName}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {lang === 'hi'
                ? '📚 इस विषय के अध्याय जल्द ही जोड़े जा रहे हैं'
                : '📚 Chapters for this subject are being added soon'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/ncert/${classNum}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium shadow-brand"
              >
                <Home className="w-4 h-4" />
                {lang === 'hi' ? 'कक्षा देखें' : 'View Class'}
              </Link>
              <Link
                href="/ncert"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium"
              >
                <BookOpen className="w-4 h-4" />
                {lang === 'hi' ? 'NCERT देखें' : 'Browse NCERT'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalChapters = chapters.length

  // Chapter split logic
  const part1Chapters = twoParts
    ? chapters.filter((ch) => ch.book_code?.endsWith('1'))
    : chapters
  const part2Chapters = twoParts
    ? chapters.filter((ch) => ch.book_code?.endsWith('2'))
    : []

  const useFallbackLayout =
    twoParts && part1Chapters.length === 0 && part2Chapters.length === 0

  // ==================== CHAPTER CARD ====================
  const ChapterCard = ({
    ch,
    partLabel,
    index,
  }: {
    ch: any
    partLabel?: string
    index: number
  }) => {
    const pdfUrl = getPdfUrl(ch.book_code, classNum, ch.chapter_num)
    const chapterHref = `/ncert/${classNum}/${encodeURIComponent(
      subject
    )}/${ch.chapter_num}?lang=${lang}`

    return (
      <div
        className="group relative surface-card hover:shadow-cardHover hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-950"
        style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
      >
        {/* Subject color accent bar (top) */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${subjectMeta.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        <div className="p-4 sm:p-5">
          <Link
            href={chapterHref}
            className="flex items-start gap-3 mb-3 group/link focus:outline-none"
          >
            {/* Chapter number badge — enhanced with ring + glow */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${subjectMeta.gradient} flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-md group-hover/link:scale-105 group-hover/link:shadow-lg transition-all duration-300`}
              >
                {ch.chapter_num}
              </div>
              {/* Subtle outer ring on hover */}
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${subjectMeta.gradient} opacity-0 group-hover/link:opacity-30 group-hover/link:scale-125 blur-md transition-all duration-300 -z-10`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                  {lang === 'hi' ? 'अध्याय' : 'Chapter'} {ch.chapter_num}
                </p>
                {partLabel && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 uppercase tracking-wide">
                    {partLabel}
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover/link:text-brand-600 dark:group-hover/link:text-brand-400 transition-colors">
                {ch.chapter_title}
              </h3>
            </div>
          </Link>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 text-xs font-medium transition tap-target focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                title="Download NCERT PDF"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </a>
            )}
            <Link
              href={chapterHref}
              className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-950/50 text-xs font-medium transition tap-target group-hover:gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {lang === 'hi' ? 'पढ़ें' : 'Read'}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ==================== PART HEADER ====================
  const PartHeader = ({
    number,
    title,
    count,
    color,
  }: {
    number: number
    title: string
    count: number
    color: string
  }) => (
    <div className="flex items-center gap-3 mb-5">
      <div
        className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-base font-bold shadow-lg`}
      >
        {number}
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} opacity-40 blur-md -z-10`}
        />
      </div>
      <div className="flex-1">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {count} {lang === 'hi' ? 'अध्याय' : 'chapters'}
        </p>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <BackButton
        href={`/ncert/${classNum}`}
        label="Back to Class"
        language={lang as 'en' | 'hi'}
      />

      {/* BREADCRUMB — sticky on mobile */}
      <nav className="sticky top-14 sm:top-16 z-30 -mx-4 px-4 py-2 bg-paper/80 dark:bg-ink/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 md:static md:mx-0 md:px-0 md:py-0 md:bg-transparent md:border-0 md:backdrop-blur-none">
        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 overflow-x-auto scrollbar-none whitespace-nowrap">
          <Link
            href="/"
            className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 flex-shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link
            href="/ncert"
            className="hover:text-brand-600 dark:hover:text-brand-400 flex-shrink-0"
          >
            NCERT
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link
            href={`/ncert/${classNum}`}
            className="hover:text-brand-600 dark:hover:text-brand-400 flex-shrink-0"
          >
            Class {classNum}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium flex-shrink-0">
            {subjectName}
          </span>
        </div>
      </nav>

      {/* ═══════════════ HEADER ═══════════════ */}
      <header
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${subjectMeta.gradient} p-5 sm:p-6 md:p-8 text-white`}
      >
        {/* Decorative blurs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-3xl" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10">
          {/* Row 1: Badge + LanguageToggle */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium border border-white/20">
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="whitespace-nowrap">
                Class {classNum} •{' '}
                {lang === 'hi' ? 'हिंदी माध्यम' : 'English Medium'}
              </span>
            </div>
            <div className="flex-shrink-0">
              <LanguageToggle />
            </div>
          </div>

          {/* Row 2: Icon + Heading */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative p-2.5 sm:p-3 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0 border border-white/30">
              <SubjectIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              <div className="absolute inset-0 rounded-xl bg-white/30 opacity-0 hover:opacity-100 transition-opacity" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              <span className="sm:hidden">{getShortName(subjectName)}</span>
              <span className="hidden sm:inline">{subjectName}</span>
            </h1>
          </div>

          {/* Row 3: Description */}
          <p className="text-sm sm:text-base text-white/90 mb-4 leading-relaxed max-w-xl">
            {lang === 'hi'
              ? 'पूर्ण NCERT समाधान, नोट्स, और मुफ्त PDF डाउनलोड'
              : 'Complete NCERT Solutions, notes, and free PDF downloads'}
          </p>

          {/* Row 4: Stats badges */}
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 border border-white/20 whitespace-nowrap backdrop-blur-sm">
              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="font-medium">{totalChapters}</span>
              {lang === 'hi' ? 'अध्याय' : 'Chapters'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 border border-white/20 whitespace-nowrap backdrop-blur-sm">
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Free PDF
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 border border-white/20 whitespace-nowrap backdrop-blur-sm">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Updated 2026
            </span>
          </div>
        </div>
      </header>

      {/* ═══════════════ CHAPTERS LIST ═══════════════ */}
      {twoParts && !useFallbackLayout ? (
        <div className="space-y-10">
          {part1Chapters.length > 0 && (
            <section>
              <PartHeader
                number={1}
                title={lang === 'hi' ? 'भाग 1' : 'Part 1'}
                count={part1Chapters.length}
                color="from-brand-500 to-purple-500"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {part1Chapters.map((ch, idx) => (
                  <ChapterCard
                    key={ch.id}
                    ch={ch}
                    index={idx}
                    partLabel={lang === 'hi' ? 'भाग 1' : 'Part 1'}
                  />
                ))}
              </div>
            </section>
          )}

          {part2Chapters.length > 0 && (
            <section>
              <PartHeader
                number={2}
                title={lang === 'hi' ? 'भाग 2' : 'Part 2'}
                count={part2Chapters.length}
                color="from-emerald-500 to-teal-500"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {part2Chapters.map((ch, idx) => (
                  <ChapterCard
                    key={ch.id}
                    ch={ch}
                    index={idx}
                    partLabel={lang === 'hi' ? 'भाग 2' : 'Part 2'}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              {lang === 'hi' ? 'सभी अध्याय' : 'All Chapters'}
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {totalChapters} {lang === 'hi' ? 'कुल' : 'total'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {chapters.map((ch, idx) => (
              <ChapterCard key={ch.id} ch={ch} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-950/40 dark:to-blue-950/40 border border-brand-100 dark:border-brand-900/40 p-6 md:p-8">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />

        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg mb-4">
            <BookOpen className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
            {lang === 'hi' ? 'अन्य विषय देखें' : 'Explore Other Subjects'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
            {lang === 'hi'
              ? `कक्षा ${classNum} के अन्य विषयों के लिए NCERT समाधान देखें`
              : `Check out NCERT solutions for other Class ${classNum} subjects`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <Link
              href={`/ncert/${classNum}?lang=${lang}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition text-sm font-medium shadow-brand"
            >
              <Home className="w-4 h-4" />
              {lang === 'hi' ? 'कक्षा' : 'Class'} {classNum}
            </Link>
            <Link
              href={`/notes/${classNum}/${encodeURIComponent(subject)}?lang=${lang}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              {lang === 'hi' ? 'नोट्स देखें' : 'View Notes'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}