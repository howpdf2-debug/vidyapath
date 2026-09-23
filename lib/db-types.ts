// lib/db-types.ts
// Single source of truth for DB row types
// ✅ All IDs are INTEGER (verified via information_schema)

export interface ChapterRow {
  id: number
  class: number
  chapter_num: number
  chapter_title: string | null
  book_code: string | null
  pdf_url: string | null
  language: string
}

export interface NoteRow {
  id: number
  topic: string
  content_html: string | null
  pdf_url: string | null
  pdf_size_kb: number | null
  pdf_uploaded_at: string | null
  difficulty_level: 'easy' | 'medium' | 'hard' | null
  created_at: string
  order_index: number
}

export type Note = NoteRow

export interface PreviewNote {
  id: number
  topic: string
  difficulty_level: 'easy' | 'medium' | 'hard' | null
  pdf_url: string | null
  created_at?: string
}

export interface VideoRow {
  id: number
  youtube_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  duration_seconds: number | null
  video_type: 'lecture' | 'revision' | 'shorts' | 'promo'
  language: string
  order_index: number
  is_featured: boolean | null
}

export type Lang = 'en' | 'hi'

// ─────────────────────────────────────────────────────────────
// P3.8: FAQ types (bilingual)
// ─────────────────────────────────────────────────────────────

export type FaqLang = 'en' | 'hi'

export interface FaqRow {
  id: number
  ncert_id: number      // INTEGER (project rule)
  lang: FaqLang         // ✅ Added
  question: string
  answer: string        // Pre-sanitized HTML
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface FaqPublic {
  id: number            // ✅ Added
  lang: FaqLang         // ✅ Added
  question: string
  answer: string        // Pre-sanitized HTML
}

export interface FaqBundle {
  en: FaqPublic[]
  hi: FaqPublic[]
}