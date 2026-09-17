// ═══════════════════════════════════════════════════════
// STATE BOARDS — Config (Hindi Medium, Class 6-10)
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════
export interface StateBoard {
  slug: string
  name_hi: string
  name_en: string
  full_name_hi: string
  full_name_en: string
  emoji: string
  gradient: string
  location_hi: string
  location_en: string // 🆕
}

export interface BoardSubject {
  slug: string
  db_name: string          // ✅ DB name (e.g., 'Mathematics')
  name_hi: string
  name_en: string
  short: string
  icon: string
  gradient: string
  display_order: number
}

// 🆕 Type-safe board slug
export type BoardSlug = 'up' | 'bihar' | 'mp' | 'rajasthan'

// ═══════════════════════════════════════════════════════
// Boards
// ═══════════════════════════════════════════════════════
export const STATE_BOARDS: StateBoard[] = [
  {
    slug: 'up',
    name_hi: 'यूपी बोर्ड',
    name_en: 'UP Board',
    full_name_hi: 'उत्तर प्रदेश माध्यमिक शिक्षा परिषद',
    full_name_en: 'Uttar Pradesh Board',
    emoji: '🏛️',
    gradient: 'from-orange-500 via-red-500 to-rose-500',
    location_hi: 'प्रयागराज',
    location_en: 'Prayagraj',
  },
  {
    slug: 'bihar',
    name_hi: 'बिहार बोर्ड',
    name_en: 'Bihar Board',
    full_name_hi: 'बिहार विद्यालय परीक्षा समिति',
    full_name_en: 'Bihar School Examination Board',
    emoji: '📚',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    location_hi: 'पटना',
    location_en: 'Patna',
  },
  {
    slug: 'mp',
    name_hi: 'एमपी बोर्ड',
    name_en: 'MP Board',
    full_name_hi: 'माध्यमिक शिक्षा मंडल',
    full_name_en: 'Madhya Pradesh Board',
    emoji: '🎓',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    location_hi: 'भोपाल',
    location_en: 'Bhopal',
  },
  {
    slug: 'rajasthan',
    name_hi: 'राजस्थान बोर्ड',
    name_en: 'Rajasthan Board',
    full_name_hi: 'राजस्थान माध्यमिक शिक्षा बोर्ड',
    full_name_en: 'Rajasthan Board',
    emoji: '🌟',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    location_hi: 'अजमेर',
    location_en: 'Ajmer',
  },
]

// 🆕
export const BOARD_SLUGS: BoardSlug[] = ['up', 'bihar', 'mp', 'rajasthan']

