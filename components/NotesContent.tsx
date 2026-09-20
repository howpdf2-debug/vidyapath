'use client'

import { useMemo } from 'react'
import { sanitizeHtml } from '@/lib/sanitize'

interface NotesContentProps {
  html: string
  className?: string
}

/**
 * Renders sanitized note HTML with proper SVG diagram support.
 * 
 * Fixes:
 * - Removes <p>/</p> tags from INSIDE SVG elements (they break rendering)
 * - Extracts SVGs before processing to prevent sanitization issues
 * - Removes stray <p> tags around block-level SVGs
 */
export function NotesContent({ html, className = '' }: NotesContentProps) {
  const cleanHtml = useMemo(() => {
    if (!html) return ''

    // 1. Sanitize full HTML
    let sanitized = sanitizeHtml(html)

    // 2. Extract SVGs to preserve them + CLEAN <p> tags inside
    const svgBlocks: string[] = []
    const MARKER = '___SVGBLOCK___'

    sanitized = sanitized.replace(/<svg\b[\s\S]*?<\/svg>/gi, (svg) => {
      // ✅ FIX: Remove <p> tags from INSIDE SVG (they break SVG rendering)
      let fixedSvg = svg
        .replace(/<p\s+[^>]*>/gi, '')   // <p style="..."> → remove
        .replace(/<p>/gi, '')            // <p> → remove
        .replace(/<\/p>/gi, '')          // </p> → remove

      // Also remove empty <o:p> (some editors add this)
      fixedSvg = fixedSvg.replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '')

      const idx = svgBlocks.length
      svgBlocks.push(fixedSvg)
      return `${MARKER}${idx}${MARKER}`
    })

    // 3. Remove stray <p> tags around block elements (outside SVG)
    const block =
      'div|ul|ol|h[1-6]|table|thead|tbody|tr|th|td|blockquote|pre|section|article|figure|figcaption|hr|li|main|header|footer|aside|nav'
    let prev = ''
    let iter = 0
    while (sanitized !== prev && iter < 10) {
      prev = sanitized
      iter++
      sanitized = sanitized
        .replace(
          new RegExp(`<p>\\s*(</?(?:${block})(?=[\\s>/]))`, 'gi'),
          '$1'
        )
        .replace(
          new RegExp(`</p>\\s*(</?(?:${block})(?=[\\s>/]))`, 'gi'),
          '$1'
        )
        .replace(
          new RegExp(`(<(?:${block})[^>]*>|</(?:${block})>)\\s*</p>`, 'gi'),
          '$1'
        )
        .replace(/<p>\s*<\/p>/gi, '')
        .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')
    }

    // 4. Restore cleaned SVGs
    svgBlocks.forEach((svg, idx) => {
      sanitized = sanitized.split(`${MARKER}${idx}${MARKER}`).join(svg)
    })

    return sanitized.trim()
  }, [html])

  return (
    <div
      className={`note-content max-w-none break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}