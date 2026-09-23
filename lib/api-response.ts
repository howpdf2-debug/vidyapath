import { NextResponse } from 'next/server'

// ✅ U3, U15 FIX: consistent API response shapes

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init)
}

export function created<T>(data: T) {
  return NextResponse.json({ ok: true, data }, { status: 201 })
}

export function validationError(
  errors: Record<string, string>,
  message?: string
) {
  return NextResponse.json(
    {
      ok: false,
      error: message || 'Validation failed',
      fields: errors,
    },
    { status: 400 }
  )
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ ok: false, error: message }, { status: 401 })
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ ok: false, error: message }, { status: 403 })
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ ok: false, error: message }, { status: 404 })
}

export function serverError(message = 'Server error') {
  return NextResponse.json({ ok: false, error: message }, { status: 500 })
}

export function tooManyRequests(message = 'Too many requests') {
  return NextResponse.json({ ok: false, error: message }, { status: 429 })
}