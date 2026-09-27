// lib/db-types.ts
// Single source of truth for DB row types
// ✅ All IDs are INTEGER (verified via information_schema)

// ═══════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════

export interface ChapterRow {
  id: number
  class: number
  chapter_num: number
  chapter_title: string | null
  book_code: string | null
  pdf_url: string | null
  language: string
}

// ─────────────────────────────────────────────────────────────
// Notes 3-Level System — types defined FIRST (used in NoteRow)
// ─────────────────────────────────────────────────────────────

export type NoteLevel = 'basic' | 'advance' | 'pro'
export type NoteStatus = 'draft' | 'published' | 'archived'

export const NOTE_LEVELS: NoteLevel[] = ['basic', 'advance', 'pro']

export const LEVEL_META: Record<
  NoteLevel,
  {
    label: string
    labelHi: string
    emoji: string
    color: string
    bg: string
    border: string
    gradient: string
  }
> = {
  basic: {
    label: 'Basic',
    labelHi: 'बेसिक',
    emoji: '🟢',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    gradient: 'from-emerald-500 to-teal-500',
  },
  advance: {
    label: 'Advance',
    labelHi: 'एडवांस',
    emoji: '🟠',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    gradient: 'from-amber-500 to-orange-500',
  },
  pro: {
    label: 'Pro',
    labelHi: 'प्रो एडवांस',
    emoji: '🔴',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    gradient: 'from-rose-500 to-pink-500',
  },
}

// ═══════════════════════════════════════════════════════════════
// Note Row (updated with 3-level system fields)
// ═══════════════════════════════════════════════════════════════

export interface NoteRow {
  id: number
  ncert_id: number
  topic: string
  content_html: string | null
  pdf_url: string | null
  pdf_size_kb: number | null
  pdf_uploaded_at: string | null
  difficulty_level: 'easy' | 'medium' | 'hard' | null
  created_at: string
  order_index: number
  // ── 3-Level system fields (from migration) ──
  level: NoteLevel
  status: NoteStatus
  word_count: number | null
  reading_time_min: number | null
  version: number | null
  reviewed_by: string | null
  generated_at: string | null
}

export type Note = NoteRow

// ═══════════════════════════════════════════════════════════════
// Preview Note (used in cards, lighter weight)
// ═══════════════════════════════════════════════════════════════

export interface PreviewNote {
  id: number
  topic: string
  difficulty_level: 'easy' | 'medium' | 'hard' | null
  pdf_url: string | null
  created_at?: string
  // ── Optional new fields ──
  level?: NoteLevel
  word_count?: number | null
  reading_time_min?: number | null
}

// ═══════════════════════════════════════════════════════════════
// Video Row
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// Language
// ═══════════════════════════════════════════════════════════════

export type Lang = 'en' | 'hi'

// ═══════════════════════════════════════════════════════════════
// FAQ types (bilingual)
// ═══════════════════════════════════════════════════════════════

export type FaqLang = 'en' | 'hi'

export interface FaqRow {
  id: number
  ncert_id: number      // INTEGER (project rule)
  lang: FaqLang
  question: string
  answer: string        // Pre-sanitized HTML
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface FaqPublic {
  id: number
  lang: FaqLang
  question: string
  answer: string        // Pre-sanitized HTML
}

export interface FaqBundle {
  en: FaqPublic[]
  hi: FaqPublic[]
}

// ═══════════════════════════════════════════════════════════════
// Slide Progress (for slideshow resume feature)
// ═══════════════════════════════════════════════════════════════

export interface SlideProgressRow {
  id: number
  user_id: string
  ncert_id: number
  level: NoteLevel
  slide_index: number
  total_slides: number
  updated_at: string
}

// ═══════════════════════════════════════════════════════════════
// Slide (parsed HTML → slide object)
// ═══════════════════════════════════════════════════════════════

export interface Slide {
  id: number
  title: string
  subtitle?: string
  html: string
  plainText: string
  hasFigure: boolean
  wordCount: number
}
