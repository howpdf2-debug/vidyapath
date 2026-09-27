import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ═══════════════════════════════════════════════════════════════
// ⚠️  DEPRECATED ENDPOINT — P1 SECURITY FIX
// ═══════════════════════════════════════════════════════════════
//
// @deprecated 2026-XX-XX
// @severity   P1 (High)
// @category   User Enumeration
//
// ─── Original Vulnerability ───
// POST /api/auth/check-user
//   Body: { email }
//   Response: { exists: boolean, confirmed: boolean, canResetPassword: boolean }
//
// This EXPLICITLY leaked:
//   • Whether an email is registered
//   • Whether email is verified
//   • Whether password reset is available
//
// ─── Impact ───
//   • Mass account enumeration (no rate limit)
//   • O(n) listUsers() scan (DoS vector)
//   • High-value target identification for phishing
//
// ─── Fix ───
//   • Endpoint decommissioned (410 Gone)
//   • All HTTP methods blocked
//   • Deprecation headers (RFC 8594)
//   • Attempts logged for monitoring
//
// ─── Verified Safe to Remove ───
//   • No client consumer found (codebase search)
//   • No external API documented
//   • No mobile app dependency
//
// Report: docs/security/p1-auth-enum.md
//
// ═══════════════════════════════════════════════════════════════

// ─── Deprecation metadata ───
const DEPRECATION_DATE = '2026-XX-XX'          // update karo
const SUNSET_DATE = 'Wed, 31 Dec 2026 23:59:59 GMT'
const REPLACEMENT_DOCS = '/docs/security/p1-auth-enum.md'

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Log deprecation attempt for security monitoring.
 * Never throws — best-effort logging only.
 */
function logAttempt(method: string, request: NextRequest): void {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const ua = request.headers.get('user-agent') || 'unknown'
    const ref = request.headers.get('referer') || '-'

    console.warn(
      `[check-user][DEPRECATED] method=${method} ip=${ip} ua="${ua}" ref="${ref}"`
    )
  } catch {
    // Never crash on logging
  }
}

/**
 * Standard 410 Gone response.
 * RFC 7231 §6.5.9 — "intended for situations where the resource was
 * previously available but is no longer."
 */
function goneResponse(method: string): NextResponse {
  return NextResponse.json(
    {
      error: 'This endpoint is no longer available',
      code: 'ENDPOINT_REMOVED',
      method,
      reason: 'Deprecated due to security vulnerability (P1)',
      docs: REPLACEMENT_DOCS,
    },
    {
      status: 410,
      headers: {
        // RFC 8594 — Deprecation header
        Deprecation: `@${DEPRECATION_DATE}`,
        // RFC 8594 — Sunset header
        Sunset: SUNSET_DATE,
        // RFC 8288 — Link to replacement docs
        Link: `<${REPLACEMENT_DOCS}>; rel="deprecation"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}

/**
 * Standard 405 Method Not Allowed.
 */
function methodNotAllowed(method: string): NextResponse {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      method,
    },
    {
      status: 405,
      headers: {
        Allow: 'POST', // technically only POST was defined, though also gone
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}

// ═══════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════

/**
 * @deprecated POST /api/auth/check-user — removed for P1 enumeration.
 * Always returns 410 Gone.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  logAttempt('POST', request)
  return goneResponse('POST')
}

/**
 * @deprecated GET /api/auth/check-user — method not allowed.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  logAttempt('GET', request)
  return methodNotAllowed('GET')
}

/**
 * @deprecated PUT /api/auth/check-user — method not allowed.
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  logAttempt('PUT', request)
  return methodNotAllowed('PUT')
}

/**
 * @deprecated PATCH /api/auth/check-user — method not allowed.
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  logAttempt('PATCH', request)
  return methodNotAllowed('PATCH')
}

/**
 * @deprecated DELETE /api/auth/check-user — method not allowed.
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  logAttempt('DELETE', request)
  return methodNotAllowed('DELETE')
}

/**
 * @deprecated HEAD /api/auth/check-user — method not allowed.
 * Returns empty body per HTTP spec.
 */
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  logAttempt('HEAD', request)
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: 'POST' },
  })
}

/**
 * OPTIONS — CORS preflight.
 * Returns 204 with no CORS allow (endpoint gone).
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'POST',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}