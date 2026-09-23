// ✅ Mass-assignment protection with UX-aware helpers

// ═══════════════════════════════════════════════════════
// Allowlist picker
// ✅ F1, F3, F14 FIX: prevents any column write outside allowlist
// ✅ F16 FIX: only keys (not raw body) flow to DB
// ═══════════════════════════════════════════════════════
export function pickAllowedFields<T extends Record<string, unknown>>(
  body: T | null | undefined,
  allowedKeys: readonly string[]
): Record<string, unknown> {
  if (!body || typeof body !== 'object') return {}
  const picked: Record<string, unknown> = {}
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      picked[key] = body[key]
    }
  }
  return picked
}

// ═══════════════════════════════════════════════════════
// Type coercion with field-level error tracking
// ═══════════════════════════════════════════════════════
export interface FieldErrors {
  [field: string]: string
}

export function toPositiveInt(
  v: unknown,
  field: string,
  errors: FieldErrors
): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  if (isNaN(n)) {
    errors[field] = `${field} must be a number`
    return null
  }
  if (n < 1) {
    errors[field] = `${field} must be positive (1+)`
    return null
  }
  return n
}

export function toIntOrNull(
  v: unknown,
  field: string,
  errors: FieldErrors
): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  if (isNaN(n)) {
    errors[field] = `${field} must be a number`
    return null
  }
  return n
}

export function toBoolOrNull(
  v: unknown,
  field: string,
  errors: FieldErrors
): boolean | null {
  if (typeof v === 'boolean') return v
  if (v === 'true' || v === 1) return true
  if (v === 'false' || v === 0) return false
  errors[field] = `${field} must be true/false`
  return null
}

export function toTrimmedString(
  v: unknown,
  field: string,
  errors: FieldErrors,
  opts?: { min?: number; max?: number }
): string | null {
  if (typeof v !== 'string') {
    errors[field] = `${field} must be text`
    return null
  }
  const s = v.trim()
  if (opts?.min && s.length < opts.min) {
    errors[field] = `${field} too short (min ${opts.min})`
    return null
  }
  if (opts?.max && s.length > opts.max) {
    errors[field] = `${field} too long (max ${opts.max})`
    return null
  }
  return s
}

// ═══════════════════════════════════════════════════════
// UUID validation
// ═══════════════════════════════════════════════════════
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v)
}