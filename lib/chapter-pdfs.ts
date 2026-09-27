import type { SupabaseClient } from '@supabase/supabase-js'
import type { NoteLevel } from '@/lib/db-types'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
export interface ChapterPdfRow {
  id: number
  ncert_id: number
  level: NoteLevel
  pdf_url: string
  pdf_size_kb: number | null
  title: string | null
  uploaded_at?: string
  updated_at?: string
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════
const LEVEL_ORDER: NoteLevel[] = ['basic', 'advance', 'pro']

const SELECT_COLUMNS =
  'id, ncert_id, level, pdf_url, pdf_size_kb, title, uploaded_at, updated_at'

// ═══════════════════════════════════════════════════════════════
// Fetch single chapter's PDFs
// Used by: app/notes/[class]/[subject]/[chapter]/page.tsx
// ═══════════════════════════════════════════════════════════════
export async function fetchChapterPdfs(
  supabase: SupabaseClient,
  ncertId: number
): Promise<ChapterPdfRow[]> {
  if (!Number.isFinite(ncertId) || ncertId <= 0) return []

  const { data, error } = await supabase
    .from('chapter_level_pdfs')
    .select(SELECT_COLUMNS)
    .eq('ncert_id', ncertId)

  if (error) {
    console.error(
      `[chapter-pdfs] fetch failed for ncert_id=${ncertId}:`,
      error.message
    )
    return []
  }

  return sortByLevel((data ?? []) as ChapterPdfRow[])
}

// ═══════════════════════════════════════════════════════════════
// Fetch multiple chapters' PDFs (batch — for listings)
// Used by: app/notes/[class]/[subject]/page.tsx (listing)
// Returns Map<ncert_id, ChapterPdfRow[]>
// ═══════════════════════════════════════════════════════════════
export async function fetchChapterPdfsBatch(
  supabase: SupabaseClient,
  ncertIds: number[]
): Promise<Map<number, ChapterPdfRow[]>> {
  const map = new Map<number, ChapterPdfRow[]>()
  const validIds = ncertIds.filter((id) => Number.isFinite(id) && id > 0)
  if (validIds.length === 0) return map

  const { data, error } = await supabase
    .from('chapter_level_pdfs')
    .select(SELECT_COLUMNS)
    .in('ncert_id', validIds)

  if (error) {
    console.error('[chapter-pdfs] batch fetch failed:', error.message)
    return map
  }

  for (const row of (data ?? []) as ChapterPdfRow[]) {
    const arr = map.get(row.ncert_id) ?? []
    arr.push(row)
    map.set(row.ncert_id, arr)
  }

  // Sort each chapter's PDFs by level
  for (const [key, arr] of map.entries()) {
    map.set(key, sortByLevel(arr))
  }

  return map
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
export function sortByLevel(rows: ChapterPdfRow[]): ChapterPdfRow[] {
  return [...rows].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
  )
}

export function countByLevel(
  rows: ChapterPdfRow[]
): Record<NoteLevel, number> {
  const counts: Record<NoteLevel, number> = {
    basic: 0,
    advance: 0,
    pro: 0,
  }
  for (const r of rows) {
    if (counts[r.level] !== undefined) counts[r.level]++
  }
  return counts
}

export function hasAnyPdf(rows: ChapterPdfRow[]): boolean {
  return rows.length > 0
}

export function formatPdfSize(kb: number | null): string {
  if (!kb || kb <= 0) return ''
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}