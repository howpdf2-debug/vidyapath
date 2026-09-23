import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin, isAdminApiError } from '@/lib/admin-api'
import {
  pickAllowedFields,
  toPositiveInt,
  toIntOrNull,
  toBoolOrNull,
  toTrimmedString,
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

// ✅ Video/Chapter IDs are INTEGER (not UUID)
function parseId(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

const ALLOWED_VIDEO_FIELDS = [
  'class',
  'subject',
  'chapter_num',
  'ncert_id',
  'youtube_id',
  'title',
  'description',
  'thumbnail_url',
  'video_type',
  'language',
  'order_index',
  'is_featured',
] as const

const VALID_VIDEO_TYPES = ['lecture', 'revision', 'shorts', 'promo'] as const

// ═══════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════
function validateVideoInput(
  picked: Record<string, unknown>,
  isCreate: boolean
): { data: Record<string, unknown>; errors: FieldErrors } {
  const data: Record<string, unknown> = {}
  const errors: FieldErrors = {}

  if (isCreate || 'title' in picked) {
    const v = toTrimmedString(picked.title, 'title', errors, {
      min: 2,
      max: 500,
    })
    if (v !== null) data.title = v
  }
  if (isCreate || 'youtube_id' in picked) {
    const v = toTrimmedString(picked.youtube_id, 'youtube_id', errors, {
      min: 5,
      max: 30,
    })
    if (v !== null) data.youtube_id = v
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
  if ('ncert_id' in picked) {
    // ✅ INTEGER validation
    const v = parseId(picked.ncert_id)
    if (v === null) {
      errors.ncert_id = 'ncert_id must be a positive integer'
    } else {
      data.ncert_id = v
    }
  }
  if ('description' in picked) {
    const v = toTrimmedString(picked.description, 'description', errors, {
      max: 2000,
    })
    if (v !== null) data.description = v
  }
  if ('thumbnail_url' in picked) {
    const v = toTrimmedString(picked.thumbnail_url, 'thumbnail_url', errors, {
      max: 500,
    })
    if (v !== null) data.thumbnail_url = v
  }
  if ('video_type' in picked) {
    if (
      typeof picked.video_type !== 'string' ||
      !VALID_VIDEO_TYPES.includes(picked.video_type as any)
    ) {
      errors.video_type = `Must be one of: ${VALID_VIDEO_TYPES.join(', ')}`
    } else {
      data.video_type = picked.video_type
    }
  }
  if ('language' in picked) {
    const v = toTrimmedString(picked.language, 'language', errors, {
      min: 2,
      max: 10,
    })
    if (v !== null) data.language = v
  }
  if ('order_index' in picked) {
    const v = toIntOrNull(picked.order_index, 'order_index', errors)
    data.order_index = v ?? 0
  }
  if ('is_featured' in picked) {
    const v = toBoolOrNull(picked.is_featured, 'is_featured', errors)
    if (v !== null) data.is_featured = v
  }

  return { data, errors }
}

// ═══════════════════════════════════════════════════════
// Cache invalidation
// ═══════════════════════════════════════════════════════
function invalidateVideoCaches(ncertId?: number | null) {
  try {
    revalidatePath('/ncert', 'layout')
    revalidatePath('/notes', 'layout')
    revalidatePath('/state-boards', 'layout')
    revalidatePath('/admin/videos')
    revalidateTag('chapter-videos')
    if (ncertId) revalidateTag(`videos:${ncertId}`)
  } catch (err) {
    console.error('[admin/videos] revalidate failed:', err)
  }
}

// ═══════════════════════════════════════════════════════
// GET — List videos
// ═══════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '50', 10))
    )

    const { data, error, count } = await ctx.adminClient
      .from('chapter_videos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[admin/videos GET]', error)
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
    console.error('[admin/videos GET]', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════
// POST — Create video
// ═══════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-video-post:${ctx.user.id}`, {
      windowMs: 60_000,
      max: 30,
    })
  ) {
    return tooManyRequests('बहुत ज़्यादा requests।')
  }

  try {
    const body = await request.json()
    const picked = pickAllowedFields(body, ALLOWED_VIDEO_FIELDS)
    const { data: payload, errors } = validateVideoInput(picked, true)

    if (Object.keys(errors).length > 0) {
      return validationError(errors, 'कुछ fields में error है')
    }

    if (!payload.title || !payload.youtube_id) {
      return validationError(
        {
          ...(payload.title ? {} : { title: 'title ज़रूरी है' }),
          ...(payload.youtube_id
            ? {}
            : { youtube_id: 'youtube_id ज़रूरी है' }),
        },
        'title और youtube_id ज़रूरी हैं'
      )
    }

    const { data, error } = await ctx.adminClient
      .from('chapter_videos')
      .insert(payload)
      .select()

    if (error) {
      console.error('[admin/videos POST]', error)
      return serverError(error.message)
    }

    invalidateVideoCaches(payload.ncert_id as number | undefined)

    return created(data)
  } catch (err) {
    console.error('[admin/videos POST]', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════
// PUT — Update video
// ═══════════════════════════════════════════════════════
export async function PUT(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-video-put:${ctx.user.id}`, {
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
    const videoId = parseId(id)
    if (videoId === null) {
      return validationError(
        { id: 'Positive integer required' },
        'Invalid video id'
      )
    }

    const picked = pickAllowedFields(rest, ALLOWED_VIDEO_FIELDS)
    const { data: updates, errors } = validateVideoInput(picked, false)

    if (Object.keys(errors).length > 0) {
      return validationError(errors, 'कुछ fields में error है')
    }

    if (Object.keys(updates).length === 0) {
      return validationError({}, 'No valid fields to update')
    }

    // Fetch ncert_id before update
    const { data: existing } = await ctx.adminClient
      .from('chapter_videos')
      .select('ncert_id')
      .eq('id', videoId)
      .maybeSingle()

    const { data, error } = await ctx.adminClient
      .from('chapter_videos')
      .update(updates)
      .eq('id', videoId)
      .select()

    if (error) {
      console.error('[admin/videos PUT]', error)
      return serverError(error.message)
    }

    invalidateVideoCaches(
      existing?.ncert_id ?? (updates.ncert_id as number | undefined)
    )

    return ok(data)
  } catch (err) {
    console.error('[admin/videos PUT]', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════
// DELETE — Delete video
// ═══════════════════════════════════════════════════════
export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (
    !checkRateLimit(`admin-video-del:${ctx.user.id}`, {
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
    const videoId = parseId(rawId)
    if (videoId === null) {
      return validationError(
        { id: 'Positive integer required' },
        'Invalid video id'
      )
    }

    // Fetch ncert_id BEFORE delete
    const { data: existing } = await ctx.adminClient
      .from('chapter_videos')
      .select('ncert_id')
      .eq('id', videoId)
      .maybeSingle()

    const { error } = await ctx.adminClient
      .from('chapter_videos')
      .delete()
      .eq('id', videoId)

    if (error) {
      console.error('[admin/videos DELETE]', error)
      return serverError(error.message)
    }

    invalidateVideoCaches(existing?.ncert_id)

    return ok({ deleted: true })
  } catch (err) {
    console.error('[admin/videos DELETE]', err)
    return serverError()
  }
}