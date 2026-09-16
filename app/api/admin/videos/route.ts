import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ═══════════ GET — List with filters ═══════════
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cls = searchParams.get('class')
  const subject = searchParams.get('subject')
  const language = searchParams.get('language')
  const type = searchParams.get('type')
  const q = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '100')
  const offset = parseInt(searchParams.get('offset') || '0')

  const supabase = createServerClient()

  let query = supabase
    .from('chapter_videos')
    .select(
      `id, ncert_id, youtube_id, title, description, thumbnail_url,
       duration_seconds, video_type, language, order_index, is_featured,
       is_active, view_count, created_at,
       ncert:ncert_id (id, class, subject, chapter_num, chapter_title)`,
      { count: 'exact' }
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (language) query = query.eq('language', language)
  if (type) query = query.eq('video_type', type)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Post-filter for class/subject (nested query limitation)
  let filtered = data || []
  if (cls) filtered = filtered.filter((v: any) => v.ncert?.class === parseInt(cls))
  if (subject) filtered = filtered.filter((v: any) => v.ncert?.subject === subject)

  return NextResponse.json({ data: filtered, total: count || 0 })
}

// ═══════════ POST — Create ═══════════
export async function POST(req: Request) {
  const body = await req.json()
  const supabase = createServerClient()

  const {
    class: cls, subject, chapter_num,
    youtube_id, title, description,
    video_type = 'lecture', language = 'hi',
    order_index = 0, is_featured = false,
  } = body

  // Validation
  if (!cls || !subject || !chapter_num || !youtube_id || !title) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Step 1: Find ncert_id
  const { data: chapter, error: chErr } = await supabase
    .from('ncert')
    .select('id')
    .eq('class', parseInt(cls))
    .eq('subject', subject)
    .eq('chapter_num', parseInt(chapter_num))
    .eq('language', language)
    .maybeSingle()

  if (chErr || !chapter) {
    return NextResponse.json(
      { error: 'Chapter not found for this language' },
      { status: 404 }
    )
  }

  // Step 2: Insert (thumbnail auto-generated)
  const { data, error } = await supabase
    .from('chapter_videos')
    .insert({
      ncert_id: chapter.id,
      youtube_id,
      title,
      description: description || null,
      thumbnail_url: `https://i.ytimg.com/vi/${youtube_id}/hqdefault.jpg`,
      video_type,
      language,
      order_index: parseInt(order_index) || 0,
      is_featured: !!is_featured,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'This video is already added to this chapter' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// ═══════════ PUT — Update ═══════════
export async function PUT(req: Request) {
  const body = await req.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const supabase = createServerClient()

  const allowed = [
    'title', 'description', 'video_type', 'language',
    'order_index', 'is_featured', 'is_active',
  ]
  const patch: Record<string, any> = {}
  for (const k of allowed) {
    if (k in updates) patch[k] = updates[k]
  }
  if (patch.order_index) patch.order_index = parseInt(patch.order_index)

  const { data, error } = await supabase
    .from('chapter_videos')
    .update(patch)
    .eq('id', parseInt(id))
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// ═══════════ DELETE — Soft delete ═══════════
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const supabase = createServerClient()
  const { error } = await supabase
    .from('chapter_videos')
    .update({ is_active: false })
    .eq('id', parseInt(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}