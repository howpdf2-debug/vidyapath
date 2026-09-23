import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin, isAdminApiError } from '@/lib/admin-api'
import { sanitizeHtml } from '@/lib/sanitize'
import {
  pickAllowedFields,
  toPositiveInt,
  toIntOrNull,
  toTrimmedString,
  isValidUuid,
  type FieldErrors,
} from '@/lib/pick-fields'
import {
  ok,
  created,
  validationError,
  notFound,
  serverError,
  tooManyRequests,
} from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ═══════════════════════════════════════════════════════
// ✅ Note ID is INTEGER (not UUID)
// ═══════════════════════════════════════════════════════
function parseNoteId(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

// ✅ Allowlist — mass-assignment protection
const ALLOWED_NOTE_FIELDS = [
  'class',
  'subject',
  'chapter_num',
  'language',
  'topic',
  'difficulty_level',
  'content_html',
  'order_index',
  'pdf_url',
  'pdf_size_kb',
] as const

const VALID_DIFFICULTY = ['easy', 'medium', 'hard'] as const

// ═══════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════
function validateNoteInput(
  picked: Record<string, unknown>,
  isCreate: boolean
): { data: Record<string, unknown>; errors: FieldErrors } {
  const data: Record<string, unknown> = {}
  const errors: FieldErrors = {}

  if (isCreate || 'topic' in picked) {
    const v = toTrimmedString(picked.topic, 'topic', errors, {
      min: 2,
      max: 300,
    })
    if (v !== null) data.topic = v
  }

  if (isCreate || 'content_html' in picked) {
    if (picked.content_html === null || picked.content_html === undefined) {
      if (isCreate) errors.content_html = 'content_html ज़रूरी है'
    } else if (typeof picked.content_html !== 'string') {
      errors.content_html = 'content_html must be text'
    } else {
      const cleaned = sanitizeHtml(picked.content_html).trim()
      if (isCreate && cleaned.length === 0) {
        errors.content_html = 'content_html खाली नहीं हो सकता'
      } else {
        data.content_html = cleaned
      }
    }
  }

  if ('difficulty_level' in picked) {
    if (
      typeof picked.difficulty_level !== 'string' ||
      !VALID_DIFFICULTY.includes(picked.difficulty_level as any)
    ) {
      errors.difficulty_level = `Must be one of: ${VALID_DIFFICULTY.join(', ')}`
    } else {
      data.difficulty_level = picked.difficulty_level
    }
  }

  if ('order_index' in picked) {
    const v = toIntOrNull(picked.order_index, 'order_index', errors)
    data.order_index = v ?? 0
  }

  if ('pdf_url' in picked) {
    if (picked.pdf_url === null || picked.pdf_url === '') {
      data.pdf_url = null
      data.pdf_size_kb = null
      data.pdf_uploaded_at = null
    } else {
      const v = toTrimmedString(picked.pdf_url, 'pdf_url', errors, {
        max: 500,
      })
      if (v !== null) {
        data.pdf_url = v
        const size = toIntOrNull(picked.pdf_size_kb, 'pdf_size_kb', errors)
        data.pdf_size_kb = size ?? null
        data.pdf_uploaded_at = new Date().toISOString()
      }
    }
  }

  if ('class' in picked) {
    const v = toPositiveInt(picked.class, 'class', errors)
    if (v !== null) data.class = v
  }
  if ('subject' in picked) {
    const v = toTrimmedString(picked.subject, 'subject', errors, { max: 100 })
    if (v !== null) data.subject = v
  }
  if ('chapter_num' in picked) {
    const v = toPositiveInt(picked.chapter_num, 'chapter_num', errors)
    if (v !== null) data.chapter_num = v
  }
  if ('language' in picked) {
    const v = toTrimmedString(picked.language, 'language', errors, {
      min: 2,
      max: 10,
    })
    if (v !== null) data.language = v
  }

  return { data, errors }
}

// ═══════════════════════════════════════════════════════
// Cache invalidation
// ═══════════════════════════════════════════════════════
function invalidateNoteCaches(ncertId?: string | null) {
  try {
    revalidatePath('/ncert', 'layout')
    revalidatePath('/notes', 'layout')
    revalidatePath('/state-boards', 'layout')
    revalidateTag('chapter-notes')
    if (ncertId) {
      revalidateTag(`notes:${ncertId}`)
    }
  } catch (err) {
    console.error('[admin/notes] revalidate failed:', err)
  }
}

// ═══════════════════════════════════════════════════════
// POST — Create note
// ═══════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-note-post:${ctx.user.id}`, {
      windowMs: 60_000,
      max: 30,
    })
  ) {
    return tooManyRequests('बहुत ज़्यादा requests।')
  }

  try {
    const body = await request.json()
    const picked = pickAllowedFields(body, ALLOWED_NOTE_FIELDS)
    const { data: payload, errors } = validateNoteInput(picked, true)

    if (Object.keys(errors).length > 0) {
      return validationError(errors, 'कुछ fields में error है')
    }

    // Resolve ncert_id
    const directNcertId = body.ncert_id
    let ncertId: string | null = null

    if (directNcertId !== undefined) {
      if (!isValidUuid(directNcertId)) {
        return validationError({ ncert_id: 'Invalid UUID' }, 'Invalid ncert_id')
      }
      ncertId = directNcertId
    } else {
      const classNum = payload.class as number | undefined
      const subject = payload.subject as string | undefined
      const chapterNum = payload.chapter_num as number | undefined
      const lang = (payload.language as string | undefined) || 'en'

      if (!classNum || !subject || !chapterNum) {
        return validationError(
          {
            ...(classNum ? {} : { class: 'class ज़रूरी है' }),
            ...(subject ? {} : { subject: 'subject ज़रूरी है' }),
            ...(chapterNum ? {} : { chapter_num: 'chapter_num ज़रूरी है' }),
          },
          'Chapter identify करने के लिए fields ज़रूरी हैं'
        )
      }

      const { data: ncertRow, error: ncertError } = await ctx.adminClient
        .from('ncert')
        .select('id')
        .eq('class', classNum)
        .eq('subject', subject)
        .eq('chapter_num', chapterNum)
        .eq('language', lang)
        .maybeSingle()

      if (ncertError) {
        console.error('[admin/notes POST] lookup error:', ncertError)
        return serverError(ncertError.message)
      }
      if (!ncertRow) {
        return notFound('Chapter नहीं मिला')
      }
      ncertId = ncertRow.id
    }

    if (!payload.topic) {
      return validationError({ topic: 'topic ज़रूरी है' }, 'topic ज़रूरी है')
    }

    const insertPayload: Record<string, unknown> = {
      ncert_id: ncertId,
      topic: payload.topic,
      difficulty_level: payload.difficulty_level ?? 'medium',
      content_html: payload.content_html ?? '',
      order_index: payload.order_index ?? 0,
    }
    if (payload.pdf_url) {
      insertPayload.pdf_url = payload.pdf_url
      insertPayload.pdf_size_kb = payload.pdf_size_kb ?? null
      insertPayload.pdf_uploaded_at = payload.pdf_uploaded_at
    }

    const { data, error } = await ctx.adminClient
      .from('chapter_notes')
      .insert(insertPayload)
      .select()

    if (error) {
      console.error('[admin/notes POST]', error)
      return serverError(error.message)
    }

    invalidateNoteCaches(ncertId)

    return created(data)
  } catch (err) {
    console.error('[admin/notes POST]', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════
// PUT — Update note
// ═══════════════════════════════════════════════════════
export async function PUT(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-note-put:${ctx.user.id}`, {
      windowMs: 60_000,
      max: 60,
    })
  ) {
    return tooManyRequests('बहुत ज़्यादा requests।')
  }

  try {
    const body = await request.json()
    const { id, ...rest } = body || {}

    // ✅ INTEGER validation
    const noteId = parseNoteId(id)
    if (noteId === null) {
      return validationError(
        { id: 'Positive integer required' },
        'Invalid note id'
      )
    }

    const picked = pickAllowedFields(rest, ALLOWED_NOTE_FIELDS)
    const { data: updates, errors } = validateNoteInput(picked, false)

    if (Object.keys(errors).length > 0) {
      return validationError(errors, 'कुछ fields में error है')
    }

    // Strip fields not present in chapter_notes table
    delete updates.class
    delete updates.subject
    delete updates.chapter_num
    delete updates.language

    if (Object.keys(updates).length === 0) {
      return validationError({}, 'No valid fields to update')
    }

    // Fetch ncert_id BEFORE update (for cache invalidation)
    const { data: existing } = await ctx.adminClient
      .from('chapter_notes')
      .select('ncert_id')
      .eq('id', noteId)
      .maybeSingle()

    const { data, error } = await ctx.adminClient
      .from('chapter_notes')
      .update(updates)
      .eq('id', noteId)
      .select()

    if (error) {
      console.error('[admin/notes PUT]', error)
      return serverError(error.message)
    }

    invalidateNoteCaches(existing?.ncert_id ?? data?.[0]?.ncert_id)

    return ok(data)
  } catch (err) {
    console.error('[admin/notes PUT]', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════
// GET — List notes
// ═══════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get('limit') || '50', 10))
    )

    const { data, error, count } = await ctx.adminClient
      .from('chapter_notes')
      .select(
        `
        id, ncert_id, topic, difficulty_level, order_index,
        content_html, created_at,
        pdf_url, pdf_size_kb, pdf_uploaded_at,
        ncert:ncert_id (id, class, subject, chapter_num, chapter_title, language)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[admin/notes GET]', error)
      return serverError(error.message)
    }

    const response = NextResponse.json({
      ok: true,
      data: data ?? [],
      meta: { total: count ?? 0, limit },
    })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch (err) {
    console.error('[admin/notes GET]', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════
// DELETE — Delete note
// ═══════════════════════════════════════════════════════
export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-note-del:${ctx.user.id}`, {
      windowMs: 60_000,
      max: 30,
    })
  ) {
    return tooManyRequests('बहुत ज़्यादा requests।')
  }

  try {
    const { searchParams } = new URL(request.url)
    const rawId = searchParams.get('id')

    // ✅ INTEGER validation
    const noteId = parseNoteId(rawId)
    if (noteId === null) {
      return validationError(
        { id: 'Positive integer required' },
        'Invalid note id'
      )
    }

    // Fetch ncert_id + pdf_url BEFORE delete
    const { data: existing } = await ctx.adminClient
      .from('chapter_notes')
      .select('ncert_id, pdf_url')
      .eq('id', noteId)
      .maybeSingle()

    const { error } = await ctx.adminClient
      .from('chapter_notes')
      .delete()
      .eq('id', noteId)

    if (error) {
      console.error('[admin/notes DELETE]', error)
      return serverError(error.message)
    }

    invalidateNoteCaches(existing?.ncert_id)

    return ok({ deleted: true, pdf_url: existing?.pdf_url ?? null })
  } catch (err) {
    console.error('[admin/notes DELETE]', err)
    return serverError()
  }
}