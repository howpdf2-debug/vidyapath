import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = [
  '/admin',
  '/api/admin',
  '/dashboard',
  '/bookmarks',
  '/profile',
]

const PUBLIC_AUTH = [
  '/admin/login',
  '/api/admin/login',
  '/api/admin/logout',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/callback',
]

// ✅ GAP 1 FIX: security headers ek jagah — har response pe apply karo
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value)
  }
  return res
}

// ✅ GAP 2 FIX: exact match ya slash boundary — /admin OK, /administrator NAHI
function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // ✅ Ek hi response object — setAll isi ko mutate karega, replace nahi
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // ─── Public auth routes — sirf headers ───
  if (matchesPrefix(pathname, PUBLIC_AUTH)) {
    return withSecurityHeaders(response)
  }

  // ─── Non-protected routes — sirf headers ───
  if (!matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    return withSecurityHeaders(response)
  }

  // ─── Protected route — Supabase auth verify karo ───
  let user: { id: string } | null = null
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // ✅ GAP 1 FIX: response ko REPLACE nahi karte
            //    Same response pe cookies set karte hain → headers bache rehte hain
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch (err) {
    // ✅ GAP 3 FIX: crash nahi — safe side, unauthenticated treat karo
    console.error('[middleware] auth.getUser failed:', err)
    user = null
  }

  // ─── /admin/* ───
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      // ✅ GAP 4+6 FIX: redirect pe bhi headers
      return withSecurityHeaders(NextResponse.redirect(loginUrl))
    }
    return withSecurityHeaders(response)
  }

  // ─── /api/admin/* ───
  if (pathname.startsWith('/api/admin')) {
    if (!user) {
      // ✅ GAP 5 FIX: 401 JSON pe bhi headers
      return withSecurityHeaders(
        NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      )
    }
    return withSecurityHeaders(response)
  }

  // ─── Student protected routes ───
  if (matchesPrefix(pathname, ['/dashboard', '/bookmarks', '/profile'])) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return withSecurityHeaders(NextResponse.redirect(loginUrl))
    }
    return withSecurityHeaders(response)
  }

  return withSecurityHeaders(response)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-.*\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}