// ═══════════════════════════════════════════════════════
// Subjects — DB English name → metadata
// ═══════════════════════════════════════════════════════
export const SUBJECT_HI_MAP: Record<string, BoardSubject> = {
  Mathematics: {
    slug: 'math',
    db_name: 'Mathematics',
    name_hi: 'गणित',
    name_en: 'Math',
    short: 'Math',
    icon: '📐',
    gradient: 'from-blue-500 to-cyan-500',
    display_order: 1,
  },
  Science: {
    slug: 'science',
    db_name: 'Science',
    name_hi: 'विज्ञान',
    name_en: 'Science',
    short: 'Science',
    icon: '🔬',
    gradient: 'from-emerald-500 to-teal-500',
    display_order: 2,
  },
  'Social Science': {
    slug: 'sst',
    db_name: 'Social Science',
    name_hi: 'सामाजिक विज्ञान',
    name_en: 'Social Science',
    short: 'SST',
    icon: '🌍',
    gradient: 'from-indigo-500 to-purple-500',
    display_order: 3,
  },
  Hindi: {
    slug: 'hindi',
    db_name: 'Hindi',
    name_hi: 'हिंदी',
    name_en: 'Hindi',
    short: 'Hindi',
    icon: '🕉️',
    gradient: 'from-amber-500 to-orange-500',
    display_order: 4,
  },
  English: {
    slug: 'english',
    db_name: 'English',
    name_hi: 'अंग्रेज़ी',
    name_en: 'English',
    short: 'English',
    icon: '📖',
    gradient: 'from-fuchsia-500 to-pink-500',
    display_order: 5,
  },
  Sanskrit: {
    slug: 'sanskrit',
    db_name: 'Sanskrit',
    name_hi: 'संस्कृत',
    name_en: 'Sanskrit',
    short: 'Sanskrit',
    icon: '📜',
    gradient: 'from-yellow-500 to-amber-500',
    display_order: 6,
  },
  // 🆕 Defensive — future classes 11-12 ke liye
  Physics: {
    slug: 'physics',
    db_name: 'Physics',
    name_hi: 'भौतिकी',
    name_en: 'Physics',
    short: 'Physics',
    icon: '⚛️',
    gradient: 'from-violet-500 to-purple-500',
    display_order: 7,
  },
  Chemistry: {
    slug: 'chemistry',
    db_name: 'Chemistry',
    name_hi: 'रसायन विज्ञान',
    name_en: 'Chemistry',
    short: 'Chemistry',
    icon: '🧪',
    gradient: 'from-pink-500 to-rose-500',
    display_order: 8,
  },
  Biology: {
    slug: 'biology',
    db_name: 'Biology',
    name_hi: 'जीव विज्ञान',
    name_en: 'Biology',
    short: 'Biology',
    icon: '🧬',
    gradient: 'from-green-500 to-emerald-500',
    display_order: 9,
  },
  History: {
    slug: 'history',
    db_name: 'History',
    name_hi: 'इतिहास',
    name_en: 'History',
    short: 'History',
    icon: '🏺',
    gradient: 'from-amber-600 to-yellow-500',
    display_order: 10,
  },
  Geography: {
    slug: 'geography',
    db_name: 'Geography',
    name_hi: 'भूगोल',
    name_en: 'Geography',
    short: 'Geography',
    icon: '🗺️',
    gradient: 'from-teal-500 to-cyan-500',
    display_order: 11,
  },
  Civics: {
    slug: 'civics',
    db_name: 'Civics',
    name_hi: 'नागरिक शास्त्र',
    name_en: 'Civics',
    short: 'Civics',
    icon: '⚖️',
    gradient: 'from-slate-500 to-gray-500',
    display_order: 12,
  },
  Economics: {
    slug: 'economics',
    db_name: 'Economics',
    name_hi: 'अर्थशास्त्र',
    name_en: 'Economics',
    short: 'Economics',
    icon: '💰',
    gradient: 'from-lime-500 to-green-500',
    display_order: 13,
  },
}

// ═══════════════════════════════════════════════════════
// Classes
// ═══════════════════════════════════════════════════════
export const STATE_BOARD_CLASSES = [6, 7, 8, 9, 10] as const
export type StateBoardClass = (typeof STATE_BOARD_CLASSES)[number]
export type ClassNumber = StateBoardClass // 🆕 alias

// 🆕 Class display metadata
export const CLASS_INFO: Record<StateBoardClass, { name: string; subtitle: string; gradient: string }> = {
  6:  { name: 'कक्षा 6',  subtitle: 'Class 6',  gradient: 'from-sky-400 to-blue-500' },
  7:  { name: 'कक्षा 7',  subtitle: 'Class 7',  gradient: 'from-cyan-400 to-teal-500' },
  8:  { name: 'कक्षा 8',  subtitle: 'Class 8',  gradient: 'from-emerald-400 to-green-500' },
  9:  { name: 'कक्षा 9',  subtitle: 'Class 9',  gradient: 'from-amber-400 to-orange-500' },
  10: { name: 'कक्षा 10', subtitle: 'Class 10', gradient: 'from-rose-400 to-pink-500' },
}

// 🆕 Language constant (DB confirmed: 'hi')
export const HINDI_LANG = 'hi' as const

// ═══════════════════════════════════════════════════════
// Slug maps
// ═══════════════════════════════════════════════════════
export const SUBJECT_SLUG_MAP: Record<string, string> = Object.entries(
  SUBJECT_HI_MAP
).reduce(
  (acc, [dbName, meta]) => {
    acc[dbName] = meta.slug
    acc[meta.name_hi] = meta.slug
    return acc
  },
  {} as Record<string, string>
)

