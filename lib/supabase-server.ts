import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════
interface CookieToSet {
  name: string
  value: string
  options?: {
    domain?: string
    expires?: Date
    httpOnly?: boolean
    maxAge?: number
    path?: string
    sameSite?: 'strict' | 'lax' | 'none' | boolean
    secure?: boolean
  }
}

// ═══════════════════════════════════════════════════════
// COOKIE-AWARE SERVER CLIENT
// Use in: layouts, pages, Server Components
// ═══════════════════════════════════════════════════════
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            )
          } catch {
            // Called from Server Component — cookie set may throw.
            // Middleware handles session refresh; safe to ignore.
          }
        },
      },
    }
  )
}