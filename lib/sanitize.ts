// lib/sanitize.ts
// HTML Sanitizer — hardened against XSS + escaped-HTML + malformed attributes
//
// Features:
// - Auto-decodes escaped HTML (AI/code-block paste recovery)
// - Fixes broken attribute quotes (hydration-safe)
// - Strips dangerous tags (script, style, foreignObject, etc.)
// - Prevents encoded javascript: URL bypasses
// - Validates URL protocols (blocks blob:, data:text, etc.)
// - Removes raw CSS text + unclosed style tags
// - Preserves SVG diagrams, Hindi text, tables, code blocks

// ═══════════════════════════════════════════════════════
// Dangerous tags — removed WITH their content
// ═══════════════════════════════════════════════════════
const DANGEROUS_TAGS = [
  'script', 'noscript',
  'iframe', 'frame', 'frameset',
  'object', 'embed', 'applet', 'param',
  'style', 'link', 'meta', 'base',
  'form', 'template', 'slot',
  'foreignObject', 'animate', 'animateTransform', 'animateMotion', 'set', 'handler',
] as const

// Document wrapper tags — unwrap (remove tag, keep content)
const WRAPPER_TAGS = ['html', 'head', 'body', 'title'] as const

// ═══════════════════════════════════════════════════════
// HTML entity decoder
// ═══════════════════════════════════════════════════════
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => {
      const c = parseInt(h, 16)
      return c >= 0 && c <= 0x10ffff ? String.fromCodePoint(c) : ''
    })
    .replace(/&#(\d+);?/g, (_, d) => {
      const c = parseInt(d, 10)
      return c >= 0 && c <= 0x10ffff ? String.fromCodePoint(c) : ''
    })
    .replace(/&colon;/gi, ':')
    .replace(/&tab;/gi, '\t')
    .replace(/&newline;/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
}

// ═══════════════════════════════════════════════════════
// URL protocol validation
// ═══════════════════════════════════════════════════════
function sanitizeUrl(url: string): string {
  if (!url) return url
  const decoded = decodeEntities(url)
  const normalized = decoded
    .toLowerCase()
    .replace(/[\s\u0000-\u001f\u007f]+/g, '')

  if (normalized.startsWith('data:')) {
    return /^data:image\/(png|jpe?g|gif|webp|avif);base64,/i.test(normalized)
      ? url
      : '#'
  }

  const blocked = [
    'javascript:', 'vbscript:', 'livescript:', 'mocha:',
    'about:', 'filesystem:', 'blob:', 'chrome:', 'chrome-extension:',
    'resource:', 'view-source:',
  ]
  for (const proto of blocked) {
    if (normalized.startsWith(proto)) return '#'
  }
  return url
}