// ═══════════════════════════════════════════════════════
// Helpers — Boards
// ═══════════════════════════════════════════════════════
export function getBoard(slug: string): StateBoard | null {
  return STATE_BOARDS.find((b) => b.slug === slug) || null
}

// 🆕 Type guard
export function isBoardSlug(s: string): s is BoardSlug {
  return BOARD_SLUGS.includes(s as BoardSlug)
}

// ═══════════════════════════════════════════════════════
// Helpers — Classes
// ═══════════════════════════════════════════════════════
export function isValidClass(n: number): n is StateBoardClass {
  return (STATE_BOARD_CLASSES as readonly number[]).includes(n)
}

// 🆕 Alias
export const isClassNumber = isValidClass

// 🆕
export function getClassInfo(n: StateBoardClass) {
  return CLASS_INFO[n]
}

// ═══════════════════════════════════════════════════════
// Helpers — Subjects
// ═══════════════════════════════════════════════════════

// ✅ Fallback — safe default (fixes `brand` dependency gap)
const DEFAULT_SUBJECT: Omit<BoardSubject, 'db_name'> = {
  slug: '',
  name_hi: '',
  name_en: '',
  short: '',
  icon: '📚',
  gradient: 'from-slate-500 to-gray-600', // ✅ safe tailwind colors
  display_order: 999,
}

export function getSubjectMeta(dbSubject: string): BoardSubject {
  const meta = SUBJECT_HI_MAP[dbSubject]
  if (meta) return meta

  // Fallback — build from unknown DB name
  return {
    ...DEFAULT_SUBJECT,
    slug: slugify(dbSubject),
    db_name: dbSubject,
    name_hi: dbSubject,
    name_en: dbSubject,
    short: dbSubject,
  }
}

export function getSubjectBySlug(slug: string): BoardSubject | null {
  return Object.values(SUBJECT_HI_MAP).find((s) => s.slug === slug) || null
}

export function getDbSubjectName(slug: string): string | null {
  return (
    Object.keys(SUBJECT_HI_MAP).find(
      (k) => SUBJECT_HI_MAP[k].slug === slug
    ) || null
  )
}

// 🆕 Better alias for pages
export const subjectSlugToDbName = getDbSubjectName

export function getOrderedSubjects(dbSubjects: string[]): BoardSubject[] {
  return dbSubjects
    .map((s) => getSubjectMeta(s))
    .sort((a, b) => a.display_order - b.display_order)
}

// 🆕 Direct helper — slug from DB name or Hindi
export function subjectToSlug(text: string): string {
  return slugify(text)
}

// ═══════════════════════════════════════════════════════
// Universal slugify
// ═══════════════════════════════════════════════════════

export function slugify(text: string): string {
  // 🆕 Defensive — handle null/undefined
  if (!text || typeof text !== 'string') return ''

  // Direct map lookup (DB name or Hindi name)
  if (SUBJECT_SLUG_MAP[text]) return SUBJECT_SLUG_MAP[text]

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// ═══════════════════════════════════════════════════════
// SEO helpers
// ═══════════════════════════════════════════════════════

// 🆕 JSON-LD for boards list
export function buildBoardsListJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'राज्य बोर्ड – कक्षा 6-10',
    inLanguage: 'hi-IN',
    hasPart: STATE_BOARDS.map((b) => ({
      '@type': 'EducationalOrganization',
      name: b.name_hi,
      alternateName: b.name_en,
      address: {
        '@type': 'PostalAddress',
        addressLocality: b.location_hi,
      },
    })),
  }
}

// 🆕 JSON-LD breadcrumb
export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// 🆕 SEO metadata for board page
export function buildBoardSeo(boardSlug: string) {
  const board = getBoard(boardSlug)
  if (!board) return null
  return {
    title: `${board.name_hi} कक्षा 6-10 – मुफ़्त NCERT हिंदी | VidyaPath`,
    description: `${board.name_hi} (${board.full_name_hi}, ${board.location_hi}) कक्षा 6-10 के NCERT हिंदी समाधान, नोट्स और मुफ़्त PDF डाउनलोड।`,
    keywords: [
      board.name_hi,
      board.name_en,
      board.full_name_hi,
      'NCERT हिंदी',
      'कक्षा 6-10 समाधान',
    ],
  }
}