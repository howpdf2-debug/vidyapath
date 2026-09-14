import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // 1. Verify token
    const { data: reset, error: findError } = await supabaseAdmin
      .from('password_resets')
      .select('email, expires_at, used')
      .eq('token', token)
      .single()

    if (findError || !reset) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    if (reset.used) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 })
    }

    if (new Date(reset.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    // 2. Find user by email to get their ID
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('List users error:', listError)
      return NextResponse.json({ error: 'Failed to find user' }, { status: 500 })
    }

    const user = userList?.users?.find((u) => u.email === reset.email)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Update password using updateUserById (the correct method)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password }
    )

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    // 4. Mark token as used
    await supabaseAdmin
      .from('password_resets')
      .update({ used: true })
      .eq('token', token)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}