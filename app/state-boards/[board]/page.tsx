import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Home,
  Layers,
  Languages,
  Sparkles,
  MapPin,
  BookOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'
import {
  STATE_BOARDS,
  getBoard,
  STATE_BOARD_CLASSES,
} from '@/lib/state-boards'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { board: string }
}

export async function generateStaticParams() {
  return STATE_BOARDS.map((b) => ({ board: b.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const board = getBoard(params.board)
  if (!board) return {}

  return buildMetadata({
    title: `${board.name_hi} – NCERT हिंदी माध्यम Class 6-10 | VidyaPath`,
    description: `${board.full_name_hi} के लिए Class 6-10 NCERT हिंदी पुस्तकें, नोट्स, PDF।`,
    path: `/state-boards/${board.slug}`,
    keywords: [
      board.name_hi,
      board.name_en,
      'NCERT Hindi',
      'Class 6-10',
      'free study material',
    ],
  })
}

export default async function BoardPage({ params }: PageProps) {
  const board = getBoard(params.board)
  if (!board) notFound()

  // Get class-wise chapter counts
  const supabase = createClient()
  const { data: classData } = await supabase
    .from('ncert')
    .select('class')
    .eq('language', 'hi')
    .gte('class', 6)
    .lte('class', 10)

  const classCounts: Record<number, number> = {}
  classData?.forEach((row) => {
    if (!classCounts[row.class]) classCounts[row.class] = 0
    classCounts[row.class]++
  })

  const totalChapters = classData?.length || 0

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* Back */}
      <Link
        href="/state-boards"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        सभी बोर्ड
      </Link>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="breadcrumb-scroll text-sm text-slate-500 dark:text-slate-400"
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">होम</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href="/state-boards" className="hover:text-brand-600">
            राज्य बोर्ड
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {board.name_hi}
          </span>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${board.gradient} p-6 sm:p-10 md:p-12 text-white`}
      >
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/15 rounded-full blur-[100px] animate-pulse-slow" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-5 border border-white/20">
            <Languages className="w-3.5 h-3.5" />
            <span>हिंदी माध्यम • NCERT</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl sm:text-6xl">{board.emoji}</div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {board.name_hi}
              </h1>
              <p className="text-base text-white/80 mt-1">{board.name_en}</p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-white/85 max-w-2xl mb-6 text-pretty">
            {board.full_name_hi}
          </p>

          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <GraduationCap className="w-3.5 h-3.5" />
              Class 6-10
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              {totalChapters}+ अध्याय
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <MapPin className="w-3.5 h-3.5" />
              {board.location_hi}
            </span>
          </div>
        </div>
      </section>

      {/* ═══ CLASSES ═══ */}
      <section aria-labelledby="classes-heading">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Classes
          </div>
          <h2
            id="classes-heading"
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            कक्षा चुनें
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Class 6 से 10 तक NCERT हिंदी माध्यम
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {STATE_BOARD_CLASSES.map((cls) => {
            const count = classCounts[cls] || 0

            return (
              <Link
                key={cls}
                href={`/state-boards/${board.slug}/${cls}`}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 transition-all hover:shadow-2xl hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${board.gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                />
                <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900 -z-10" />
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${board.gradient} opacity-0 group-hover:opacity-100 transition`}
                />

                <div className="relative text-center">
                  <div
                    className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${board.gradient} flex items-center justify-center text-white shadow-lg mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                    Class
                  </p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                    {cls}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2">
                    {count} अध्याय
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ═══ INFO CARD ═══ */}
      <section className="surface-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">
              NCERT हिंदी माध्यम
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              यहाँ आपको NCERT की official हिंदी माध्यम पुस्तकें मिलेंगी —
              Mathematics, Science और अन्य विषय। हर चैप्टर के साथ notes, videos,
              और free PDF downloads।
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}