import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerClient()
  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

  const { data, error } = await supabase
    .from('rojgar_samachar')
    .delete()
    .lt('published_date', twoMonthsAgo.toISOString().split('T')[0])
    .select()

  return NextResponse.json({
    success: !error,
    deleted: data?.length || 0,
  })
}