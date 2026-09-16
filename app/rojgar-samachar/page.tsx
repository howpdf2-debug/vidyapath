import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import {
  FileText, Search, Briefcase, Sparkles, Calendar, ArrowRight,
  CheckCircle2, Bell, TrendingUp, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { LanguageToggle } from '@/components/LanguageToggle'
import { RefreshButton } from '@/components/RefreshButton'
import { buildMetadata } from '@/lib/seo'

const ITEMS_PER_PAGE = 10
const PAGINATION_WINDOW = 5

export const dynamic = 'force-dynamic'

// ==================== TYPES ====================
// ✅ FIX: proper types instead of `any`
interface Strings {
  heading: string
  subtitle: string
  lastUpdatedLabel: string
  all: string
  thisMonth: string
  lastMonth: string
  searchPlaceholder: string
  viewPdf: string
  fetchLatest: string
  errorTitle: string
  errorSub: string
  emptySub: string
  viewAll: string
  newBadge: string
  showingText: string
  ofText: string
  jobsText: string
}

interface EmptyMessages {
  all: string
  month: string
  lastmonth: string
}

// ==================== SEO ====================
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'

  if (lang === 'hi') {
    return buildMetadata({
      title: 'रोजगार समाचार 2026 – सरकारी नौकरी अपडेट | VidyaPath',
      description:
        'हर हफ्ते रोजगार समाचार – सरकारी नौकरी, सरकारी योजनाएँ, और भर्ती की जानकारी। रेलवे, SSC, बैंक, और राज्य सरकार की नौकरियाँ।',
      path: '/rojgar-samachar',
      keywords: ['रोजगार समाचार', 'सरकारी नौकरी', 'rojgar samachar', 'sarkari naukri'],
    })
  }

  return buildMetadata({
    title: 'Rojgar Samachar 2026 – Weekly Government Jobs Update | VidyaPath',
    description:
      'Weekly employment news – latest government job vacancies, recruitment notifications, and sarkari naukri updates. Railway, SSC, Bank, and State Government jobs.',
    path: '/rojgar-samachar',
    keywords: ['rojgar samachar', 'employment news', 'sarkari naukri', 'government jobs'],
  })
}

// ==================== HELPERS ====================
function getStrings(lang: 'en' | 'hi'): Strings {
  if (lang === 'hi') {
    return {
      heading: 'रोजगार समाचार',
      subtitle: 'साप्ताहिक सरकारी नौकरी अपडेट',
      lastUpdatedLabel: 'अंतिम अपडेट',
      all: 'सभी',
      thisMonth: 'इस महीने',
      lastMonth: 'पिछले महीने',
      searchPlaceholder: 'नौकरी खोजें...',
      viewPdf: 'PDF देखें',
      fetchLatest: 'ताज़ा खबरें लाएँ',
      errorTitle: 'अभी समाचार लोड नहीं हो सका',
      errorSub: 'कृपया रीफ्रेश करें या बाद में देखें।',
      emptySub: 'नए अपडेट यहाँ दिखेंगे जब प्रकाशित होंगे।',
      viewAll: 'सभी देखें',
      newBadge: 'नया',
      showingText: 'दिखा रहे हैं',
      ofText: 'में से',
      jobsText: 'नौकरियाँ',
    }
  }
  return {
    heading: 'Rojgar Samachar',
    subtitle: 'Weekly Government Job Updates',
    lastUpdatedLabel: 'Last updated',
    all: 'All',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    searchPlaceholder: 'Search jobs...',
    viewPdf: 'View PDF',
    fetchLatest: 'Fetch Latest',
    errorTitle: 'Could not load news',
    errorSub: 'Please try refreshing or check back later.',
    emptySub: 'New updates will appear here when published.',
    viewAll: 'View All',
    newBadge: 'New',
    showingText: 'Showing',
    ofText: 'of',
    jobsText: 'jobs',
  }
}

function getEmptyMessages(lang: 'en' | 'hi'): EmptyMessages {
  if (lang === 'hi') {
    return {
      all: 'अभी कोई रोजगार समाचार उपलब्ध नहीं है।',
      month: 'इस महीने कोई समाचार नहीं मिला।',
      lastmonth: 'पिछले महीने कोई समाचार नहीं मिला।',
    }
  }
  return {
    all: 'No employment news available right now.',
    month: 'No news found for this month.',
    lastmonth: 'No news found for last month.',
  }
}

// ✅ FIX: Compact date format (not "15 सितंबर 2026")
function formatDate(dateStr: string, lang: 'en' | 'hi'): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ✅ FIX: Pagination window (not all pages)
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= PAGINATION_WINDOW + 2) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | '...')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('...')
  pages.push(total)
  return pages
}

