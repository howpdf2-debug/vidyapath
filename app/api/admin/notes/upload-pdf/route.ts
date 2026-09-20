import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminApiError } from '@/lib/admin-api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ⚠️ Vercel Hobby/Pro: request body limit 4.5 MB
// 4 MB rakha hai (multipart overhead ~10% ke baad bhi safe)
const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4 MB
const MAX_FILENAME_LENGTH = 80
const ALLOWED_MIME = ['application/pdf']
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46] // "%PDF"

// ═══════════════════════════════════════════════════════
// RATE LIMITER (with periodic cleanup)
// ═══════════════════════════════════════════════════════
const uploadTracker = new Map<string, { count: number; resetAt: number }>()
const RATE_WINDOW = 5 * 60_000 // 5 min
const RATE_MAX = 10

function checkUploadRate(userId: string): boolean {
  const now = Date.now()
  const entry = uploadTracker.get(userId)

  if (!entry || entry.resetAt < now) {
    uploadTracker.set(userId, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_MAX) return false
  entry.count++
  return true
}

// ✅ Periodic cleanup — memory leak रोकता है
if (typeof setInterval !== 'undefined') {
  const t = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of uploadTracker.entries()) {
      if (entry.resetAt < now) uploadTracker.delete(key)
    }
  }, 10 * 60_000) // हर 10 मिनट
  // @ts-ignore — Node Timeout has unref; browser type doesn't
  if (typeof t?.unref === 'function') t.unref()
}

// ✅ PDF magic bytes verify
function isPdfHeader(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 4))
  return PDF_MAGIC.every((b, i) => bytes[i] === b)
}

// ✅ Safe UUID (crypto.randomUUID fallback)
function safeUUID(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID().substring(0, 8)
    }
  } catch {}
  return Math.random().toString(36).substring(2, 10)
}

// ✅ Our filename format: {timestamp}-{uuid}-{basename}.pdf
const FILENAME_REGEX = /^\d+-[a-z0-9]+-[\w\u0900-\u097F_-]*\.pdf$/i

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  if (!checkUploadRate(ctx.user.id)) {
    return NextResponse.json(
      { error: 'बहुत ज्यादा uploads। कुछ देर बाद try करें।' },
      { status: 429 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    // ─── Validations ───
    if (!file) {
      return NextResponse.json({ error: 'कोई file नहीं मिली' }, { status: 400 })
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'File खाली है' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File 4 MB से बड़ी है' },
        { status: 400 }
      )
    }
    // MIME check (lenient — कुछ browsers empty MIME भेजते हैं)
    const nameLower = file.name.toLowerCase()
    const hasExt = nameLower.endsWith('.pdf')
    const hasMime = ALLOWED_MIME.includes(file.type)
    if (!hasExt && !hasMime) {
      return NextResponse.json(
        { error: 'सिर्फ PDF files allowed हैं' },
        { status: 400 }
      )
    }

    // ─── Read file & validate magic bytes ───
    const arrayBuffer = await file.arrayBuffer()
    if (!isPdfHeader(arrayBuffer)) {
      return NextResponse.json(
        { error: 'File valid PDF नहीं है' },
        { status: 400 }
      )
    }

    // ─── Safe filename ───
    const timestamp = Date.now()
    const uuid = safeUUID()
    const stripped = file.name.replace(/\.pdf$/i, '')
    const sanitized = stripped
      .replace(/[^a-zA-Z0-9\-_\u0900-\u097F]/g, '_')
      .substring(0, MAX_FILENAME_LENGTH)
    // ✅ Fallback — agar name khaali ho jaye
    const baseName = sanitized || 'file'
    const fileName = `${timestamp}-${uuid}-${baseName}.pdf`

    // ─── Upload ───
    const { error: uploadError } = await ctx.adminClient.storage
      .from('note-pdfs')
      .upload(fileName, arrayBuffer, {
        contentType: 'application/pdf',
        upsert: false,
        cacheControl: '31536000', // 1 year
      })

    if (uploadError) {
      console.error('[upload-pdf]', uploadError)
      return NextResponse.json(
        { error: `Upload fail: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // ─── Public URL ───
    const { data: urlData } = ctx.adminClient.storage
      .from('note-pdfs')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      pdf_url: urlData.publicUrl,
      pdf_size_kb: Math.round(file.size / 1024),
      file_name: fileName,
      original_name: file.name,
    })
  } catch (err) {
    console.error('[upload-pdf]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin()
  if (isAdminApiError(ctx)) return ctx.response

  try {
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get('url')

    if (!fileUrl) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    // ✅ Extract & validate filename from URL
    let fileName: string
    try {
      const url = new URL(fileUrl)
      const parts = url.pathname.split('/')
      const rawName = parts[parts.length - 1]

      // ✅ FIX: URL-decode karo (Hindi filenames ke liye)
      fileName = decodeURIComponent(rawName)

      // ✅ Validate filename format (our naming convention)
      if (!FILENAME_REGEX.test(fileName)) {
        return NextResponse.json(
          { error: 'Invalid filename' },
          { status: 400 }
        )
      }

      // ✅ Safety: path traversal block
      if (fileName.includes('/') || fileName.includes('..')) {
        return NextResponse.json(
          { error: 'Invalid filename' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
    }

    const { error } = await ctx.adminClient.storage
      .from('note-pdfs')
      .remove([fileName])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}