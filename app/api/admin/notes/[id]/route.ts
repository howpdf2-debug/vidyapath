import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminApiError } from '@/lib/admin-api'
import { sanitizeHtml } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ═══════════════════════════════════════════════════════
// GET — Single note
// ═══════════════════════════════════════════════════════
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const { data, error } = await ctx.adminClient
      .from('chapter_notes')
      .select(
        `
        id, ncert_id, topic, difficulty_level, order_index, created_at, content_html,
        ncert:ncert_id (id, class, subject, chapter_num, chapter_title, language)
      `
      )
      .eq('id', params.id)
      .maybeSingle()

    if (error) {
      console.error('[admin/notes/[id] GET]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[admin/notes/[id] GET] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════
// PUT — Update single note
// ═══════════════════════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const body = await request.json()

    if (body.content_html) {
      body.content_html = sanitizeHtml(body.content_html)
    }

    const { data, error } = await ctx.adminClient
      .from('chapter_notes')
      .update(body)
      .eq('id', params.id)
      .select()

    if (error) {
      console.error('[admin/notes/[id] PUT]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[admin/notes/[id] PUT] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════
// DELETE — Delete single note
// ═══════════════════════════════════════════════════════
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const { error } = await ctx.adminClient
      .from('chapter_notes')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('[admin/notes/[id] DELETE]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/notes/[id] DELETE] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}