// lib/auth-server.ts
// ═══════════════════════════════════════════════════════
// SERVER-ONLY HELPERS
// ⚠️ Uses next/headers — ONLY import in Server Components
//             or API Routes
// ═══════════════════════════════════════════════════════

import { createServerClientWithCookies } from './supabase-server'

/**
 * Get server-side session with cookies.
 * Returns session if logged in, null otherwise.
 */
export async function getServerSession() {
  try {
    const supabase = createServerClientWithCookies()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.warn('[auth-server] getServerSession error:', error.message)
      return null
    }

    return session
  } catch (err) {
    console.error('[auth-server] getServerSession failed:', err)
    return null
  }
}

/**
 * Get current user (server-side).
 * More reliable than getSession() — validates JWT with Supabase.
 */
export async function getServerUser() {
  try {
    const supabase = createServerClientWithCookies()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.warn('[auth-server] getServerUser error:', error.message)
      return null
    }

    return user
  } catch (err) {
    console.error('[auth-server] getServerUser failed:', err)
    return null
  }
}