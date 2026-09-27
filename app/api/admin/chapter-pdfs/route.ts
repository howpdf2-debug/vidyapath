import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireAdmin, isAdminApiError } from '@/lib/admin-api'
import { pickAllowedFields } from '@/lib/pick-fields'
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

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════
const VALID_LEVELS = ['basic', 'advance', 'pro'] as const
type ValidLevel = (typeof VALID_LEVELS)[number]

const ALLOWED_PDF_FIELDS = [
  'ncert_id',
  'level',
  'pdf_url',
  'pdf_size_kb',
  'title',
] as const

const MAX_PDF_URL_LENGTH = 2000
const MAX_TITLE_LENGTH = 200
const MAX_SIZE_KB = 50 * 1024 // 50 MB
const MAX_LIST_LIMIT = 200

const RATE_POST = { windowMs: 60_000, max: 30 } as const
const RATE_DELETE = { windowMs: 60_000, max: 20 } as const

// ═══════════════════════════════════════════════════════════════
// Revalidation helper — matches notes route pattern
// ═══════════════════════════════════════════════════════════════
function revalidateChapterPdf(ncertId: number | null) {
  try {
    if (ncertId) {
      revalidateTag(`chapter-pdfs:${ncertId}`)
      revalidateTag(`notes:${ncertId}`)
    }
  } catch (err) {
    console.error('[admin/chapter-pdfs] revalidate failed:', err)
  }
}

// ═══════════════════════════════════════════════════════════════
// Validation — field-by-field, returns { data, errors }
// ═══════════════════════════════════════════════════════════════
type ValidatedPdf = {
  ncert_id: number
  level: ValidLevel
  pdf_url: string
  pdf_size_kb: number | null
  title: string | null
}

function validatePdfInput(
  picked: Record<string, unknown>,
  requireAll: boolean
): { data: Partial<ValidatedPdf>; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const data: Partial<ValidatedPdf> = {}

  // ─── ncert_id ───
  if (picked.ncert_id !== undefined) {
    const n = parseInt(String(picked.ncert_id), 10)
    if (!Number.isFinite(n) || n <= 0) {
      errors.ncert_id = 'Must be a positive integer'
    } else {
      data.ncert_id = n
    }
  } else if (requireAll) {
    errors.ncert_id = 'Chapter required'
  }

  // ─── level ───
  if (picked.level !== undefined) {
    if (
      typeof picked.level !== 'string' ||
      !(VALID_LEVELS as readonly string[]).includes(picked.level)
    ) {
      errors.level = `Must be one of: ${VALID_LEVELS.join(', ')}`
    } else {
      data.level = picked.level as ValidLevel
    }
  } else if (requireAll) {
    errors.level = 'Level required'
  }

  // ─── pdf_url ───
  if (picked.pdf_url !== undefined) {
    if (typeof picked.pdf_url !== 'string') {
      errors.pdf_url = 'Must be a string'
    } else {
      const trimmed = picked.pdf_url.trim()
      if (!trimmed) {
        errors.pdf_url = 'Required'
      } else if (trimmed.length > MAX_PDF_URL_LENGTH) {
        errors.pdf_url = `Max ${MAX_PDF_URL_LENGTH} chars`
      } else if (!/^https?:\/\//i.test(trimmed)) {
        errors.pdf_url = 'Must start with http:// or https://'
      } else {
        data.pdf_url = trimmed
      }
    }
  } else if (requireAll) {
    errors.pdf_url = 'PDF URL required'
  }

  // ─── pdf_size_kb (optional) ───
  if (picked.pdf_size_kb !== undefined && picked.pdf_size_kb !== null) {
    const n = parseInt(String(picked.pdf_size_kb), 10)
    if (!Number.isFinite(n) || n <= 0) {
      errors.pdf_size_kb = 'Must be a positive integer'
    } else if (n > MAX_SIZE_KB) {
      errors.pdf_size_kb = `Max ${MAX_SIZE_KB} KB`
    } else {
      data.pdf_size_kb = n
    }
  } else if (picked.pdf_size_kb === null) {
    data.pdf_size_kb = null
  }

  // ─── title (optional) ───
  if (picked.title !== undefined && picked.title !== null) {
    if (typeof picked.title !== 'string') {
      errors.title = 'Must be a string'
    } else {
      const trimmed = picked.title.trim()
      if (trimmed.length > MAX_TITLE_LENGTH) {
        errors.title = `Max ${MAX_TITLE_LENGTH} chars`
      } else {
        data.title = trimmed || null
      }
    }
  } else if (picked.title === null) {
    data.title = null
  }

  return { data, errors }
}

