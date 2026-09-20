import { createBrowserClient } from '@supabase/ssr'
import {
  createClient as supabaseCreateClient,
  type SupabaseClient,
} from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ═══════════════════════════════════════════════════════
// ✅ BROWSER CLIENT (Lazy Singleton)
//    - Student login/signup
//    - Admin login (via API call)
//    - Client-side operations (bookmarks, progress, admin pages)
// ═══════════════════════════════════════════════════════
let clientInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (clientInstance) return clientInstance

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  })

  return clientInstance
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

// ═══════════════════════════════════════════════════════
// ✅ SERVER CLIENT (Public data — NO cookies)
//    यह 16+ public pages use करती हैं (ncert, notes, search)
// ═══════════════════════════════════════════════════════
export const createServerClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
  return supabaseCreateClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// ✅ Alias (पुराने code के लिए)
export const createClient = createServerClient