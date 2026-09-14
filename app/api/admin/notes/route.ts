import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ========== GET ==========
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('chapter_notes')
      .select('*')
      .order('class')
      .order('subject')
      .order('chapter_num')

    if (error) {
      console.error('GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err: any) {
    console.error('GET catch:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

// ========== POST ==========
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { class: cls, subject, chapter_num, topic, difficulty_level, content_html } = body

    if (!cls || !subject || !chapter_num || !topic || !content_html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('chapter_notes')
      .insert({
        class: Number(cls),
        subject,
        chapter_num: Number(chapter_num),
        topic,
        difficulty_level: difficulty_level || 'medium',
        content_html,
      })
      .select()

    if (error) {
      console.error('POST error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err: any) {
    console.error('POST catch:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

// ========== PUT ==========
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, class: cls, subject, chapter_num, topic, difficulty_level, content_html } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('chapter_notes')
      .update({
        class: Number(cls),
        subject,
        chapter_num: Number(chapter_num),
        topic,
        difficulty_level: difficulty_level || 'medium',
        content_html,
      })
      .eq('id', Number(id))
      .select()

    if (error) {
      console.error('PUT error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err: any) {
    console.error('PUT catch:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

// ========== DELETE ==========
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('chapter_notes')
      .delete()
      .eq('id', Number(id))

    if (error) {
      console.error('DELETE error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ✅ Always return a valid JSON response
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    console.error('DELETE catch:', err)
    // ✅ Ensure JSON even on unexpected errors
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}