import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminApiError } from '@/lib/admin-api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ═══════════════════════════════════════════════════════
// GET — List all videos
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

    const { data, error } = await ctx.adminClient
      .from('chapter_videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[admin/videos GET]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[admin/videos GET] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════
// POST — Create video
// ═══════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const body = await request.json()

    const { data, error } = await ctx.adminClient
      .from('chapter_videos')
      .insert(body)
      .select()

    if (error) {
      console.error('[admin/videos POST]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[admin/videos POST] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════
// PUT — Update video
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
      .from('chapter_videos')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('[admin/videos PUT]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[admin/videos PUT] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════
// DELETE — Delete video
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
      .from('chapter_videos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[admin/videos DELETE]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/videos DELETE] Unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}