import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Hind } from 'next/font/google'
import { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AdSidebar } from '@/components/AdSidebar'
import { AdBanner } from '@/components/AdBanner'
import { BackToTop } from '@/components/BackToTop'
import { ToastProvider } from '@/components/ToastProvider'
import { NprogressProvider } from '@/components/NprogressProvider'
import { PostHogProvider } from '@/components/PostHogProvider'

// ==================== FONTS ====================
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const hind = Hind({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

// ==================== VIEWPORT ====================
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4f46e5' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

// ==================== METADATA ====================
export const metadata: Metadata = {
  metadataBase: new URL('https://vidyapath.in'),
  title: {
    default:
      'VidyaPath – Free NCERT Solutions, Notes & Govt Jobs for Indian Students',
    template: '%s | VidyaPath',
  },
  description:
    'Free NCERT books, solutions, state boards (UP, Bihar, MP, Rajasthan), exam results, competitive exam notes (SSC, Railway, Bank) and Rojgar Samachar – all in one place.',
  keywords: [
    'NCERT', 'NCERT Solutions', 'State Boards', 'UP Board', 'Bihar Board',
    'MP Board', 'Rajasthan Board', 'Exam Results', 'Sarkari Naukri',
    'Competitive Exams', 'SSC', 'Railway', 'Bank', 'Free Study Material',
    'Indian Students',
  ],
  authors: [{ name: 'VidyaPath Team' }],
  creator: 'VidyaPath',
  publisher: 'VidyaPath',
  robots: {
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
    title: 'VidyaPath – Free Study Portal for Indian Students',
    description:
      'NCERT, State Boards, Results, Competitive Exams, Rojgar Samachar – all free.',
    url: 'https://vidyapath.in',
    siteName: 'VidyaPath',
    images: [
      {
        url: 'https://vidyapath.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VidyaPath – Free Study Portal',
      },
    ],
    locale: 'hi_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VidyaPath – Free Study Portal',
    description:
      'NCERT, State Boards, Results, Competitive Exams, Rojgar Samachar – all free.',
    images: ['https://vidyapath.in/og-image.png'],
  },
  alternates: {
    canonical: 'https://vidyapath.in',
    languages: {
      en: 'https://vidyapath.in',
      hi: 'https://vidyapath.in',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.json',
}

// ==================== JSON-LD SCHEMA ====================
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      url: 'https://vidyapath.in',
      name: 'VidyaPath',
      description: 'Free study portal for Indian students.',
    },
    {
      '@type': 'Organization',
      name: 'VidyaPath',
      url: 'https://vidyapath.in',
      logo: 'https://vidyapath.in/icon-512.png',
      sameAs: [
        'https://youtube.com/@vidyapath',
        'https://twitter.com/vidyapath',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@vidyapath.in',
        contactType: 'customer support',
      },
    },
  ],
}

// ==================== ROOT LAYOUT ====================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="hi"
      className={`${inter.variable} ${hind.variable}`}
      suppressHydrationWarning
    >
      <body className="text-gray-900 dark:text-gray-100 min-h-[100dvh]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ToastProvider />

          <Suspense fallback={null}>
            <NprogressProvider />
          </Suspense>

          <Suspense fallback={null}>
            <PostHogProvider />
          </Suspense>

          <div className="min-h-screen flex flex-col">
            <Suspense
              fallback={
                <div className="h-14 sm:h-16 border-b border-gray-200 dark:border-gray-800" />
              }
            >
              <Header />
            </Suspense>

            <div className="flex-grow">
              <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <main className="flex-1 min-w-0">{children}</main>
                  <div className="hidden lg:block lg:w-64 flex-shrink-0">
                    <AdSidebar position="right" />
                  </div>
                </div>
              </div>
            </div>

            <Footer />
            <AdBanner />
            <BackToTop />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}