// ═══════════════════════════════════════════════════════════════
// GET — List PDFs (optionally filtered by ncert_id)
// ═══════════════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const { searchParams } = new URL(request.url)
    const ncertIdRaw = searchParams.get('ncert_id')
    const limitRaw = searchParams.get('limit')

    let query = ctx.adminClient
      .from('chapter_level_pdfs')
      .select('*')
      .order('ncert_id', { ascending: true })
      .order('level', { ascending: true })

    if (ncertIdRaw) {
      const ncertId = parseInt(ncertIdRaw, 10)
      if (!Number.isFinite(ncertId) || ncertId <= 0) {
        return validationError(
          { ncert_id: 'Invalid ncert_id' },
          'Invalid ncert_id'
        )
      }
      query = query.eq('ncert_id', ncertId)
    }

    const limit = Math.min(
      Math.max(parseInt(limitRaw || '100', 10) || 100, 1),
      MAX_LIST_LIMIT
    )
    query = query.limit(limit)

    const { data, error } = await query

    if (error) {
      console.error('[admin/chapter-pdfs GET] error:', error.message)
      return serverError(error.message)
    }

    return ok(data || [])
  } catch (err) {
    console.error('[admin/chapter-pdfs GET] unexpected:', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════════════
// POST — Create or upsert PDF (one per ncert_id + level)
// ═══════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (!checkRateLimit(`admin-chapter-pdf-post:${ctx.user.id}`, RATE_POST)) {
    return tooManyRequests('Too many requests')
  }

  try {
    const body = await request.json()
    const picked = pickAllowedFields(body, ALLOWED_PDF_FIELDS)
    const { data: payload, errors } = validatePdfInput(picked, true)

    if (Object.keys(errors).length > 0) {
      return validationError(errors, 'Please fix validation errors')
    }

    const ncertId = payload.ncert_id!
    const level = payload.level!
    const pdfUrl = payload.pdf_url!

    // ─── Verify ncert_id exists (FK guard) ───
    const { data: ncertRow, error: ncertError } = await ctx.adminClient
      .from('ncert')
      .select('id')
      .eq('id', ncertId)
      .maybeSingle()

    if (ncertError) {
      console.error('[admin/chapter-pdfs POST] lookup error:', ncertError)
      return serverError(ncertError.message)
    }
    if (!ncertRow) {
      return notFound('Chapter not found')
    }

    // ─── Upsert (unique: ncert_id + level) ───
    const { data, error } = await ctx.adminClient
      .from('chapter_level_pdfs')
      .upsert(
        {
          ncert_id: ncertId,
          level,
          pdf_url: pdfUrl,
          pdf_size_kb: payload.pdf_size_kb ?? null,
          title: payload.title ?? null,
          uploaded_by: ctx.user.id,
        },
        {
          onConflict: 'ncert_id,level',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single()

    if (error) {
      console.error('[admin/chapter-pdfs POST] error:', error.message)
      return serverError(error.message)
    }

    revalidateChapterPdf(ncertId)

    return created(data)
  } catch (err) {
    console.error('[admin/chapter-pdfs POST] unexpected:', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════════════
// PUT — Update existing PDF by id
// ═══════════════════════════════════════════════════════════════
export async function PUT(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (!checkRateLimit(`admin-chapter-pdf-put:${ctx.user.id}`, RATE_POST)) {
    return tooManyRequests('Too many requests')
  }

  try {
    const body = await request.json()
    const id = parseInt(String(body.id), 10)

    if (!Number.isFinite(id) || id <= 0) {
      return validationError({ id: 'Invalid id' }, 'Invalid id')
    }

    const picked = pickAllowedFields(body, ALLOWED_PDF_FIELDS)
    const { data: payload, errors } = validatePdfInput(picked, false)

    if (Object.keys(errors).length > 0) {
      return validationError(errors, 'Please fix validation errors')
    }

    if (Object.keys(payload).length === 0) {
      return validationError({}, 'No fields to update')
    }

    const { data, error } = await ctx.adminClient
      .from('chapter_level_pdfs')
      .update({
        ...(payload.pdf_url !== undefined && { pdf_url: payload.pdf_url }),
        ...(payload.pdf_size_kb !== undefined && {
          pdf_size_kb: payload.pdf_size_kb,
        }),
        ...(payload.title !== undefined && { title: payload.title }),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('[admin/chapter-pdfs PUT] error:', error.message)
      return serverError(error.message)
    }
    if (!data) {
      return notFound('PDF not found')
    }

    revalidateChapterPdf(data.ncert_id)

    return ok(data)
  } catch (err) {
    console.error('[admin/chapter-pdfs PUT] unexpected:', err)
    return serverError()
  }
}

// ═══════════════════════════════════════════════════════════════
// DELETE — Remove PDF (returns pdf_url for storage cleanup)
// ═══════════════════════════════════════════════════════════════
export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (!checkRateLimit(`admin-chapter-pdf-del:${ctx.user.id}`, RATE_DELETE)) {
    return tooManyRequests('Too many requests')
  }

  try {
    const { searchParams } = new URL(request.url)
    const idRaw = searchParams.get('id')
    const id = parseInt(idRaw || '', 10)

    if (!Number.isFinite(id) || id <= 0) {
      return validationError({ id: 'Valid id required' }, 'Valid id required')
    }

    // ─── Fetch first for pdf_url + ncert_id (revalidation + cleanup) ───
    const { data: existing, error: fetchErr } = await ctx.adminClient
      .from('chapter_level_pdfs')
      .select('id, ncert_id, pdf_url')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr) {
      console.error('[admin/chapter-pdfs DELETE] fetch error:', fetchErr.message)
      return serverError(fetchErr.message)
    }
    if (!existing) {
      return notFound('PDF not found')
    }

    const { error: delErr } = await ctx.adminClient
      .from('chapter_level_pdfs')
      .delete()
      .eq('id', id)

    if (delErr) {
      console.error('[admin/chapter-pdfs DELETE] error:', delErr.message)
      return serverError(delErr.message)
    }

    revalidateChapterPdf(existing.ncert_id)

    return ok({
      message: 'PDF deleted',
      pdf_url: existing.pdf_url,
    })
  } catch (err) {
    console.error('[admin/chapter-pdfs DELETE] unexpected:', err)
    return serverError()
  }
}