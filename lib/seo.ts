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