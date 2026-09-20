import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ═══════════════════════════════════════════════════════
// ✅ SERVER CLIENT WITH COOKIES (Auth-aware)
//    - Admin API routes (notes, videos, chapters, exams)
//    - Admin layout (role check)
//    - Student protected pages (dashboard, bookmarks)
//    - Middleware (session refresh)
//    
//    ⚠️ सिर्फ Server Components / API Routes में import करें
//    ❌ Client Components में import मत करें
// ═══════════════════════════════════════════════════════
export function createServerClientWithCookies(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[Supabase Server] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  const cookieStore = cookies()

  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component से call हुआ — ignore
        }
      },
    },
  })
}