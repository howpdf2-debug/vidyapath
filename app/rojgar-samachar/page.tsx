import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import { FileText, Search } from 'lucide-react'
import { LanguageToggle } from '@/components/LanguageToggle'
import { RefreshButton } from '@/components/RefreshButton'
import { buildMetadata } from '@/lib/seo'

const ITEMS_PER_PAGE = 10

// ✅ Fresh data always
export const dynamic = 'force-dynamic'

// ==================== SEO METADATA ====================
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
      keywords: [
        'रोजगार समाचार',
        'सरकारी नौकरी',
        'rojgar samachar',
        'sarkari naukri',
      ],
    })
  }

  return buildMetadata({
    title: 'Rojgar Samachar 2026 – Weekly Government Jobs Update | VidyaPath',
    description:
      'Weekly employment news – latest government job vacancies, recruitment notifications, and sarkari naukri updates. Railway, SSC, Bank, and State Government jobs.',
    path: '/rojgar-samachar',
    keywords: [
      'rojgar samachar',
      'employment news',
      'sarkari naukri',
      'government jobs',
      'recruitment 2026',
    ],
  })
}

// ==================== PAGE COMPONENT ====================
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

  const supabase = createServerClient()

  // ===== Build main query =====
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
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    )
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
    // Escape commas/parens to avoid breaking .or() syntax
    const safeQuery = query.replace(/[,()]/g, ' ')
    supabaseQuery = supabaseQuery.or(
      `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
    )
  }

  supabaseQuery = supabaseQuery.range(offset, offset + ITEMS_PER_PAGE - 1)

  // ===== Run both queries in parallel =====
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
    ? new Date(latest[0].created_at).toLocaleString('en-IN')
    : 'No data yet'

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0

  // ===== i18n strings =====
  const t = {
    heading: '📰 Rojgar Samachar',
    subtitle:
      lang === 'hi' ? 'साप्ताहिक रोजगार समाचार' : 'Weekly Employment News',
    lastUpdatedLabel: lang === 'hi' ? 'अंतिम अपडेट' : 'Last updated',
    all: lang === 'hi' ? 'सभी' : 'All',
    thisMonth: lang === 'hi' ? 'इस महीने' : 'This Month',
    lastMonth: lang === 'hi' ? 'पिछले महीने' : 'Last Month',
    searchPlaceholder: lang === 'hi' ? 'खोजें...' : 'Search...',
    viewPdf: lang === 'hi' ? 'PDF देखें' : 'View PDF',
    fetchLatest: lang === 'hi' ? 'ताज़ा खबरें लाएँ' : 'Fetch Latest News',
    errorTitle:
      lang === 'hi'
        ? '⚠️ अभी समाचार लोड नहीं हो सका'
        : '⚠️ Could not load news at the moment',
    errorSub:
      lang === 'hi'
        ? 'कृपया रीफ्रेश करें या बाद में देखें।'
        : 'Please try refreshing or check back later.',
    emptyForFilter: {
      all:
        lang === 'hi'
          ? 'अभी कोई रोजगार समाचार उपलब्ध नहीं है।'
          : 'No employment news available right now.',
      month:
        lang === 'hi'
          ? 'इस महीने कोई समाचार नहीं मिला।'
          : 'No news found for this month.',
      lastmonth:
        lang === 'hi'
          ? 'पिछले महीने कोई समाचार नहीं मिला।'
          : 'No news found for last month.',
    },
    emptySub:
      lang === 'hi'
        ? 'नए अपडेट यहाँ दिखेंगे जब प्रकाशित होंगे।'
        : 'New updates will appear here when published.',
    viewAll: lang === 'hi' ? 'सभी समाचार देखें' : 'View All News',
  } as const

  const emptyMessage =
    t.emptyForFilter[filter as keyof typeof t.emptyForFilter] ||
    t.emptyForFilter.all

  // ===== DB ERROR =====
  if (error) {
    console.error('Supabase error:', error)
    return (
      <div className="space-y-8">
        <HeaderBar lang={lang} t={t} lastUpdated={lastUpdated} />
        <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {t.errorTitle}
          </p>
          <p className="text-sm text-gray-400 mt-2">{t.errorSub}</p>
          <div className="mt-4">
            <RefreshButton label={t.fetchLatest} />
          </div>
        </div>
      </div>
    )
  }

  // ===== EMPTY STATE =====
  if (!items || items.length === 0) {
    const isFiltered = filter !== 'all' || query.length > 0
    return (
      <div className="space-y-8">
        <HeaderBar lang={lang} t={t} lastUpdated={lastUpdated} />
        <FilterBar lang={lang} filter={filter} query={query} t={t} />
        <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            📭 {emptyMessage}
          </p>
          <p className="text-sm text-gray-400 mt-2">{t.emptySub}</p>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <RefreshButton label={t.fetchLatest} />
            {isFiltered && (
              <Link
                href={`?lang=${lang}&filter=all&page=1`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {t.viewAll}
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ===== NORMAL VIEW =====
  return (
    <div className="space-y-8">
      <HeaderBar lang={lang} t={t} lastUpdated={lastUpdated} />
      <FilterBar lang={lang} filter={filter} query={query} t={t} />

      {/* News List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition"
          >
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.published_date).toLocaleDateString(
                    lang === 'hi' ? 'hi-IN' : 'en-IN',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }
                  )}
                </p>
                <h2 className="text-xl font-bold mt-1">{item.title}</h2>
                {item.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              {item.pdf_url && (
                <a
                  href={item.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 flex-shrink-0"
                >
                  <FileText className="w-4 h-4" /> {t.viewPdf}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?lang=${lang}&filter=${filter}&q=${encodeURIComponent(query)}&page=${p}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                p === page
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== Sub-components ====================

function HeaderBar({
  t,
  lastUpdated,
}: {
  lang: 'en' | 'hi'
  t: any
  lastUpdated: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold">{t.heading}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        <p className="text-xs text-gray-400 mt-1">
          {t.lastUpdatedLabel}: {lastUpdated}
        </p>
      </div>
      <LanguageToggle />
    </div>
  )
}

function FilterBar({
  lang,
  filter,
  query,
  t,
}: {
  lang: 'en' | 'hi'
  filter: string
  query: string
  t: any
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
            className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="filter" value={filter} />
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
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        active
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </Link>
  )
}