// ==================== PAGE ====================
export default async function RojgarSamacharPage({
  searchParams,
}: {
  searchParams: { lang?: string; filter?: string; q?: string; page?: string }
}) {
  const lang = searchParams.lang === 'hi' ? 'hi' : 'en'
  const filter = searchParams.filter || 'all'
  const query = searchParams.q?.trim() || ''

  const parsedPage = parseInt(searchParams.page || '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const offset = (page - 1) * ITEMS_PER_PAGE

  const t = getStrings(lang)
  const emptyMessages = getEmptyMessages(lang)

  const supabase = createServerClient()

  let supabaseQuery = supabase
    .from('rojgar_samachar')
    .select('*', { count: 'exact' })
    .eq('language', lang)
    .order('published_date', { ascending: false })

  if (filter === 'month') {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]
    supabaseQuery = supabaseQuery.gte('published_date', firstDayOfMonth)
  } else if (filter === 'lastmonth') {
    const now = new Date()
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .split('T')[0]
    const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]
    supabaseQuery = supabaseQuery
      .gte('published_date', firstDayOfLastMonth)
      .lt('published_date', firstDayOfThisMonth)
  }

  if (query) {
    const safeQuery = query.replace(/[,()]/g, ' ')
    supabaseQuery = supabaseQuery.or(
      `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
    )
  }

  supabaseQuery = supabaseQuery.range(offset, offset + ITEMS_PER_PAGE - 1)

  const [itemsResult, latestResult] = await Promise.all([
    supabaseQuery,
    supabase
      .from('rojgar_samachar')
      .select('created_at')
      .eq('language', lang)
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  const { data: items, count, error } = itemsResult
  const { data: latest } = latestResult

  const lastUpdated = latest?.[0]?.created_at
    ? new Date(latest[0].created_at).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN')
    : 'No data yet'

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0

  // ==================== ERROR ====================
  if (error) {
    console.error('Supabase error:', error)
    return (
      <div className="space-y-12 pb-16">
        <HeroBlock lang={lang} t={t} lastUpdated={lastUpdated} showStats={false} />
        <div className="surface-card p-10 text-center">
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
            ⚠️ {t.errorTitle}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t.errorSub}
          </p>
          <RefreshButton label={t.fetchLatest} />
        </div>
      </div>
    )
  }

  // ==================== EMPTY ====================
  if (!items || items.length === 0) {
    const isFiltered = filter !== 'all' || query.length > 0
    const emptyMessage =
      emptyMessages[filter as keyof EmptyMessages] || emptyMessages.all

    return (
      <div className="space-y-8 pb-16">
        <HeroBlock lang={lang} t={t} lastUpdated={lastUpdated} showStats={false} />
        <FilterBar lang={lang} filter={filter} query={query} t={t} />
        <div className="surface-card p-10 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
            {emptyMessage}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t.emptySub}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <RefreshButton label={t.fetchLatest} />
            {isFiltered && (
              <Link
                href={`?lang=${lang}&filter=all&page=1`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium"
              >
                {t.viewAll}
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ==================== NORMAL VIEW ====================
  const pageNumbers = getPageNumbers(page, totalPages)
  const showingFrom = offset + 1
  const showingTo = offset + items.length

  return (
    <div className="space-y-12 pb-16">
      <HeroBlock
        lang={lang}
        t={t}
        lastUpdated={lastUpdated}
        showStats={true}
        totalJobs={count || items.length}
      />

      <FilterBar lang={lang} filter={filter} query={query} t={t} />

      {/* ✅ FIX: Result count display */}
      {count && count > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t.showingText}{' '}
            <strong className="text-slate-900 dark:text-white">
              {showingFrom}-{showingTo}
            </strong>{' '}
            {t.ofText}{' '}
            <strong className="text-slate-900 dark:text-white">{count}</strong>{' '}
            {t.jobsText}
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {t.showingText} {page}/{totalPages}
            </p>
          )}
        </div>
      )}

      {/* News List */}
      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            /* ✅ FIX: removed dead animationDelay inline style */
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent p-5 sm:p-6 transition-all hover:shadow-2xl focus-within:ring-2 focus-within:ring-brand-500"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900 -z-10" />

            <div className="relative flex flex-wrap justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.published_date, lang)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t.newBadge}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                  {item.title}
                </h2>

                {item.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {item.pdf_url && (
                <a
                  href={item.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition font-semibold text-sm flex-shrink-0 shadow-lg shadow-brand-500/30"
                  aria-label={`View PDF: ${item.title}`}
                >
                  <FileText className="w-4 h-4" />
                  {t.viewPdf}
                </a>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* ✅ FIX: Pagination with window */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex justify-center items-center gap-1.5 flex-wrap">
          {page > 1 && (
            <Link
              href={`?lang=${lang}&filter=${filter}&q=${encodeURIComponent(query)}&page=${page - 1}`}
              className="min-w-[44px] h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600 transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}

          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="min-w-[44px] h-11 flex items-center justify-center text-slate-400"
              >
                …
              </span>
            ) : (
              <Link
                key={p}
                href={`?lang=${lang}&filter=${filter}&q=${encodeURIComponent(query)}&page=${p}`}
                aria-current={p === page ? 'page' : undefined}
                className={`min-w-[44px] h-11 flex items-center justify-center rounded-xl text-sm font-bold transition ${
                  p === page
                    ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-500/30'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600'
                }`}
              >
                {p}
              </Link>
            )
          )}

          {page < totalPages && (
            <Link
              href={`?lang=${lang}&filter=${filter}&q=${encodeURIComponent(query)}&page=${page + 1}`}
              className="min-w-[44px] h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600 transition"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </nav>
      )}

      {/* Subscribe CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-brand-50 to-purple-50 dark:from-slate-900 dark:via-brand-950/40 dark:to-purple-950/40 p-6 sm:p-10 border border-brand-100 dark:border-brand-900/40">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 shadow-xl mb-5">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            {lang === 'hi' ? 'नई नौकरियों की जानकारी सबसे पहले' : 'Get Job Alerts First'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {lang === 'hi'
              ? 'हर हफ्ते नए रोजगार समाचार — बिल्कुल मुफ्त, कोई स्पैम नहीं।'
              : 'Weekly employment updates — 100% free, no spam.'}
          </p>
          <Link
            href={`/signup?lang=${lang}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-xl hover:scale-[1.02] transition shadow-lg shadow-brand-500/30"
          >
            <Sparkles className="w-4 h-4" />
            {lang === 'hi' ? 'साइन अप करें' : 'Sign Up Free'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

// ==================== HERO BLOCK ====================
function HeroBlock({
  lang,
  t,
  lastUpdated,
  showStats,
  totalJobs,
}: {
  lang: 'en' | 'hi'
  t: Strings
  lastUpdated: string
  showStats: boolean
  totalJobs?: number
}) {
  const stats = [
    { value: `${totalJobs || 0}+`, label: lang === 'hi' ? 'कुल नौकरियाँ' : 'Total Jobs', gradient: 'from-brand-500 to-purple-500' },
    { value: 'Live', label: lang === 'hi' ? 'स्टेटस' : 'Status', gradient: 'from-emerald-500 to-teal-500' },
    { value: '24/7', label: lang === 'hi' ? 'अपडेट' : 'Updates', gradient: 'from-amber-500 to-orange-500' },
    { value: '100%', label: lang === 'hi' ? 'मुफ्त' : 'Free', gradient: 'from-pink-500 to-rose-500' },
  ]

  return (
    <>
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
              <Briefcase className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'साप्ताहिक अपडेट' : 'Weekly Updates'}</span>
            </div>
            <LanguageToggle />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-5">
            {lang === 'hi' ? (
              <>
                सरकारी नौकरी,
                <br />
                <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                  तुरंत पाएँ.
                </span>
              </>
            ) : (
              <>
                Sarkari Naukri,
                <br />
                <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                  Updated Weekly.
                </span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-6 text-pretty">
            {lang === 'hi'
              ? 'हर हफ्ते रोजगार समाचार — रेलवे, SSC, बैंक, और राज्य सरकार की नौकरियाँ।'
              : 'Weekly employment news — Railway, SSC, Bank, and State Government jobs.'}
          </p>

          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {t.lastUpdatedLabel}: {lastUpdated}
            </span>
          </div>
        </div>
      </section>

      {showStats && (
        <section
          aria-label="Stats"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 sm:-mt-16 relative z-20"
        >
          {stats.map((s) => (
            <BigStat key={s.label} {...s} />
          ))}
        </section>
      )}
    </>
  )
}

// ==================== FILTER BAR ====================
function FilterBar({
  lang,
  filter,
  query,
  t,
}: {
  lang: 'en' | 'hi'
  filter: string
  query: string
  t: Strings
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-wrap gap-2">
        <FilterLink
          href={`?lang=${lang}&filter=all&q=${encodeURIComponent(query)}&page=1`}
          active={filter === 'all'}
        >
          {t.all}
        </FilterLink>
        <FilterLink
          href={`?lang=${lang}&filter=month&q=${encodeURIComponent(query)}&page=1`}
          active={filter === 'month'}
        >
          {t.thisMonth}
        </FilterLink>
        <FilterLink
          href={`?lang=${lang}&filter=lastmonth&q=${encodeURIComponent(query)}&page=1`}
          active={filter === 'lastmonth'}
        >
          {t.lastMonth}
        </FilterLink>
      </div>

      <form method="GET" className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <input
            type="text"
            name="q"
            placeholder={t.searchPlaceholder}
            defaultValue={query}
            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
            aria-label={t.searchPlaceholder}
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="filter" value={filter} />
        {/* ✅ FIX: reset page to 1 on new search */}
        <input type="hidden" name="page" value="1" />
      </form>
    </div>
  )
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
        active
          ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-500/30'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600'
      }`}
    >
      {children}
    </Link>
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