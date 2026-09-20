import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ✅ Service Role client — सिर्फ profile check के लिए (one-time)
function getServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // 1. Sign in with Supabase Auth (sets sb-*-auth-token cookies)
    const supabase = createServerClientWithCookies()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('[admin/login] Auth OK for user:', data.user.id)

    // 2. Check admin role — Service Role client (bypasses RLS)
    const adminClient = getServiceRoleClient()
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, email')
      .eq('id', data.user.id)
      .maybeSingle()

    console.log('[admin/login] Profile:', { profile, profileError })

    if (profileError) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: `Profile check failed: ${profileError.message}` },
        { status: 500 }
      )
    }

    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // 3. Update last_login_at
    await adminClient
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'admin',
      },
    })
  } catch (error) {
    console.error('[admin/login] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}