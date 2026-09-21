import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ✅ Service role client — RLS bypass (route already CRON_SECRET se protected hai)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

  const { data, error } = await supabaseAdmin
    .from('rojgar_samachar')
    .delete()
    .lt('published_date', twoMonthsAgo.toISOString().split('T')[0])
    .select()

  if (error) {
    console.error('[rojgar-cleanup]', error)
    return NextResponse.json(
      { success: false, deleted: 0, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    deleted: data?.length || 0,
  })
}