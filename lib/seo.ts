import type { Metadata } from 'next'

export const SITE_URL = 'https://vidyapath.in'
export const SITE_NAME = 'VidyaPath'

/**
 * Build a metadata object with sensible defaults.
 * Call from static pages: export const metadata = buildMetadata({...})
 */
export function buildMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  ogImage = '/og-image.png',
  noIndex = false,
}: {
  title: string
  description: string
  path?: string
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
}): Metadata {
  const url = `${SITE_URL}${path}`
  const image = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`

  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

// ═══════════════════════════════════════════════════════
// P3.8: FAQPage JSON-LD builder
// ═══════════════════════════════════════════════════════

function htmlToPlainTextFaq(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export interface FaqForSchema {
  id?: number | string
  lang?: 'en' | 'hi'
  question: string
  answer: string
}

/**
 * Build FAQPage schema node from a list of FAQs.
 * Returns null if list is empty (caller should skip node).
 * - Strips HTML to plain text (Google needs text)
 * - Trims to 500 chars per answer (Google recommendation)
 * - Limits to 15 questions (avoid schema bloat)
 */
export function buildFaqPageSchema(
  faqs: FaqForSchema[]
): Record<string, unknown> | null {
  if (!faqs || faqs.length === 0) return null

  return {
    '@type': 'FAQPage',
    mainEntity: faqs.slice(0, 15).map((f) => ({
      '@type': 'Question',
      name: htmlToPlainTextFaq(f.question).slice(0, 300),
      acceptedAnswer: {
        '@type': 'Answer',
        text: htmlToPlainTextFaq(f.answer).slice(0, 500),
      },
    })),
  }
}