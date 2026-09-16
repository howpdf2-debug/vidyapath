import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sanitizeHtml } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════
interface CookieToSet {
  name: string
  value: string
  options?: {
    domain?: string
    expires?: Date
    httpOnly?: boolean
    maxAge?: number
    path?: string
    sameSite?: 'strict' | 'lax' | 'none' | boolean
    secure?: boolean
  }
}

interface NoteInput {
  class: number | string
  subject: string
  chapter_num: number | string
  language?: 'en' | 'hi'
  topic: string
  difficulty_level?: 'easy' | 'medium' | 'hard'
  content_html: string
  order_index?: number | string
}

interface ValidatedNote {
  classNum: number
  subject: string
  chapterNum: number
  language: 'en' | 'hi'
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  contentHtml: string
  orderIndex: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

// ═══════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════
const MAX_BODY_SIZE = 2 * 1024 * 1024 // 2MB
const MAX_CONTENT_LENGTH = 500_000 // 500KB
const MAX_TOPIC_LENGTH = 300
const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100
const RATE_LIMIT_WINDOW = 60_000 // 1 min
const RATE_LIMIT_MAX = 30 // 30 writes/min per IP

// ═══════════════════════════════════════════════════════
// LAZY ADMIN CLIENT
// ═══════════════════════════════════════════════════════
let adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      '[admin-notes] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return adminClient
}

// ═══════════════════════════════════════════════════════
// IN-MEMORY RATE LIMITER
// ═══════════════════════════════════════════════════════
const rateLimitMap = new Map<string, RateLimitEntry>()

function checkRateLimit(identifier: string, isWrite: boolean): boolean {
  const limit = isWrite ? RATE_LIMIT_MAX : RATE_LIMIT_MAX * 3
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++
  return true
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
      if (entry.resetAt < now) rateLimitMap.delete(key)
    }
  }, 300_000)
}

// ═══════════════════════════════════════════════════════
// AUTH CHECK
// ═══════════════════════════════════════════════════════
async function checkAdminAuth(): Promise<{
  authorized: boolean
  userId?: string
  error?: string
}> {
  try {
    const cookieStore = cookies()

    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          // ✅ FIX: Explicit type annotation for cookiesToSet
          setAll(cookiesToSet: CookieToSet[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options as any)
              )
            } catch {
              // Server Component context — ignore
            }
          },
        },
      }
    )

    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser()

    if (error || !user) {
      return { authorized: false, error: 'Not authenticated' }
    }

    // Check user_metadata
    if (
      user.user_metadata?.role === 'admin' ||
      user.user_metadata?.is_admin === true
    ) {
      return { authorized: true, userId: user.id }
    }

    // Check profiles table
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'admin' || profile?.is_admin === true) {
      return { authorized: true, userId: user.id }
    }

    return { authorized: false, error: 'Not an admin' }
  } catch (err) {
    console.error('[admin-notes] Auth check failed:', err)
    return { authorized: false, error: 'Auth check failed' }
  }
}

// ═══════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════
function validateNoteInput(body: Partial<NoteInput>): {
  valid: boolean
  error?: string
  data?: ValidatedNote
} {
  const {
    class: cls,
    subject,
    chapter_num,
    language = 'en',
    topic,
    difficulty_level = 'medium',
    content_html,
    order_index = 0,
  } = body

  if (!cls || !subject || !chapter_num || !topic || !content_html) {
    return { valid: false, error: 'Missing required fields' }
  }

  const classNum = Number(cls)
  if (!Number.isInteger(classNum) || classNum < 1 || classNum > 12) {
    return { valid: false, error: 'Class must be 1-12' }
  }

  const chapterNum = Number(chapter_num)
  if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > 100) {
    return { valid: false, error: 'Invalid chapter number' }
  }

  if (typeof subject !== 'string' || subject.trim().length === 0) {
    return { valid: false, error: 'Subject required' }
  }

  if (typeof topic !== 'string' || topic.trim().length === 0) {
    return { valid: false, error: 'Topic required' }
  }

  if (topic.length > MAX_TOPIC_LENGTH) {
    return {
      valid: false,
      error: `Topic too long (max ${MAX_TOPIC_LENGTH} chars)`,
    }
  }

  if (typeof content_html !== 'string') {
    return { valid: false, error: 'Content required' }
  }

  if (content_html.length > MAX_CONTENT_LENGTH) {
    return {
      valid: false,
      error: `Content too large (max ${MAX_CONTENT_LENGTH} chars)`,
    }
  }

  if (language !== 'en' && language !== 'hi') {
    return { valid: false, error: 'Language must be en or hi' }
  }

  if (!['easy', 'medium', 'hard'].includes(difficulty_level)) {
    return { valid: false, error: 'Invalid difficulty' }
  }

  const orderIdx = Number(order_index) || 0
  if (!Number.isInteger(orderIdx) || orderIdx < 0 || orderIdx > 9999) {
    return { valid: false, error: 'Invalid order index' }
  }

  return {
    valid: true,
    data: {
      classNum,
      subject: subject.trim(),
      chapterNum,
      language,
      topic: topic.trim(),
      difficulty: difficulty_level,
      contentHtml: sanitizeHtml(content_html),
      orderIndex: orderIdx,
    },
  }
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
async function lookupNcertId(
  classNum: number,
  subject: string,
  chapterNum: number,
  language: 'en' | 'hi'
): Promise<number | null> {
  const { data, error } = await getAdminClient()
    .from('ncert')
    .select('id')
    .eq('class', classNum)
    .eq('subject', subject)
    .eq('chapter_num', chapterNum)
    .eq('language', language)
    .maybeSingle()

  if (error) {
    console.error('[admin-notes] ncert lookup error:', error)
    return null
  }

  return data?.id ?? null
}

