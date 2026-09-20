// lib/sanitize.ts
// HTML Sanitizer — preserves formatting + inline SVG diagrams

export function sanitizeHtml(html: string): string {
  if (!html) return ''

  let clean = html

  // ─── 1. Remove dangerous tags WITH their content ───
  const dangerousTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'style',
    'link',
    'meta',
    'base',
    'form',
    'noscript',
  ]

  for (const tag of dangerousTags) {
    const pairedRegex = new RegExp(
      `<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`,
      'gi'
    )
    clean = clean.replace(pairedRegex, '')

    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi')
    clean = clean.replace(selfClosingRegex, '')
  }

  // ─── 2. Remove event handlers ───
  clean = clean.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '')
  clean = clean.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '')
  clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '')

  // ─── 3. Remove javascript: URLs ───
  clean = clean.replace(
    /(\s(?:href|src|xlink:href|action|formaction)\s*=\s*)(["'])\s*(?:java|vb|live)script\s*:[^"']*\2/gi,
    '$1$2#$2'
  )
  clean = clean.replace(
    /(\s(?:href|src|xlink:href|action|formaction)\s*=\s*)(?:java|vb|live)script\s*:[^\s>]*/gi,
    '$1#'
  )
  clean = clean.replace(/(?:java|vb|live)script\s*:/gi, '')

  // ─── 4. Remove unsafe data: URLs ───
  clean = clean.replace(
    /data:(?!image\/(?:png|jpe?g|gif|webp|avif)\b)[^"')\s>]*/gi,
    ''
  )

  // ─── 5. Remove HTML comments ───
  clean = clean.replace(/<!--[\s\S]*?-->/g, '')

  return clean
}

export function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}