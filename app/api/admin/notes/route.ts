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

const VALID_LEVELS = ['basic', 'advance', 'pro'] as const
const VALID_STATUS = ['draft', 'published', 'archived'] as const
const VALID_DIFFICULTY = ['easy', 'medium', 'hard'] as const
const VALID_LANGUAGES = ['en', 'hi'] as const

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
  'level',
  'status',
] as const

function parseNoteId(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function computeWordCount(html: string): number {
  const plain = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.split(/\s+/).filter(Boolean).length
}

function computeReadingTime(words: number): number {
  return Math.max(1, Math.ceil(words / 200))
}

function validateNoteInput(
  picked: Record<string, unknown>,
  isCreate: boolean
): { data: Record<string, unknown>; errors: FieldErrors } {
  const data: Record<string, unknown> = {}
  const errors: FieldErrors = {}

  if (isCreate || 'topic' in picked) {
    const v = toTrimmedString(picked.topic, 'topic', errors, { min: 2, max: 300 })
    if (v !== null) data.topic = v
  }

  if (isCreate || 'content_html' in picked) {
    if (picked.content_html === null || picked.content_html === undefined) {
      if (isCreate) errors.content_html = 'Content required'
    } else if (typeof picked.content_html !== 'string') {
      errors.content_html = 'Content must be text'
    } else {
      const cleaned = sanitizeHtml(picked.content_html).trim()
      if (isCreate && cleaned.length === 0) {
        errors.content_html = 'Content cannot be empty'
      } else {
        data.content_html = cleaned
        const words = computeWordCount(cleaned)
        data.word_count = words
        data.reading_time_min = computeReadingTime(words)
      }
    }
  }

  if ('difficulty_level' in picked) {
    if (
      typeof picked.difficulty_level !== 'string' ||
      !VALID_DIFFICULTY.includes(picked.difficulty_level as any)
    ) {
      errors.difficulty_level = `Must be: ${VALID_DIFFICULTY.join(', ')}`
    } else {
      data.difficulty_level = picked.difficulty_level
    }
  }

  if (isCreate || 'level' in picked) {
    if (
      typeof picked.level !== 'string' ||
      !VALID_LEVELS.includes(picked.level as any)
    ) {
      errors.level = `Must be: ${VALID_LEVELS.join(', ')}`
    } else {
      data.level = picked.level
    }
  }

  if ('status' in picked) {
    if (
      typeof picked.status !== 'string' ||
      !VALID_STATUS.includes(picked.status as any)
    ) {
      errors.status = `Must be: ${VALID_STATUS.join(', ')}`
    } else {
      data.status = picked.status
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
      const v = toTrimmedString(picked.pdf_url, 'pdf_url', errors, { max: 500 })
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
    if (
      typeof picked.language !== 'string' ||
      !VALID_LANGUAGES.includes(picked.language as any)
    ) {
      errors.language = `Must be: ${VALID_LANGUAGES.join(', ')}`
    } else {
      data.language = picked.language
    }
  }

  return { data, errors }
}

function invalidateNoteCaches(
  ncertId?: string | number | null,
  level?: string
) {
  try {
    revalidatePath('/ncert', 'layout')
    revalidatePath('/notes', 'layout')
    revalidatePath('/state-boards', 'layout')
    revalidateTag('chapter-notes')
    revalidateTag('faqs')
    if (ncertId) {
      revalidateTag(`notes:${ncertId}`)
      if (level) revalidateTag(`notes:${ncertId}:${level}`)
    }
  } catch (err) {
    console.error('[admin/notes] revalidate failed:', err)
  }
}

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-note-post:${ctx.user.id}`, {
      windowMs: 60_000,
      max: 30,
    })
  ) {
    return tooManyRequests('Too many requests')
  }

  try {
    const body = await request.json()
    const picked = pickAllowedFields(body, ALLOWED_NOTE_FIELDS)
    const { data: payload, errors } = validateNoteInput(picked, true)

    if (Object.keys(errors).length > 0) {
      return validationError(errors, 'Please fix validation errors')
    }

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
            ...(classNum ? {} : { class: 'Class required' }),
            ...(subject ? {} : { subject: 'Subject required' }),
            ...(chapterNum ? {} : { chapter_num: 'Chapter required' }),
          },
          'Chapter identification required'
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
        return notFound('Chapter not found')
      }
      ncertId = ncertRow.id
    }

    if (!payload.topic) {
      return validationError({ topic: 'Topic required' }, 'Topic required')
    }

    const insertPayload: Record<string, unknown> = {
      ncert_id: ncertId,
      topic: payload.topic,
      difficulty_level: payload.difficulty_level ?? 'medium',
      content_html: payload.content_html ?? '',
      order_index: payload.order_index ?? 0,
      level: payload.level ?? 'basic',
      status: payload.status ?? 'published',
      word_count: payload.word_count ?? 0,
      reading_time_min: payload.reading_time_min ?? 1,
      generated_at: new Date().toISOString(),
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
      if (error.code === '23505') {
        return validationError(
          { topic: 'This topic already exists at this level' },
          'Duplicate topic'
        )
      }
      return serverError(error.message)
    }

    invalidateNoteCaches(ncertId, payload.level as string)

    return created(data)
  } catch (err) {
    console.error('[admin/notes POST]', err)
    return serverError()
  }
}

export async function PUT(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-note-put:${ctx.user.id}`, {
      windowMs: 60_000,
      max: 60,
    })
  ) {
    return tooManyRequests('Too many requests')
  }

  try {
    const body = await request.json()
    const { id, ...rest } = body || {}

    const noteId = parseNoteId(id)
    if (noteId === null) {
      return validationError({ id: 'Positive integer required' }, 'Invalid id')
    }

    const picked = pickAllowedFields(rest, ALLOWED_NOTE_FIELDS)
    const { data: updates, errors } = validateNoteInput(picked, false)

    if (Object.keys(errors).length > 0) {
      return validationError(errors, 'Please fix validation errors')
    }

    delete updates.class
    delete updates.subject
    delete updates.chapter_num
    delete updates.language

    if (Object.keys(updates).length === 0) {
      return validationError({}, 'No fields to update')
    }

    const { data: existing } = await ctx.adminClient
      .from('chapter_notes')
      .select('ncert_id, level, version')
      .eq('id', noteId)
      .maybeSingle()

    if (updates.content_html) {
      updates.version = ((existing?.version as number) || 1) + 1
    }

    const { data, error } = await ctx.adminClient
      .from('chapter_notes')
      .update(updates)
      .eq('id', noteId)
      .select()

    if (error) {
      console.error('[admin/notes PUT]', error)
      return serverError(error.message)
    }

    invalidateNoteCaches(
      existing?.ncert_id ?? data?.[0]?.ncert_id,
      existing?.level ?? data?.[0]?.level
    )

    return ok(data)
  } catch (err) {
    console.error('[admin/notes PUT]', err)
    return serverError()
  }
}