async function checkDuplicate(
  ncertId: number,
  topic: string,
  excludeId?: number
): Promise<{ isDuplicate: boolean; existingId?: number }> {
  let query = getAdminClient()
    .from('chapter_notes')
    .select('id')
    .eq('ncert_id', ncertId)
    .eq('topic', topic)
    .limit(1)

  if (excludeId) query = query.neq('id', excludeId)

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('[admin-notes] duplicate check error:', error)
    return { isDuplicate: false }
  }

  if (data) return { isDuplicate: true, existingId: data.id }
  return { isDuplicate: false }
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ═══════════════════════════════════════════════════════
// GET — List notes (with full content_html for edit)
// ═══════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkRateLimit(ip, false)) {
    return jsonError('Too many requests. Please slow down.', 429)
  }

  const auth = await checkAdminAuth()
  if (!auth.authorized) {
    return jsonError(auth.error || 'Unauthorized', 401)
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10))
    )
    const offset = (page - 1) * limit
    const search = searchParams.get('q')?.trim() || ''
    const classFilter = searchParams.get('class')
    const languageFilter = searchParams.get('language')
    const difficultyFilter = searchParams.get('difficulty')
    const sortBy = searchParams.get('sort') || 'newest'

    let query = getAdminClient()
      .from('chapter_notes')
      .select(
        `
        id, ncert_id, topic, difficulty_level, order_index, created_at,
        content_html,
        ncert:ncert_id (id, class, subject, chapter_num, chapter_title, language)
      `,
        { count: 'exact' }
      )

    if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sortBy === 'topic') {
      query = query.order('topic', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    if (search) {
      const safe = search.replace(/[,()%]/g, ' ')
      query = query.or(`topic.ilike.%${safe}%`)
    }

    if (
      difficultyFilter &&
      ['easy', 'medium', 'hard'].includes(difficultyFilter)
    ) {
      query = query.eq('difficulty_level', difficultyFilter)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[admin-notes] GET error:', error)
      return jsonError(error.message, 500)
    }

    let items = (data || []) as any[]

    if (classFilter) {
      const cls = parseInt(classFilter, 10)
      if (Number.isInteger(cls)) {
        items = items.filter((n) => n.ncert?.class === cls)
      }
    }

    if (languageFilter && (languageFilter === 'en' || languageFilter === 'hi')) {
      items = items.filter((n) => n.ncert?.language === languageFilter)
    }

    // ✅ Full content_html + excerpt for list
    const itemsWithExcerpt = items.map((n) => {
      const html = n.content_html || ''
      return {
        ...n,
        content_html: html,
        content_excerpt: html ? stripHtml(html).slice(0, 150) : '',
        content_length: html.length,
      }
    })

    const total = count || 0
    const hasMore = offset + items.length < total

    return NextResponse.json({
      data: itemsWithExcerpt,
      total,
      page,
      limit,
      hasMore,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[admin-notes] GET catch:', err)
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return jsonError(message, 500)
  }
}

// ═══════════════════════════════════════════════════════
// POST — Create note
// ═══════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkRateLimit(ip, true)) {
    return jsonError('Too many requests. Please slow down.', 429)
  }

  const auth = await checkAdminAuth()
  if (!auth.authorized) {
    return jsonError(auth.error || 'Unauthorized', 401)
  }

  try {
    const contentLength = parseInt(
      request.headers.get('content-length') || '0',
      10
    )
    if (contentLength > MAX_BODY_SIZE) {
      return jsonError('Request too large', 413)
    }

    const body = await request.json()
    const validation = validateNoteInput(body)

    if (!validation.valid || !validation.data) {
      return jsonError(validation.error || 'Invalid input', 400)
    }

    const {
      classNum,
      subject,
      chapterNum,
      language,
      topic,
      difficulty,
      contentHtml,
      orderIndex,
    } = validation.data

    const ncertId = await lookupNcertId(classNum, subject, chapterNum, language)
    if (!ncertId) {
      return jsonError(
        `Chapter not found: Class ${classNum} ${subject} Ch ${chapterNum} (${language})`,
        404
      )
    }

    const dup = await checkDuplicate(ncertId, topic)
    if (dup.isDuplicate) {
      return jsonError(
        `Note with topic "${topic}" already exists for this chapter`,
        409
      )
    }

    const { data, error } = await getAdminClient()
      .from('chapter_notes')
      .insert({
        ncert_id: ncertId,
        topic,
        difficulty_level: difficulty,
        content_html: contentHtml,
        order_index: orderIndex,
      })
      .select()

    if (error) {
      console.error('[admin-notes] POST error:', error)
      return jsonError(error.message, 500)
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    console.error('[admin-notes] POST catch:', err)
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return jsonError(message, 500)
  }
}

// ═══════════════════════════════════════════════════════
// PUT — Update note
// ═══════════════════════════════════════════════════════
export async function PUT(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkRateLimit(ip, true)) {
    return jsonError('Too many requests. Please slow down.', 429)
  }

  const auth = await checkAdminAuth()
  if (!auth.authorized) {
    return jsonError(auth.error || 'Unauthorized', 401)
  }

  try {
    const contentLength = parseInt(
      request.headers.get('content-length') || '0',
      10
    )
    if (contentLength > MAX_BODY_SIZE) {
      return jsonError('Request too large', 413)
    }

    const body = await request.json()
    const { id, ...rest } = body

    if (!id) return jsonError('Missing note id', 400)

    const noteId = Number(id)
    if (!Number.isInteger(noteId) || noteId < 1) {
      return jsonError('Invalid note id', 400)
    }

    const validation = validateNoteInput(rest)
    if (!validation.valid || !validation.data) {
      return jsonError(validation.error || 'Invalid input', 400)
    }

    const {
      classNum,
      subject,
      chapterNum,
      language,
      topic,
      difficulty,
      contentHtml,
      orderIndex,
    } = validation.data

    const ncertId = await lookupNcertId(classNum, subject, chapterNum, language)
    if (!ncertId) {
      return jsonError('Chapter not found', 404)
    }

    const dup = await checkDuplicate(ncertId, topic, noteId)
    if (dup.isDuplicate) {
      return jsonError(
        `Another note with topic "${topic}" already exists for this chapter`,
        409
      )
    }

    const { data, error } = await getAdminClient()
      .from('chapter_notes')
      .update({
        ncert_id: ncertId,
        topic,
        difficulty_level: difficulty,
        content_html: contentHtml,
        order_index: orderIndex,
      })
      .eq('id', noteId)
      .select()

    if (error) {
      console.error('[admin-notes] PUT error:', error)
      return jsonError(error.message, 500)
    }

    if (!data || data.length === 0) {
      return jsonError('Note not found', 404)
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err) {
    console.error('[admin-notes] PUT catch:', err)
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return jsonError(message, 500)
  }
}

// ═══════════════════════════════════════════════════════
// DELETE — Delete note
// ═══════════════════════════════════════════════════════
export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkRateLimit(ip, true)) {
    return jsonError('Too many requests. Please slow down.', 429)
  }

  const auth = await checkAdminAuth()
  if (!auth.authorized) {
    return jsonError(auth.error || 'Unauthorized', 401)
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return jsonError('Missing id', 400)

    const noteId = Number(id)
    if (!Number.isInteger(noteId) || noteId < 1) {
      return jsonError('Invalid id', 400)
    }

    const { error, count } = await getAdminClient()
      .from('chapter_notes')
      .delete({ count: 'exact' })
      .eq('id', noteId)

    if (error) {
      console.error('[admin-notes] DELETE error:', error)
      return jsonError(error.message, 500)
    }

    if (!count || count === 0) {
      return jsonError('Note not found', 404)
    }

    return NextResponse.json({ success: true, deleted: count }, { status: 200 })
  } catch (err) {
    console.error('[admin-notes] DELETE catch:', err)
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return jsonError(message, 500)
  }
}