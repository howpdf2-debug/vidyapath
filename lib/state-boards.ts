// ═══════════════════════════════════════════════════════
// STATE BOARDS — Config (Hindi Medium, Class 6-10)
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
}

export interface BoardSubject {
  slug: string
  db_name: string // ✅ CRITICAL FIX: DB name (e.g., 'Mathematics')
  name_hi: string
  name_en: string
  short: string
  icon: string
  gradient: string
  display_order: number
}

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
  },
]

// ✅ Subject map — DB English name → metadata
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
}

export const STATE_BOARD_CLASSES = [6, 7, 8, 9, 10] as const
export type StateBoardClass = (typeof STATE_BOARD_CLASSES)[number]

// ✅ Shared slug map (for sitemap + anywhere)
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
// HELPERS
// ═══════════════════════════════════════════════════════

export function getBoard(slug: string): StateBoard | null {
  return STATE_BOARDS.find((b) => b.slug === slug) || null
}

export function isValidClass(n: number): n is StateBoardClass {
  return (STATE_BOARD_CLASSES as readonly number[]).includes(n)
}

export function getSubjectMeta(dbSubject: string): BoardSubject {
  return (
    SUBJECT_HI_MAP[dbSubject] || {
      slug: dbSubject.toLowerCase().replace(/\s+/g, '-'),
      db_name: dbSubject,
      name_hi: dbSubject,
      name_en: dbSubject,
      short: dbSubject,
      icon: '📚',
      gradient: 'from-brand-500 to-purple-500',
      display_order: 999,
    }
  )
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

// ✅ Ordered subject list
export function getOrderedSubjects(dbSubjects: string[]): BoardSubject[] {
  return dbSubjects
    .map((s) => getSubjectMeta(s))
    .sort((a, b) => a.display_order - b.display_order)
}

// ✅ Universal slugify (shared by sitemap + pages)
export function slugify(text: string): string {
  if (SUBJECT_SLUG_MAP[text]) return SUBJECT_SLUG_MAP[text]
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}