export async function GET(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      500,
      Math.max(1, parseInt(searchParams.get('limit') || '200', 10))
    )
    const level = searchParams.get('level')
    const status = searchParams.get('status')

    let query = ctx.adminClient
      .from('chapter_notes')
      .select(
        `
        id, ncert_id, topic, difficulty_level, order_index,
        content_html, created_at, level, status,
        word_count, reading_time_min, version,
        pdf_url, pdf_size_kb, pdf_uploaded_at,
        ncert:ncert_id (id, class, subject, chapter_num, chapter_title, language)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (level && VALID_LEVELS.includes(level as any)) {
      query = query.eq('level', level)
    }
    if (status && VALID_STATUS.includes(status as any)) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[admin/notes GET]', error)
      return serverError(error.message)
    }

    const enriched = (data ?? []).map((row: any) => {
      const html = row.content_html || ''
      const plain = html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .trim()
      return {
        ...row,
        content_excerpt: plain.slice(0, 150),
        content_length: html.length,
      }
    })

    const response = NextResponse.json({
      ok: true,
      data: enriched,
      meta: { total: count ?? 0, limit },
    })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch (err) {
    console.error('[admin/notes GET]', err)
    return serverError()
  }
}

export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-note-del:${ctx.user.id}`, {
      windowMs: 60_000,
      max: 30,
    })
  ) {
    return tooManyRequests('Too many requests')
  }

  try {
    const { searchParams } = new URL(request.url)
    const rawId = searchParams.get('id')

    const noteId = parseNoteId(rawId)
    if (noteId === null) {
      return validationError({ id: 'Positive integer required' }, 'Invalid id')
    }

    const { data: existing } = await ctx.adminClient
      .from('chapter_notes')
      .select('ncert_id, pdf_url, level')
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

    invalidateNoteCaches(existing?.ncert_id, existing?.level)

    return ok({ deleted: true, pdf_url: existing?.pdf_url ?? null })
  } catch (err) {
    console.error('[admin/notes DELETE]', err)
    return serverError()
  }
}