import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClientWithCookies } from '@/lib/supabase-server'

export interface AdminApiContext {
  user: { id: string; email?: string }
  supabase: SupabaseClient
  adminClient: SupabaseClient
}

/**
 * ✅ Universal Admin API Auth Helper
 * 
 * Ye check karta hai:
 * 1. User authenticated hai (Supabase session cookie se)
 * 2. User ka role = 'admin' hai (profiles table se — service role से check)
 * 
 * Usage:
 *   const ctx = await requireAdmin()
 *   if (isAdminApiError(ctx)) return ctx.response
 *   const { adminClient } = ctx
 */
export async function requireAdmin(): Promise<
  AdminApiContext | { error: string; response: NextResponse }
> {
  try {
    const supabase = createServerClientWithCookies()

    // 1. Session se user nikaalo
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        error: 'Not authenticated',
        response: NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        ),
      }
    }

    // 2. Admin role check — Service Role client
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[requireAdmin] Profile check error:', profileError)
      return {
        error: 'Profile check failed',
        response: NextResponse.json(
          { error: 'Profile check failed' },
          { status: 500 }
        ),
      }
    }

    if (!profile || profile.role !== 'admin') {
      return {
        error: 'Admin access required',
        response: NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        ),
      }
    }

    return {
      user: { id: user.id, email: user.email },
      supabase,
      adminClient,
    }
  } catch (err) {
    console.error('[requireAdmin] Unexpected error:', err)
    return {
      error: 'Auth check failed',
      response: NextResponse.json(
        { error: 'Auth check failed' },
        { status: 500 }
      ),
    }
  }
}

export function isAdminApiError(
  result: AdminApiContext | { error: string; response: NextResponse }
): result is { error: string; response: NextResponse } {
  return 'error' in result
}