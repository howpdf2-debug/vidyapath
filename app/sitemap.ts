import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { EXAMS, SUBJECTS, TOPICS } from '@/lib/exams'

// ==================== CONSTANTS ====================
// ✅ FIX: Use env variable (fallback to vercel URL until domain connected)
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://vidyapath-psi.vercel.app'

const LANGUAGES = ['en', 'hi'] as const
const STATE_BOARDS = ['up', 'bihar', 'mp', 'rajasthan'] as const
const CLASSES = [6, 7, 8, 9, 10, 11, 12] as const

// ✅ FIX: Stable lastModified — monthly refresh
const CONTENT_LASTMOD = new Date('2026-01-01')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ==================== HELPERS ====================

// ✅ FIX: Slug-safe encoding (Hindi subjects → slugs)
function slugify(text: string): string {
  const map: Record<string, string> = {
    'गणित': 'math',
    'विज्ञान': 'science',
    'सामान्य विज्ञान': 'science',
    'भौतिकी': 'physics',
    'रसायन विज्ञान': 'chemistry',
    'जीव विज्ञान': 'biology',
    'अंग्रेज़ी': 'english',
    'हिंदी': 'hindi',
    'इतिहास': 'history',
    'भूगोल': 'geography',
    'राजव्यवस्था': 'polity',
    'अर्थव्यवस्था': 'economy',
    'करेंट अफेयर्स': 'ca',
    'स्टेटिक जीके': 'static-gk',
    'विविध': 'misc',
  }
  if (map[text]) return map[text]
  // Fallback: lowercase + dash
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// ✅ FIX: Hindi-first x-default
function makeAlternates(path: string) {
  return {
    languages: {
      // ✅ Hindi as x-default (site is Hindi-first)
      'x-default': `${SITE_URL}${path}`,
      en: `${SITE_URL}${path}?lang=en`,
      hi: `${SITE_URL}${path}?lang=hi`,
    },
  }
}

function makeEntry({
  path,
  lastModified = CONTENT_LASTMOD,
  priority = 0.5,
  changeFrequency = 'weekly',
  includeLanguages = true,
}: {
  path: string
  lastModified?: Date | string
  priority?: number
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']
  includeLanguages?: boolean
}): MetadataRoute.Sitemap[number] {
  const url = `${SITE_URL}${path}`
  const lastMod =
    typeof lastModified === 'string' ? new Date(lastModified) : lastModified

  return {
    url,
    lastModified: isNaN(lastMod.getTime()) ? CONTENT_LASTMOD : lastMod,
    changeFrequency,
    priority,
    alternates: includeLanguages ? makeAlternates(path) : undefined,
  }
}

// ==================== MAIN SITEMAP ====================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  const ncertMap = new Map<
    number,
    { class: number; subject: string; chapter_num: number }
  >()

  // ═══════════════════════════════════════════════════════
  // 1. STATIC PAGES
  // ═══════════════════════════════════════════════════════
  const staticPages: Array<{
    path: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  }> = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/ncert', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/notes', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/competitive-exams', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/state-boards', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/rojgar-samachar', priority: 0.9, changeFrequency: 'daily' },
    { path: '/results', priority: 0.8, changeFrequency: 'daily' },
    { path: '/search', priority: 0.5, changeFrequency: 'weekly', includeLanguages: false } as any,
    { path: '/about', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/dmca', priority: 0.3, changeFrequency: 'yearly' },
  ]

  for (const page of staticPages) {
    entries.push(
      makeEntry({
        path: page.path,
        priority: page.priority,
        changeFrequency: page.changeFrequency,
        includeLanguages: (page as any).includeLanguages !== false,
      })
    )
  }

  // ═══════════════════════════════════════════════════════
  // 2. NCERT — Class + Subject + Chapter
  // ═══════════════════════════════════════════════════════
  try {
    const { data: ncertData, error } = await supabase
      .from('ncert')
      .select('id, class, subject, chapter_num, language')

    if (error) {
      console.warn('[sitemap] NCERT query skipped:', error.message)
    }

    if (ncertData && ncertData.length > 0) {
      // Lookup map
      for (const item of ncertData) {
        if (item.id) {
          ncertMap.set(item.id, {
            class: item.class,
            subject: item.subject,
            chapter_num: item.chapter_num,
          })
        }
      }

      // ✅ FIX: Add class-level pages
      const classSet = new Set<number>()
      const subjectSet = new Set<string>()
      const chapterSet = new Set<string>()

      for (const item of ncertData) {
        if (!item.class) continue
        classSet.add(item.class)

        if (item.subject) {
          const subjectSlug = slugify(item.subject)
          const combo = `${item.class}/${subjectSlug}`
          subjectSet.add(combo)

          if (item.chapter_num) {
            chapterSet.add(`${combo}/${item.chapter_num}`)
          }
        }
      }

      // Class pages
      for (const cls of Array.from(classSet)) {
        entries.push(
          makeEntry({
            path: `/ncert/${cls}`,
            priority: 0.85,
            changeFrequency: 'weekly',
          })
        )
      }

      // Subject pages
      for (const combo of Array.from(subjectSet)) {
        entries.push(
          makeEntry({
            path: `/ncert/${combo}`,
            priority: 0.8,
            changeFrequency: 'weekly',
          })
        )
      }

      // Chapter pages
      for (const combo of Array.from(chapterSet)) {
        entries.push(
          makeEntry({
            path: `/ncert/${combo}`,
            priority: 0.7,
            changeFrequency: 'monthly',
          })
        )
      }

      console.log(
        `[sitemap] NCERT: ${classSet.size} classes, ${subjectSet.size} subjects, ${chapterSet.size} chapters`
      )
    }
  } catch (err: any) {
    console.warn('[sitemap] NCERT skipped:', err?.message || err)
  }

  // ═══════════════════════════════════════════════════════
  // 3. NOTES — Class + Subject + Chapter
  // ═══════════════════════════════════════════════════════
  try {
    const { data: notesData, error } = await supabase
      .from('chapter_notes')
      .select('ncert_id')

    if (error) {
      console.warn('[sitemap] Notes query skipped:', error.message)
    }

    if (notesData && notesData.length > 0) {
      const classSet = new Set<number>()
      const subjectSet = new Set<string>()
      const chapterSet = new Set<string>()

      for (const note of notesData) {
        if (!note.ncert_id) continue
        const ncert = ncertMap.get(note.ncert_id)
        if (!ncert) continue

        classSet.add(ncert.class)
        const subjectSlug = slugify(ncert.subject)
        const combo = `${ncert.class}/${subjectSlug}`
        subjectSet.add(combo)

        if (ncert.chapter_num) {
          chapterSet.add(`${combo}/${ncert.chapter_num}`)
        }
      }

      // Class pages
      for (const cls of Array.from(classSet)) {
        entries.push(
          makeEntry({
            path: `/notes/${cls}`,
            priority: 0.85,
            changeFrequency: 'weekly',
          })
        )
      }

      // Subject pages
      for (const combo of Array.from(subjectSet)) {
        entries.push(
          makeEntry({
            path: `/notes/${combo}`,
            priority: 0.8,
            changeFrequency: 'weekly',
          })
        )
      }

      // Chapter pages
      for (const combo of Array.from(chapterSet)) {
        entries.push(
          makeEntry({
            path: `/notes/${combo}`,
            priority: 0.7,
            changeFrequency: 'monthly',
          })
        )
      }

      console.log(
        `[sitemap] Notes: ${classSet.size} classes, ${subjectSet.size} subjects, ${chapterSet.size} chapters`
      )
    }
  } catch (err: any) {
    console.warn('[sitemap] Notes skipped:', err?.message || err)
  }

  // ═══════════════════════════════════════════════════════
  // 4. COMPETITIVE EXAMS (Static from lib/exams.ts)
  // ═══════════════════════════════════════════════════════
  for (const exam of EXAMS) {
    entries.push(
      makeEntry({
        path: `/competitive-exams/${exam.slug}`,
        priority: 0.85,
        changeFrequency: 'weekly',
      })
    )

    for (const group of exam.groups) {
      entries.push(
        makeEntry({
          path: `/competitive-exams/${exam.slug}/${group.slug}`,
          priority: 0.8,
          changeFrequency: 'weekly',
        })
      )

      for (const subject of SUBJECTS) {
        entries.push(
          makeEntry({
            path: `/competitive-exams/${exam.slug}/${group.slug}/${subject.slug}`,
            priority: 0.7,
            changeFrequency: 'weekly',
          })
        )

        const topics = TOPICS[subject.slug] || []
        for (const topic of topics) {
          entries.push(
            makeEntry({
              path: `/competitive-exams/${exam.slug}/${group.slug}/${subject.slug}/${topic.slug}`,
              priority: 0.6,
              changeFrequency: 'monthly',
            })
          )
        }
      }
    }
  }

  console.log(
    `[sitemap] Exams: ${EXAMS.length} exams, ${EXAMS.reduce((s, e) => s + e.groups.length, 0)} groups`
  )

  // ═══════════════════════════════════════════════════════
  // 5. STATE BOARDS — Root + Class + Subject
  // ═══════════════════════════════════════════════════════
  for (const board of STATE_BOARDS) {
    entries.push(
      makeEntry({
        path: `/state-boards/${board}`,
        priority: 0.8,
        changeFrequency: 'weekly',
      })
    )

    for (const cls of CLASSES) {
      entries.push(
        makeEntry({
          path: `/state-boards/${board}/${cls}`,
          priority: 0.65,
          changeFrequency: 'weekly',
        })
      )
    }
  }

  // Subject-level pages (from NCERT Hindi data)
  try {
    const { data: hindiData, error } = await supabase
      .from('ncert')
      .select('class, subject')
      .eq('language', 'hi')

    if (error) {
      console.warn('[sitemap] State boards query skipped:', error.message)
    }

    if (hindiData && hindiData.length > 0) {
      const subjectSet = new Set<string>()

      for (const item of hindiData) {
        if (!item.class || !item.subject) continue
        const subjectSlug = slugify(item.subject)

        for (const board of STATE_BOARDS) {
          subjectSet.add(`${board}/${item.class}/${subjectSlug}`)
        }
      }

      for (const combo of Array.from(subjectSet)) {
        entries.push(
          makeEntry({
            path: `/state-boards/${combo}`,
            priority: 0.55,
            changeFrequency: 'monthly',
          })
        )
      }

      console.log(`[sitemap] State boards subjects: ${subjectSet.size}`)
    }
  } catch (err: any) {
    console.warn('[sitemap] State boards skipped:', err?.message || err)
  }

  // ═══════════════════════════════════════════════════════
  // 6. ROJGAR SAMACHAR (with detail pages)
  // ═══════════════════════════════════════════════════════
  try {
    const { data: newsData, error } = await supabase
      .from('rojgar_samachar')
      .select('id, language, published_date')
      .order('published_date', { ascending: false })
      .limit(200)

    if (error) {
      console.warn('[sitemap] Rojgar query skipped:', error.message)
    }

    if (newsData && newsData.length > 0) {
      const langs = new Set<string>()

      for (const item of newsData) {
        if (item.language) langs.add(item.language)

        // ✅ FIX: Add detail pages
        if (item.id) {
          entries.push(
            makeEntry({
              path: `/rojgar-samachar/${item.id}`,
              priority: 0.6,
              changeFrequency: 'monthly',
              lastModified: item.published_date || CONTENT_LASTMOD,
            })
          )
        }
      }

      // Lang-filtered root
      for (const lang of Array.from(langs)) {
        entries.push(
          makeEntry({
            path: `/rojgar-samachar?lang=${lang}`,
            priority: 0.8,
            changeFrequency: 'daily',
            includeLanguages: false,
          })
        )
      }

      console.log(`[sitemap] Rojgar: ${newsData.length} items`)
    }
  } catch (err: any) {
    console.warn('[sitemap] Rojgar skipped:', err?.message || err)
  }

  // ═══════════════════════════════════════════════════════
  // 7. DEDUPLICATE (normalized)
  // ═══════════════════════════════════════════════════════
  const seenUrls = new Set<string>()
  const deduped: MetadataRoute.Sitemap = []

  for (const entry of entries) {
    // ✅ FIX: Normalize (lowercase + trailing slash remove) for dedup
    const normalized = entry.url.toLowerCase().replace(/\/$/, '')
    if (seenUrls.has(normalized)) continue
    seenUrls.add(normalized)
    deduped.push(entry)
  }

  // ═══════════════════════════════════════════════════════
  // 8. SORT BY PRIORITY
  // ═══════════════════════════════════════════════════════
  deduped.sort((a, b) => {
    const pa = a.priority ?? 0.5
    const pb = b.priority ?? 0.5
    if (pb !== pa) return pb - pa
    return a.url.localeCompare(b.url)
  })

  console.log(`[sitemap] ✅ Total URLs: ${deduped.length}`)
  return deduped
}