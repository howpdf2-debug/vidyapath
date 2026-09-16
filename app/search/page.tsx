import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Search as SearchIcon, BookOpen, FileText, ArrowRight,
  Sparkles, TrendingUp, Calculator, Atom, FlaskConical, Dna,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Search NCERT Chapters & Notes | VidyaPath',
  description: 'Search across 460+ NCERT chapters, notes, and study material for Class 6-12.',
  path: '/search',
  keywords: ['search NCERT', 'find chapter', 'search notes'],
})

const SUBJECT_ICONS: Record<string, any> = {
  Mathematics: Calculator,
  Science: Atom,
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Dna,
}

const SUBJECT_GRADIENTS: Record<string, string> = {
  Mathematics: 'from-blue-500 to-cyan-500',
  Science: 'from-emerald-500 to-teal-500',
  Physics: 'from-purple-500 to-indigo-500',
  Chemistry: 'from-orange-500 to-red-500',
  Biology: 'from-green-500 to-emerald-500',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; lang?: string }
}) {
  const query = searchParams.q?.trim() || ''
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  const supabase = createServerClient()

  let results: any[] = []
  let error: any = null

  if (query && query.length >= 2) {
    const safeQuery = query.replace(/[,()%]/g, ' ')

    const { data, error: dbError } = await supabase
      .from('ncert')
      .select('id, class, subject, chapter_num, chapter_title, book_code, language')
      .eq('language', lang)
      .or(
        `chapter_title.ilike.%${safeQuery}%,subject.ilike.%${safeQuery}%`
      )
      .order('class', { ascending: true })
      .order('chapter_num', { ascending: true })
      .limit(50)

    results = data || []
    error = dbError
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Search Header */}
      <section className="text-center max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-widest mb-4 border border-brand-100 dark:border-brand-900/40">
          <SearchIcon className="w-3.5 h-3.5" />
          Search
        </div>
        <h1 className="text-[clamp(1.75rem,5vw,2.75rem)] font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
          {lang === 'hi' ? 'अध्याय खोजें' : 'Find Any Chapter'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {lang === 'hi'
            ? '460+ अध्याय, 18 विषय — खोजें और पढ़ें'
            : '460+ chapters, 18 subjects — search and start learning'}
        </p>
      </section>

      {/* Search Form */}
      <form method="GET" className="max-w-2xl mx-auto">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={
              lang === 'hi'
                ? 'अध्याय, विषय खोजें... (जैसे: Real Numbers, गणित)'
                : 'Search chapters, subjects... (e.g., Real Numbers, Math)'
            }
            autoFocus
            className="w-full pl-12 pr-28 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition font-medium"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition text-sm"
          >
            Search
          </button>
        </div>
        <input type="hidden" name="lang" value={lang} />
      </form>

      {/* Results */}
      {query.length < 2 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-5">
            <TrendingUp className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {lang === 'hi' ? 'कुछ लिखें' : 'Start typing'}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {lang === 'hi'
              ? 'कम से कम 2 अक्षर लिखें'
              : 'Enter at least 2 characters'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Real Numbers', 'Chemical Reactions', 'Trigonometry', 'Algebra'].map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}&lang=${lang}`}
                className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 transition"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="surface-card p-10 text-center">
          <p className="text-lg text-slate-600 mb-2">
            ⚠️ {lang === 'hi' ? 'कुछ गड़बड़ हो गई' : 'Something went wrong'}
          </p>
          <p className="text-sm text-slate-500">
            {lang === 'hi' ? 'कृपया दोबारा कोशिश करें' : 'Please try again'}
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {lang === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No results found'}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {lang === 'hi' ? 'दूसरे शब्दों से खोजें' : 'Try different keywords'}
          </p>
          <Link
            href={`/ncert?lang=${lang}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium"
          >
            <BookOpen className="w-4 h-4" />
            {lang === 'hi' ? 'NCERT देखें' : 'Browse NCERT'}
          </Link>
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {lang === 'hi' ? (
                <>
                  <strong className="text-slate-900 dark:text-white">{results.length}</strong> परिणाम मिले
                </>
              ) : (
                <>
                  Found <strong className="text-slate-900 dark:text-white">{results.length}</strong> results
                </>
              )}
            </p>
          </div>

          <div className="space-y-3">
            {results.map((item) => {
              const Icon = SUBJECT_ICONS[item.subject] || BookOpen
              const gradient = SUBJECT_GRADIENTS[item.subject] || 'from-brand-500 to-purple-500'
              const href = `/ncert/${item.class}/${encodeURIComponent(item.subject)}/${item.chapter_num}?lang=${lang}`

              return (
                <Link
                  key={item.id}
                  href={href}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                        Class {item.class} • {item.subject}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
                        Ch {item.chapter_num}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition line-clamp-2">
                      {item.chapter_title}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}