// ═══════════════════════════════════════════════════════
// Event handler patterns
// ═══════════════════════════════════════════════════════
const EVENT_HANDLER_WITH_SPACE =
  /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const EVENT_HANDLER_AFTER_QUOTE =
  /(["'])on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi

// ═══════════════════════════════════════════════════════
// URL attribute patterns
// ═══════════════════════════════════════════════════════
const URL_ATTR_QUOTED =
  /\b(xlink:href|href|src|action|formaction|poster)\s*=\s*(["'])([^"']*)\2/gi
const URL_ATTR_UNQUOTED =
  /\b(xlink:href|href|src|action|formaction|poster)\s*=\s*([^\s"'>]+)/gi

// ═══════════════════════════════════════════════════════
// Detect raw CSS content (no HTML tags but CSS syntax)
// ═══════════════════════════════════════════════════════
function looksLikeRawCss(text: string): boolean {
  const t = text.trim()
  if (t.length < 20) return false
  const hasCssSyntax =
    /\{[^}]*:[^}]*\}/.test(t) || /@media|:root|--[a-z]/i.test(t)
  const hasRealHtmlTag =
    /<(p|div|h[1-6]|ul|ol|li|table|svg|span|strong|em|a|img)\b/i.test(t)
  return hasCssSyntax && !hasRealHtmlTag
}

// ═══════════════════════════════════════════════════════
// Smart-decode heuristic — detect escaped HTML
// ═══════════════════════════════════════════════════════
function isLikelyEscapedHtml(html: string): boolean {
  const ltCount = (html.match(/&lt;/g) || []).length
  if (ltCount >= 3) return true

  const escapedTags = html.match(
    /&lt;(p|div|h[1-6]|ul|ol|li|br|strong|em|a|img|table|span)\b/gi
  )
  if (escapedTags && escapedTags.length >= 2) return true

  if (/&lt;!DOCTYPE/i.test(html) && /&lt;html/i.test(html)) return true

  return false
}

// ═══════════════════════════════════════════════════════
// Fix malformed attributes — hydration safety
// ═══════════════════════════════════════════════════════
function fixMalformedAttributes(html: string): string {
  let clean = html

  // (a) `style=" value"` → `style="value"` (leading whitespace inside quotes)
  clean = clean.replace(
    /\b(style|class|id|title|alt|href|src|xlink:href)\s*=\s*(["'])\s+([^"']*)\2/gi,
    '$1=$2$3$2'
  )

  // (b) `style=""` — empty attribute → remove it
  clean = clean.replace(
    /\b(style|class|id|title|alt)\s*=\s*(["'])\s*\2/gi,
    ''
  )

  // (c) Broken attribute values with stray `>` inside quoted region
  // Match: attr = " ... >  ... "  → truncate at >
  clean = clean.replace(
    /\b(style|class|id|title|alt|href|src|xlink:href)\s*=\s*"([^"]*?)>[^"]*"/gi,
    '$1="$2"'
  )

  // (d) Unclosed attributes (no closing quote) — attribute is broken
  // Pattern: attr = " ... <  (next tag starts before quote closes)
  clean = clean.replace(
    /\b(style|class|id|title|alt|href|src|xlink:href)\s*=\s*"[^"<>]*?(?=<)/gi,
    ''
  )

  // (e) Unclosed attribute at end of string
  clean = clean.replace(
    /\b(style|class|id|title|alt|href|src|xlink:href)\s*=\s*"[^"<>]*$/gi,
    ''
  )

  // (f) Collapse multiple spaces inside attribute values
  clean = clean.replace(/\s{2,}/g, ' ')

  return clean
}

// ═══════════════════════════════════════════════════════
// Main sanitizer
// ═══════════════════════════════════════════════════════
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // ─── 0. Smart decode: escaped HTML (AI/code-block paste) ───
  if (isLikelyEscapedHtml(html)) {
    html = decodeEntities(html)
  }

  let clean = html

  // ─── 1. Remove DOCTYPE declarations ───
  clean = clean.replace(/<!DOCTYPE[^>]*>/gi, '')

  // ─── 2. Unwrap html/head/body/title (remove tag, keep content) ───
  for (const tag of WRAPPER_TAGS) {
    clean = clean.replace(new RegExp(`<${tag}\\b[^>]*>`, 'gi'), '')
    clean = clean.replace(new RegExp(`<\\/${tag}\\s*>`, 'gi'), '')
  }

  // ─── 3. Remove dangerous tags WITH their content (multi-pass) ───
  for (let pass = 0; pass < 3; pass++) {
    let changed = false
    for (const tag of DANGEROUS_TAGS) {
      const paired = new RegExp(
        `<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`,
        'gi'
      )
      const unclosed = new RegExp(
        `<${tag}\\b[^>]*>[\\s\\S]*?(?=<[a-zA-Z\\/!]|$)`,
        'gi'
      )
      const orphanClose = new RegExp(`<\\/${tag}\\s*>`, 'gi')
      const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi')

      const before = clean
      clean = clean.replace(paired, '')
      clean = clean.replace(unclosed, '')
      clean = clean.replace(orphanClose, '')
      clean = clean.replace(selfClosing, '')
      if (clean !== before) changed = true
    }
    if (!changed) break
  }

  // ─── 4. Remove CDATA sections ───
  clean = clean.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')

  // ─── 5. Remove HTML comments ───
  clean = clean.replace(/<!--[\s\S]*?-->/g, '')

  // ─── 6. Fix malformed attributes (hydration safety) ───
  clean = fixMalformedAttributes(clean)

  // ─── 7. Remove event handlers ───
  clean = clean.replace(EVENT_HANDLER_WITH_SPACE, '')
  clean = clean.replace(EVENT_HANDLER_AFTER_QUOTE, '$1')

  // ─── 8. Validate URL attributes (quoted) ───
  clean = clean.replace(URL_ATTR_QUOTED, (_m, attr, q, url) => {
    return `${attr}=${q}${sanitizeUrl(url)}${q}`
  })

  // ─── 9. Validate URL attributes (unquoted) ───
  clean = clean.replace(URL_ATTR_UNQUOTED, (_m, attr, url) => {
    return `${attr}=${sanitizeUrl(url)}`
  })

  // ─── 10. Remove srcdoc attribute ───
  clean = clean.replace(/\bsrcdoc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')

  // ─── 11. Final safety net: block surviving javascript: protocols ───
  clean = clean.replace(/(?:java|vb|live|mocha)\s*script\s*:/gi, '')

  // ─── 12. Aggressive decode: any remaining scattered escapes ───
  // If 3+ `&lt;` are still present, decode once more
  const remaining = (clean.match(/&lt;/g) || []).length
  if (remaining >= 3) {
    clean = decodeEntities(clean)
    // Re-run attribute fix after decode
    clean = fixMalformedAttributes(clean)
  }

  // ─── 13. Strip raw CSS text (if content is pure CSS) ───
  const stripped = clean.replace(/<[^>]*>/g, '').trim()
  if (looksLikeRawCss(stripped)) {
    clean = clean.replace(
      /(?:@media[^{]*\{[\s\S]*?\}\s*|:root[\s\S]*?\{[\s\S]*?\}\s*|[a-z-]+\s*:\s*[^;{}]+;\s*|--[a-z0-9-]+\s*:\s*[^;]+;\s*)/gi,
      ''
    )
    clean = clean.replace(/\{\s*\}/g, '')
  }

  // ─── 14. Remove empty paragraphs (cosmetic) ───
  clean = clean.replace(/<p>\s*<\/p>/gi, '')
  clean = clean.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')

  return clean.trim()
}

// ═══════════════════════════════════════════════════════
// Plain text extractor (for search / preview)
// ═══════════════════════════════════════════════════════
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