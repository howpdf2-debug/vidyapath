import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminApiError } from '@/lib/admin-api'
import { sanitizeHtml } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ═══════════════════════════════════════════════════════
// POST — Create note (with optional PDF)
// ═══════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const body = await request.json()

    if (!body.class || !body.subject || !body.chapter_num || !body.topic || !body.content_html) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ✅ Lookup ncert_id
    const { data: ncertRow, error: ncertError } = await ctx.adminClient
      .from('ncert')
      .select('id')
      .eq('class', Number(body.class))
      .eq('subject', body.subject)
      .eq('chapter_num', Number(body.chapter_num))
      .eq('language', body.language || 'en')
      .maybeSingle()

    if (ncertError) {
      return NextResponse.json({ error: ncertError.message }, { status: 500 })
    }
    if (!ncertRow) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // ✅ Build payload with PDF fields
    const payload: Record<string, unknown> = {
      ncert_id: ncertRow.id,
      topic: String(body.topic).trim(),
      difficulty_level: body.difficulty_level || 'medium',
      content_html: sanitizeHtml(body.content_html),
      order_index: Number(body.order_index) || 0,
    }

    // ✅ Only include PDF fields if provided
    if (body.pdf_url) {
      payload.pdf_url = String(body.pdf_url)
      payload.pdf_size_kb = Number(body.pdf_size_kb) || null
      payload.pdf_uploaded_at = new Date().toISOString()
    }

    const { data, error } = await ctx.adminClient
      .from('chapter_notes')
      .insert(payload)
      .select()

    if (error) {
      console.error('[admin/notes POST]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[admin/notes POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════
// PUT — Update note
// ═══════════════════════════════════════════════════════
export async function PUT(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const noteId = Number(id)
    if (!Number.isInteger(noteId) || noteId < 1) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    // ✅ Sanitize content if present
    if (updates.content_html) {
      updates.content_html = sanitizeHtml(updates.content_html)
    }

    // ✅ Handle PDF fields
    if (updates.pdf_url) {
      updates.pdf_size_kb = Number(updates.pdf_size_kb) || null
      updates.pdf_uploaded_at = new Date().toISOString()
    } else if (updates.pdf_url === null || updates.pdf_url === '') {
      // PDF removed
      updates.pdf_url = null
      updates.pdf_size_kb = null
      updates.pdf_uploaded_at = null
    }

    const { data, error } = await ctx.adminClient
      .from('chapter_notes')
      .update(updates)
      .eq('id', noteId)
      .select()

    if (error) {
      console.error('[admin/notes PUT]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[admin/notes PUT]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
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

    const { data, error } = await ctx.adminClient
      .from('chapter_notes')
      .select(
        `
        id, ncert_id, topic, difficulty_level, order_index,
        content_html, created_at,
        pdf_url, pdf_size_kb, pdf_uploaded_at,
        ncert:ncert_id (id, class, subject, chapter_num, chapter_title, language)
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════
// DELETE — Delete note
// ═══════════════════════════════════════════════════════
export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const noteId = Number(id)
    if (!Number.isInteger(noteId) || noteId < 1) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const { error } = await ctx.adminClient
      .from('chapter_notes')
      .delete()
      .eq('id', noteId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}