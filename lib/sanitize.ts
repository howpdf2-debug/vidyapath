// lib/sanitize.ts
// Sanitizes HTML content before dangerouslySetInnerHTML

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'code', 'pre',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div',
  'sub', 'sup', 'hr',
])

const ALLOWED_ATTRS = new Set([
  'href', 'title', 'target', 'rel',
  'src', 'alt', 'width', 'height',
  'class', 'style',
])

/**
 * Basic HTML sanitizer — strips scripts, iframes, event handlers
 * Use for admin-authored content where input is semi-trusted.
 * For untrusted input, use DOMPurify on the client instead.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // Remove script, iframe, object, embed, style tags entirely
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')

  // Remove event handlers (onclick, onerror, etc.)
  clean = clean.replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
  clean = clean.replace(/\son\w+\s*=\s*'[^']*'/gi, '')
  clean = clean.replace(/\son\w+\s*=\s*[^\s>]+/gi, '')

  // Remove javascript: URLs
  clean = clean.replace(/javascript:/gi, '')

  // Remove data: URLs (except images)
  clean = clean.replace(/data:(?!image\/)/gi, '')

  return clean
}

/**
 * Strip all HTML — for plain text display
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}