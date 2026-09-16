import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════
// MIDDLEWARE — Security Headers + Lightweight Auth Check
// ═══════════════════════════════════════════════════════
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ CRITICAL: Propagate pathname to downstream (layout reads it)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // ─── Security Headers ───
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // ─── Admin Cookie Presence Check (fast, no SDK) ───
  const isAdminPage = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/admin/login'

  if (isAdminPage && !isLoginRoute) {
    // ✅ Detect Supabase auth cookie (handles chunked + excludes mid-flow)
    const hasAuthCookie = request.cookies.getAll().some((cookie) => {
      const n = cookie.name
      if (!n.startsWith('sb-')) return false
      if (!n.includes('-auth-token')) return false
      // Exclude OAuth mid-flow cookies (code-verifier, etc.)
      if (n.includes('code-verifier')) return false
      return true
    })

    if (!hasAuthCookie) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

// ═══════════════════════════════════════════════════════
// MATCHER — Skip static, PWA, sitemap files
// ═══════════════════════════════════════════════════════
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-.*\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}