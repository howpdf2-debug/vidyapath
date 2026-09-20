import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminApiError } from '@/lib/admin-api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ═══════════════════════════════════════════════════════
// GET — List all chapters (ncert table)
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

    const { data, error } = await ctx.adminClient
      .from('ncert')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[admin/chapters GET]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[admin/chapters GET] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════
// POST — Create chapter
// ═══════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const body = await request.json()

    // Expected: { class, subject, chapter_num, chapter_title, language? }
    const payload = {
      class: Number(body.class),
      subject: body.subject,
      chapter_num: Number(body.chapter_num),
      chapter_title: body.chapter_title,
      language: body.language || 'en',
    }

    if (
      !payload.class ||
      !payload.subject ||
      !payload.chapter_num ||
      !payload.chapter_title
    ) {
      return NextResponse.json(
        { error: 'Missing: class, subject, chapter_num, chapter_title' },
        { status: 400 }
      )
    }

    const { data, error } = await ctx.adminClient
      .from('ncert')
      .insert(payload)
      .select()

    if (error) {
      console.error('[admin/chapters POST]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[admin/chapters POST] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════
// PUT — Update chapter
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

    const { data, error } = await ctx.adminClient
      .from('ncert')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('[admin/chapters PUT]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[admin/chapters PUT] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════
// DELETE — Delete chapter
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

    const { error } = await ctx.adminClient
      .from('ncert')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[admin/chapters DELETE]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/chapters DELETE] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}