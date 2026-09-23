// lib/cached-queries.ts
// Global DB cache — deterministic keys, graceful fallback
import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase'
import type {
  ChapterRow,
  NoteRow,
  VideoRow,
  FaqBundle,
  FaqPublic,
  FaqLang,
} from '@/lib/db-types'

function keyOf(prefix: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${String(params[k])}`)
    .join('|')
  return `${prefix}:${sorted}`
}

const TTL_POPULATED = 300
const TTL_EMPTY = 60

export const getCachedChapterList = (
  classNum: number,
  subject: string,
  lang: string
) =>
  unstable_cache(
    async (): Promise<{ data: ChapterRow[]; error: string | null }> => {
      try {
        const supabase = createServerClient()
        const { data, error } = await supabase
          .from('ncert')
          .select(
            'id, class, chapter_num, chapter_title, book_code, pdf_url, language'
          )
          .eq('class', classNum)
          .eq('subject', subject)
          .eq('language', lang)
          .order('chapter_num', { ascending: true })

        if (error) {
          console.error('[cache:chapters] query error:', error.message)
          return { data: [], error: error.message }
        }
        return { data: (data ?? []) as ChapterRow[], error: null }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[cache:chapters] unexpected:', msg)
        return { data: [], error: msg }
      }
    },
    [keyOf('chapter-list', { classNum, subject, lang })],
    {
      revalidate: TTL_POPULATED,
      tags: ['ncert-chapters', `chapters:${classNum}:${lang}`],
    }
  )()

export const getCachedChapterNotes = (ncertId: number) =>
  unstable_cache(
    async (): Promise<{ data: NoteRow[]; error: string | null }> => {
      try {
        const supabase = createServerClient()
        const { data, error } = await supabase
          .from('chapter_notes')
          .select(
            'id, topic, content_html, pdf_url, pdf_size_kb, pdf_uploaded_at, difficulty_level, created_at, order_index'
          )
          .eq('ncert_id', ncertId)
          .order('order_index', { ascending: true })

        if (error) {
          console.error('[cache:notes] query error:', error.message)
          return { data: [], error: error.message }
        }
        return { data: (data ?? []) as NoteRow[], error: null }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[cache:notes] unexpected:', msg)
        return { data: [], error: msg }
      }
    },
    [keyOf('chapter-notes', { ncertId })],
    {
      revalidate: TTL_POPULATED,
      tags: ['chapter-notes', `notes:${ncertId}`],
    }
  )()

export const getCachedNotesPreview = (ncertId: number) =>
  unstable_cache(
    async () => {
      try {
        const supabase = createServerClient()
        const { data, error } = await supabase
          .from('chapter_notes')
          .select('id, topic, difficulty_level, pdf_url, created_at')
          .eq('ncert_id', ncertId)
          .order('order_index', { ascending: true })

        if (error) {
          console.error('[cache:notes-preview] error:', error.message)
          return { data: [], error: error.message }
        }
        return { data: data ?? [], error: null }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[cache:notes-preview] unexpected:', msg)
        return { data: [], error: msg }
      }
    },
    [keyOf('notes-preview', { ncertId })],
    {
      revalidate: TTL_POPULATED,
      tags: ['chapter-notes', `notes:${ncertId}`],
    }
  )()

// ✅ ncertId: number (was string)
export const getCachedChapterVideos = (ncertId: number, lang: string) =>
  unstable_cache(
    async (): Promise<{ data: VideoRow[]; error: string | null }> => {
      try {
        const supabase = createServerClient()
        const { data, error } = await supabase
          .from('chapter_videos')
          .select(
            'id, youtube_id, title, description, thumbnail_url, duration_seconds, video_type, language, order_index, is_featured'
          )
          .eq('ncert_id', ncertId)
          .eq('is_active', true)
          .eq('language', lang)
          .order('is_featured', { ascending: false })
          .order('order_index', { ascending: true })

        if (error) {
          console.error('[cache:videos] query error:', error.message)
          return { data: [], error: error.message }
        }
        return { data: (data ?? []) as VideoRow[], error: null }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[cache:videos] unexpected:', msg)
        return { data: [], error: msg }
      }
    },
    [keyOf('chapter-videos', { ncertId, lang })],
    {
      revalidate: TTL_POPULATED,
      tags: ['chapter-videos', `videos:${ncertId}`],
    }
  )()

// ─────────────────────────────────────────────────────────────
// P3.8: Cached FAQs — returns BOTH language sets in one query
// Single query so no cache key collision. Caller decides which
// language to show + fallback behavior.
// ─────────────────────────────────────────────────────────────
export const getChapterFaqs = unstable_cache(
  async (ncertId: number): Promise<FaqBundle> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return { en: [], hi: [] }

    const admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error } = await admin
      .from('chapter_faqs')
      .select('id, lang, question, answer')
      .eq('ncert_id', ncertId)
      .eq('is_published', true)
      .order('order_index', { ascending: true })
      .order('id', { ascending: true })
      .limit(40)

    if (error || !data) return { en: [], hi: [] }

    type Row = {
      id: number
      lang: string
      question: string
      answer: string
    }

    const en: FaqPublic[] = []
    const hi: FaqPublic[] = []

    for (const r of data as Row[]) {
      const item: FaqPublic = {
        id: r.id,
        lang: r.lang as FaqLang,
        question: r.question,
        answer: r.answer,
      }
      if (r.lang === 'hi') hi.push(item)
      else en.push(item)
    }

    return { en, hi }
  },
  ['chapter-faqs'],
  { revalidate: 600, tags: ['faqs'] }
)