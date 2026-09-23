// app/api/admin/faqs/route.ts
// P3.8 FINAL: Admin CRUD for chapter FAQs (bilingual).
// Self-contained pickFields helper.

import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-api'
import { sanitizeHtml } from '@/lib/sanitize'
import { ok, created, validationError, serverError } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_FIELDS = [
  'ncert_id',
  'lang',
  'question',
  'answer',
  'order_index',
  'is_published',
] as const

function pickFields(
  source: unknown,
  allowed: readonly string[]
): Record<string, unknown> {
  if (!source || typeof source !== 'object') return {}
  const out: Record<string, unknown> = {}
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      out[key] = (source as Record<string, unknown>)[key]
    }
  }
  return out
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

function validate(body: Record<string, unknown>, partial: boolean) {
  const errors: Record<string, string> = {}

  if (!partial || body.ncert_id !== undefined) {
    const n = Number(body.ncert_id)
    if (!Number.isInteger(n) || n <= 0) errors.ncert_id = 'Invalid chapter id'
  }
  if (!partial || body.lang !== undefined) {
    if (body.lang !== 'en' && body.lang !== 'hi') {
      errors.lang = "Language must be 'en' or 'hi'"
    }
  }
  if (!partial || body.question !== undefined) {
    const q = typeof body.question === 'string' ? body.question.trim() : ''
    if (q.length < 5 || q.length > 500) {
      errors.question = 'Question must be 5–500 chars'
    }
  }
  if (!partial || body.answer !== undefined) {
    const a = typeof body.answer === 'string' ? body.answer.trim() : ''
    if (a.length < 5 || a.length > 5000) {
      errors.answer = 'Answer must be 5–5000 chars'
    }
  }
  if (body.order_index !== undefined) {
    if (!Number.isInteger(Number(body.order_index))) {
      errors.order_index = 'Must be an integer'
    }
  }
  if (body.is_published !== undefined && typeof body.is_published !== 'boolean') {
    errors.is_published = 'Must be boolean'
  }

  return errors
}

// ─────────────────────────────────────────────────────────────
// GET /api/admin/faqs?ncert_id=123
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.response

  const ncertId = Number(new URL(req.url).searchParams.get('ncert_id'))
  if (!Number.isInteger(ncertId) || ncertId <= 0) {
    return validationError({ ncert_id: 'Invalid chapter id' })
  }

  const { data, error } = await adminClient()
    .from('chapter_faqs')
    .select('*')
    .eq('ncert_id', ncertId)
    .order('lang', { ascending: true })
    .order('order_index', { ascending: true })

  if (error) return serverError('Could not load FAQs')
  return ok(data ?? [])
}

// ─────────────────────────────────────────────────────────────
// POST /api/admin/faqs
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return validationError({ body: 'Invalid JSON' })
  }

  const picked = pickFields(body, ALLOWED_FIELDS)
  const errors = validate(picked, false)
  if (Object.keys(errors).length > 0) return validationError(errors)

  const payload = {
    ncert_id: Number(picked.ncert_id),
    lang: String(picked.lang) as 'en' | 'hi',
    question: String(picked.question).trim(),
    answer: sanitizeHtml(String(picked.answer).trim()),
    order_index: Number.isInteger(Number(picked.order_index))
      ? Number(picked.order_index)
      : 0,
    is_published: picked.is_published === false ? false : true,
  }

  const { data, error } = await adminClient()
    .from('chapter_faqs')
    .insert(payload)
    .select()
    .single()

  if (error) return serverError('Could not create FAQ')
  revalidateTag('faqs')
  return created(data)
}

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/faqs  { id, ...partial }
// ─────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.response

  let body: any
  try {
    body = await req.json()
  } catch {
    return validationError({ body: 'Invalid JSON' })
  }

  const id = Number(body?.id)
  if (!Number.isInteger(id) || id <= 0) {
    return validationError({ id: 'Invalid id' })
  }

  const picked = pickFields(body, ALLOWED_FIELDS)
  const errors = validate(picked, true)
  if (Object.keys(errors).length > 0) return validationError(errors)

  const update: Record<string, unknown> = {}
  if (picked.ncert_id !== undefined) update.ncert_id = Number(picked.ncert_id)
  if (picked.lang !== undefined) update.lang = String(picked.lang)
  if (picked.question !== undefined)
    update.question = String(picked.question).trim()
  if (picked.answer !== undefined)
    update.answer = sanitizeHtml(String(picked.answer).trim())
  if (picked.order_index !== undefined)
    update.order_index = Number(picked.order_index)
  if (picked.is_published !== undefined)
    update.is_published = Boolean(picked.is_published)

  if (Object.keys(update).length === 0) {
    return validationError({ body: 'No fields to update' })
  }

  const { data, error } = await adminClient()
    .from('chapter_faqs')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return serverError('Could not update FAQ')
  revalidateTag('faqs')
  return ok(data)
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/faqs?id=123
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.response

  const id = Number(new URL(req.url).searchParams.get('id'))
  if (!Number.isInteger(id) || id <= 0) {
    return validationError({ id: 'Invalid id' })
  }

  const { error } = await adminClient()
    .from('chapter_faqs')
    .delete()
    .eq('id', id)

  if (error) return serverError('Could not delete FAQ')
  revalidateTag('faqs')
  return ok({ id })
}