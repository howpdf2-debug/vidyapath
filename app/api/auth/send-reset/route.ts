import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Check if user exists
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    if (userError) {
      console.error('List users error:', userError)
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 })
    }

    const user = users?.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    // Generate token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600_000) // 1 hour

    const { error: insertError } = await supabaseAdmin
      .from('password_resets')
      .insert({ email, token, expires_at: expiresAt })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create reset link' }, { status: 500 })
    }

    // Only send email if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${token}`

      const { error: emailError } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Reset your VidyaPath password',
        html: `
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password (valid for 1 hour):</p>
          <a href="${resetLink}">${resetLink}</a>
        `,
      })

      if (emailError) {
        console.error('Resend error:', emailError)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Send reset error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}