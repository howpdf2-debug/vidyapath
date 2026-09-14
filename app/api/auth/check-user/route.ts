import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
)

/**
 * POST /api/auth/check-user
 * Body: { email: string }
 *
 * Returns:
 * {
 *   exists: boolean,      // user exists in DB
 *   confirmed: boolean,   // email verified
 *   canResetPassword: boolean  // safe to send reset email
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()

    // Fetch user list (paginate through all)
    let allUsers: any[] = []
    let page = 1
    const perPage = 1000

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      })

      if (error) {
        console.error('[check-user] listUsers error:', error.message)
        return NextResponse.json(
          { error: 'Failed to check user' },
          { status: 500 }
        )
      }

      if (!data?.users?.length) break
      allUsers = allUsers.concat(data.users)
      if (data.users.length < perPage) break
      page++
    }

    const user = allUsers.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    )

    if (!user) {
      return NextResponse.json({
        exists: false,
        confirmed: false,
        canResetPassword: false,
        message: 'User does not exist',
      })
    }

    const isConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at)

    return NextResponse.json({
      exists: true,
      confirmed: isConfirmed,
      canResetPassword: isConfirmed,
      message: isConfirmed
        ? 'User confirmed — can reset password'
        : 'User exists but email not verified',
    })
  } catch (err: any) {
    console.error('[check-user] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}