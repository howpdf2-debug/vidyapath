import { NextRequest } from 'next/server'

/**
 * ✅ SECURITY: Cron-only routes (Rojgar update/cleanup) ko public
 * internet se protect karta hai. Vercel Cron automatically
 * `Authorization: Bearer $CRON_SECRET` header bhejta hai.
 */
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET

  if (!secret) {
    console.error(
      '[cron-auth] CRON_SECRET env var missing — blocking request as unauthorized'
    )
    return false
  }

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}