// lib/next-param.ts
// Safe `next` param handling for post-auth redirects.
// Blocks: external URLs, protocol-relative (//evil.com), javascript:, data:.

export function sanitizeNext(
  raw: string | null | undefined
): string | null {
  if (!raw) return null
  const s = String(raw).trim()

  // Must start with a single "/"
  if (!s.startsWith('/')) return null
  // Block protocol-relative URLs (//evil.com)
  if (s.startsWith('//')) return null
  // Block any protocol injection
  if (s.includes('://')) return null
  // Block control chars / newlines
  if (/[\x00-\x1f]/.test(s)) return null
  // Sanity length limit
  if (s.length > 500) return null

  return s
}

/** Returns sanitized next or fallback */
export function getSafeNext(
  raw: string | null | undefined,
  fallback = '/dashboard'
): string {
  return sanitizeNext(raw) ?? fallback
}