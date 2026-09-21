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

// 🚨 EMERGENCY BLOCK LIST
// Vercel edge cache ki wajah se in routes ka naya auth code propagate nahi
// ho raha. Ye middleware se block hai — cache bypass karta hai, 100% effective.
// TODO: Vercel cache invalidate hone ke baad ye list empty karo.
const EMERGENCY_BLOCKED = [
  '/api/rojgar-samachar/cleanup',
  '/api/rojgar-samachar/update',
]

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ request.headers को सीधे mutate करो — नई object नहीं
  request.headers.set('x-pathname', pathname)

  // ─── 🚨 EMERGENCY BLOCK — सबसे पहले, सब कुछ bypass ───
  // Ye check cache ke upar chalta hai kyunki middleware cache-free hai.
  if (EMERGENCY_BLOCKED.includes(pathname)) {
    return applySecurityHeaders(
      NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    )
  }

  // ─── Public auth routes — sirf headers ───
  if (matchesPrefix(pathname, PUBLIC_AUTH)) {
    return applySecurityHeaders(NextResponse.next({ request }))
  }

  // ─── Non-protected routes — sirf headers ───
  if (!matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    return applySecurityHeaders(NextResponse.next({ request }))
  }

  // ─── Protected route — Supabase auth verify ───
  // ✅ पूरा request object pass करो, headers snapshot नहीं
  let response = NextResponse.next({ request })

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
            // ✅ request.cookies mutate → request object में जाता है
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            // ✅ Reassign — mutated request के साथ
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (pathname.startsWith('/admin')) {
      if (!user) {
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('next', pathname)
        return applySecurityHeaders(NextResponse.redirect(loginUrl))
      }
      return applySecurityHeaders(response)
    }

    if (pathname.startsWith('/api/admin')) {
      if (!user) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
          )
        )
      }
      return applySecurityHeaders(response)
    }

    if (matchesPrefix(pathname, ['/dashboard', '/bookmarks', '/profile'])) {
      if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('next', pathname)
        return applySecurityHeaders(NextResponse.redirect(loginUrl))
      }
      return applySecurityHeaders(response)
    }

    return applySecurityHeaders(response)
  } catch (err) {
    console.error('[middleware] auth.getUser failed:', err)
    if (pathname.startsWith('/api/admin')) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      )
    }
    if (pathname.startsWith('/admin')) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL('/admin/login', request.url))
      )
    }
    return applySecurityHeaders(NextResponse.next({ request }))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-.*\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}