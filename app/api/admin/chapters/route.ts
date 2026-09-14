import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { class: cls, subject, chapter_num, chapter_title } = body

    // Validation
    if (!cls || !subject || !chapter_num || !chapter_title) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Supabase Insert
    const { data, error } = await supabase
      .from('ncert')
      .insert([{ class: cls, subject, chapter_num, chapter_title }])
      .select()

    if (error) {
      console.error('Supabase Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}