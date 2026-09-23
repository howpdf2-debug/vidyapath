import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin, isAdminApiError } from '@/lib/admin-api'
import {
  pickAllowedFields,
  toPositiveInt,
  toTrimmedString,
  isValidUuid,
  type FieldErrors,
} from '@/lib/pick-fields'
import {
  ok,
  created,
  validationError,
  serverError,
  tooManyRequests,
} from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_CHAPTER_FIELDS = [
  'class',
  'subject',
  'chapter_num',
  'chapter_title',
  'book_code',
  'pdf_url',
  'language',
] as const

function validateChapterInput(
  picked: Record<string, unknown>,
  isCreate: boolean
): { data: Record<string, unknown>; errors: FieldErrors } {
  const data: Record<string, unknown> = {}
  const errors: FieldErrors = {}

  if (isCreate || 'class' in picked) {
    const v = toPositiveInt(picked.class, 'class', errors)
    if (v !== null) data.class = v
  }
  if (isCreate || 'subject' in picked) {
    const v = toTrimmedString(picked.subject, 'subject', errors, {
      min: 2,
      max: 100,
    })
    if (v !== null) data.subject = v
  }
  if (isCreate || 'chapter_num' in picked) {
    const v = toPositiveInt(picked.chapter_num, 'chapter_num', errors)
    if (v !== null) data.chapter_num = v
  }
  if (isCreate || 'chapter_title' in picked) {
    const v = toTrimmedString(picked.chapter_title, 'chapter_title', errors, {
      min: 2,
      max: 500,
    })
    if (v !== null) data.chapter_title = v
  }
  if ('book_code' in picked) {
    const v = toTrimmedString(picked.book_code, 'book_code', errors, {
      max: 50,
    })
    if (v !== null) data.book_code = v
  }
  if ('pdf_url' in picked) {
    const v = toTrimmedString(picked.pdf_url, 'pdf_url', errors, {
      max: 500,
    })
    if (v !== null) data.pdf_url = v
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
// GET
// ═══════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      500,
      Math.max(1, parseInt(searchParams.get('limit') || '200', 10))
    )

    const { data, error, count } = await ctx.adminClient
      .from('ncert')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[admin/chapters GET]', error)
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
    console.error('[admin/chapters GET]', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════
// POST
// ═══════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-chapter-post:${ctx.user.id}`, {
      windowMs: 60_000,
      max: 30,
    })
  ) {
    return tooManyRequests('बहुत ज़्यादा requests।')
  }

  try {
    const body = await request.json()
    const picked = pickAllowedFields(body, ALLOWED_CHAPTER_FIELDS)
    const { data: payload, errors } = validateChapterInput(picked, true)

    if (Object.keys(errors).length > 0) {
      return validationError(errors, 'कुछ fields में error है')
    }

    if (
      !payload.class ||
      !payload.subject ||
      !payload.chapter_num ||
      !payload.chapter_title
    ) {
      const missing: FieldErrors = {}
      if (!payload.class) missing.class = 'class ज़रूरी है'
      if (!payload.subject) missing.subject = 'subject ज़रूरी है'
      if (!payload.chapter_num)
        missing.chapter_num = 'chapter_num ज़रूरी है'
      if (!payload.chapter_title)
        missing.chapter_title = 'chapter_title ज़रूरी है'
      return validationError(missing, 'कुछ fields ज़रूरी हैं')
    }

    if (!payload.language) payload.language = 'en'

    const { data, error } = await ctx.adminClient
      .from('ncert')
      .insert(payload)
      .select()

    if (error) {
      console.error('[admin/chapters POST]', error)
      return serverError(error.message)
    }

    try {
      revalidatePath('/ncert', 'layout')
      revalidatePath('/notes', 'layout')
      revalidatePath('/admin/ncert')
    } catch {}

    return created(data)
  } catch (err) {
    console.error('[admin/chapters POST]', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════
// PUT
// ═══════════════════════════════════════════════════════
export async function PUT(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-chapter-put:${ctx.user.id}`, {
      windowMs: 60_000,
      max: 60,
    })
  ) {
    return tooManyRequests('बहुत ज़्यादा requests।')
  }

  try {
    const body = await request.json()
    const { id, ...rest } = body || {}

    if (!isValidUuid(id)) {
      return validationError(
        { id: 'Valid UUID required' },
        'Invalid chapter id'
      )
    }

    const picked = pickAllowedFields(rest, ALLOWED_CHAPTER_FIELDS)
    const { data: updates, errors } = validateChapterInput(picked, false)

    if (Object.keys(errors).length > 0) {
      return validationError(errors, 'कुछ fields में error है')
    }

    if (Object.keys(updates).length === 0) {
      return validationError({}, 'No valid fields to update')
    }

    const { data, error } = await ctx.adminClient
      .from('ncert')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('[admin/chapters PUT]', error)
      return serverError(error.message)
    }

    try {
      revalidatePath('/ncert', 'layout')
      revalidatePath('/notes', 'layout')
      revalidatePath('/admin/ncert')
    } catch {}

    return ok(data)
  } catch (err) {
    console.error('[admin/chapters PUT]', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════
export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-chapter-del:${ctx.user.id}`, {
      windowMs: 60_000,
      max: 30,
    })
  ) {
    return tooManyRequests('बहुत ज़्यादा requests।')
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!isValidUuid(id)) {
      return validationError(
        { id: 'Valid UUID required' },
        'Invalid chapter id'
      )
    }

    const { error } = await ctx.adminClient
      .from('ncert')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[admin/chapters DELETE]', error)
      return serverError(error.message)
    }

    try {
      revalidatePath('/ncert', 'layout')
      revalidatePath('/notes', 'layout')
      revalidatePath('/admin/ncert')
    } catch {}

    return ok({ deleted: true })
  } catch (err) {
    console.error('[admin/chapters DELETE]', err)
    return serverError()
  }
}