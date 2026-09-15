import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// ==================== CONSTANTS ====================
const SITE_URL = 'https://vidyapath.in'
const LANGUAGES = ['en', 'hi'] as const
const STATE_BOARDS = ['up', 'bihar', 'mp', 'rajasthan'] as const
const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
const EXAMS = ['ssc', 'railway', 'bank'] as const

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ==================== HELPERS ====================
function makeAlternates(path: string) {
  const languages: Record<string, string> = {}
  for (const lang of LANGUAGES) {
    languages[lang] = `${SITE_URL}${path}?lang=${lang}`
  }
  return { languages }
}

function makeEntry({
  path,
  lastModified = new Date(),
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
    lastModified: isNaN(lastMod.getTime()) ? new Date() : lastMod,
    changeFrequency,
    priority,
    alternates: includeLanguages ? makeAlternates(path) : undefined,
  }
}

// ==================== MAIN SITEMAP ====================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // ⚠️ NEW: Lookup map for ncert info (needed by notes section)
  const ncertMap = new Map<
    number,
    { class: number; subject: string; chapter_num: number }
  >()

  // ===== 1. STATIC PAGES =====
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
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
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
      })
    )
  }

  // ===== 2. NCERT CHAPTERS =====
  // ✅ FIX: 'id' bhi select karo (needed for notes lookup)
  try {
    const { data: ncertData, error } = await supabase
      .from('ncert')
      .select('id, class, subject, chapter_num, language')

    if (error) {
      console.warn('[sitemap] NCERT query error:', error.message)
    }

    if (ncertData && ncertData.length > 0) {
      // Build lookup map for notes section
      for (const item of ncertData) {
        if (item.id) {
          ncertMap.set(item.id, {
            class: item.class,
            subject: item.subject,
            chapter_num: item.chapter_num,
          })
        }
      }

      // Subject-level pages (unique class + subject)
      const subjectSet = new Set<string>()
      const chapterSet = new Set<string>()

      for (const item of ncertData) {
        if (item.class && item.subject) {
          const combo = `${item.class}/${encodeURIComponent(item.subject)}`
          subjectSet.add(combo)

          if (item.chapter_num) {
            chapterSet.add(`${combo}/${item.chapter_num}`)
          }
        }
      }

      // Add subject-level pages
      for (const combo of Array.from(subjectSet)) {
        entries.push(
          makeEntry({
            path: `/ncert/${combo}`,
            priority: 0.8,
            changeFrequency: 'weekly',
          })
        )
      }

      // Add chapter-level pages
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
        `[sitemap] NCERT: ${subjectSet.size} subjects, ${chapterSet.size} chapters (map: ${ncertMap.size})`
      )
    } else {
      console.warn('[sitemap] NCERT: no data found')
    }
  } catch (err: any) {
    console.warn('[sitemap] NCERT fetch failed:', err?.message || err)
  }

  // ===== 3. NOTES CHAPTERS =====
  // ✅ FIX: chapter_notes me class/subject/chapter_num NAHI hain
  // Sirf ncert_id hai — usse ncertMap me lookup karo
  try {
    const { data: notesData, error } = await supabase
      .from('chapter_notes')
      .select('ncert_id')

    if (error) {
      console.warn('[sitemap] Notes query error:', error.message)
    }

    if (notesData && notesData.length > 0) {
      const subjectSet = new Set<string>()
      const chapterSet = new Set<string>()

      for (const note of notesData) {
        if (!note.ncert_id) continue
        const ncert = ncertMap.get(note.ncert_id)
        if (!ncert) continue

        const combo = `${ncert.class}/${encodeURIComponent(ncert.subject)}`
        subjectSet.add(combo)

        if (ncert.chapter_num) {
          chapterSet.add(`${combo}/${ncert.chapter_num}`)
        }
      }

      for (const combo of Array.from(subjectSet)) {
        entries.push(
          makeEntry({
            path: `/notes/${combo}`,
            priority: 0.8,
            changeFrequency: 'weekly',
          })
        )
      }

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
        `[sitemap] Notes: ${subjectSet.size} subjects, ${chapterSet.size} chapters (from ${notesData.length} notes)`
      )
    }
  } catch (err: any) {
    console.warn('[sitemap] Notes fetch failed:', err?.message || err)
  }

  // ===== 4. COMPETITIVE EXAMS =====
  // Exam root pages (static)
  for (const exam of EXAMS) {
    entries.push(
      makeEntry({
        path: `/competitive-exams/${exam}`,
        priority: 0.8,
        changeFrequency: 'weekly',
      })
    )
  }

  // Subject pages from DB
  try {
    const { data: subjects, error } = await supabase
      .from('exam_subjects')
      .select('*')

    if (error) {
      console.warn('[sitemap] Exam subjects query error:', error.message)
    }

    if (subjects && subjects.length > 0) {
      for (const sub of subjects) {
        const anySub = sub as any

        const examSlug =
          anySub.exam_slug || anySub.exam_id || anySub.exam || null
        const subjectSlug =
          anySub.slug ||
          anySub.name ||
          anySub.subject_slug ||
          anySub.subject ||
          null

        if (!examSlug || !subjectSlug) continue

        entries.push(
          makeEntry({
            path: `/competitive-exams/${examSlug}/${encodeURIComponent(subjectSlug)}`,
            priority: 0.7,
            changeFrequency: 'weekly',
          })
        )
      }
      console.log(`[sitemap] Exam subjects: ${subjects.length}`)
    }
  } catch (err: any) {
    console.warn('[sitemap] Exam subjects fetch failed:', err?.message || err)
  }

  // Topic pages from DB
  try {
    const { data: topics, error } = await supabase
      .from('exam_topics')
      .select('*')

    if (error) {
      console.warn('[sitemap] Exam topics query error:', error.message)
    }

    if (topics && topics.length > 0) {
      for (const t of topics) {
        const anyT = t as any

        const examSlug = anyT.exam_slug || anyT.exam_id || null
        const subjectSlug =
          anyT.subject_slug || anyT.subject_id || anyT.subject || null
        const topicSlug =
          anyT.slug || anyT.name || anyT.topic_slug || anyT.topic || null

        // Handle "ssc/गणित" style subject_slug
        let exam = examSlug
        let subject = subjectSlug
        const subjectStr = subjectSlug != null ? String(subjectSlug) : ''
        if (!exam && subjectStr && subjectStr.includes('/')) {
          const parts = subjectStr.split('/')
          exam = parts[0]
          subject = parts.slice(1).join('/')
        }

        if (!exam || !subject || !topicSlug) continue

        entries.push(
          makeEntry({
            path: `/competitive-exams/${exam}/${encodeURIComponent(subject)}/${encodeURIComponent(topicSlug)}`,
            priority: 0.6,
            changeFrequency: 'monthly',
          })
        )
      }
      console.log(`[sitemap] Exam topics: ${topics.length}`)
    }
  } catch (err: any) {
    console.warn('[sitemap] Exam topics fetch failed:', err?.message || err)
  }

  // ===== 5. STATE BOARDS =====
  // Board root pages
  for (const board of STATE_BOARDS) {
    entries.push(
      makeEntry({
        path: `/state-boards/${board}`,
        priority: 0.8,
        changeFrequency: 'weekly',
      })
    )

    // Class 1-12 pages
    for (const cls of CLASSES) {
      entries.push(
        makeEntry({
          path: `/state-boards/${board}/${cls}`,
          priority: 0.6,
          changeFrequency: 'weekly',
        })
      )
    }
  }

  // Subject-level pages from state_books
  try {
    const { data: stateBooks, error } = await supabase
      .from('state_books')
      .select('board_name, class, subject, language')

    if (error) {
      console.warn('[sitemap] State books query error:', error.message)
    }

    if (stateBooks && stateBooks.length > 0) {
      const seen = new Set<string>()
      for (const book of stateBooks) {
        if (!book.board_name || !book.class || !book.subject) continue
        const path = `/state-boards/${book.board_name}/${book.class}/${encodeURIComponent(book.subject)}`
        if (seen.has(path)) continue
        seen.add(path)

        entries.push(
          makeEntry({
            path,
            priority: 0.6,
            changeFrequency: 'monthly',
          })
        )
      }
      console.log(`[sitemap] State books: ${seen.size} unique subjects`)
    }
  } catch (err: any) {
    console.warn('[sitemap] State books fetch failed:', err?.message || err)
  }

  // ===== 6. ROJGAR SAMACHAR =====
  try {
    const { data: newsData } = await supabase
      .from('rojgar_samachar')
      .select('language')
      .limit(50)

    if (newsData && newsData.length > 0) {
      const langs = new Set(newsData.map((n) => n.language))
      for (const lang of Array.from(langs)) {
        if (!lang) continue
        entries.push(
          makeEntry({
            path: `/rojgar-samachar?lang=${lang}`,
            priority: 0.8,
            changeFrequency: 'daily',
            includeLanguages: false,
          })
        )
      }
    }
  } catch (err: any) {
    console.warn('[sitemap] Rojgar Samachar fetch failed:', err?.message || err)
  }

  // ===== 7. DEDUPLICATE =====
  const seenUrls = new Set<string>()
  const deduped: MetadataRoute.Sitemap = []
  for (const entry of entries) {
    if (seenUrls.has(entry.url)) continue
    seenUrls.add(entry.url)
    deduped.push(entry)
  }

  // ===== 8. SORT BY PRIORITY =====
  deduped.sort((a, b) => {
    const pa = a.priority ?? 0.5
    const pb = b.priority ?? 0.5
    if (pb !== pa) return pb - pa
    return a.url.localeCompare(b.url)
  })

  console.log(`[sitemap] ✅ Total URLs: ${deduped.length}`)
  return deduped
}