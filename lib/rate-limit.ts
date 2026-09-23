import { NextRequest } from 'next/server'

// ✅ In-memory rate limiter
// ⚠️ Note: per-instance on Vercel — not a hard guarantee.
// Production-grade → Upstash Redis later.

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

if (typeof setInterval !== 'undefined') {
  const t = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt < now) buckets.delete(key)
    }
  }, 10 * 60_000)
  // @ts-ignore — Node Timeout has unref
  if (typeof t?.unref === 'function') t.unref()
}

export function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

export function checkRateLimit(
  key: string,
  { windowMs, max }: { windowMs: number; max: number }
): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (bucket.count >= max) return false
  bucket.count++
  return true
}