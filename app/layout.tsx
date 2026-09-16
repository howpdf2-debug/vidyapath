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
import { LanguageHtmlSync } from '@/components/LanguageHtmlSync'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const hind = Hind({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://vidyapath.in'),
  title: {
    default: 'VidyaPath — Free NCERT Notes & Study Material',
    template: '%s | VidyaPath',
  },
  description:
    'Free multilingual study material for Class 6–12 and competitive exams. NCERT chapters, notes, videos and PDFs in Hindi and English.',
  applicationName: 'VidyaPath',
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
    type: 'website',
    siteName: 'VidyaPath',
    title: 'VidyaPath — Free Study Material for Every Student',
    description:
      'Free NCERT chapters, notes, videos and PDFs for Class 6–12 and competitive exams.',
    url: 'https://vidyapath.in',
    images: [
      {
        url: 'https://vidyapath.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VidyaPath — Free Study Portal',
      },
    ],
    locale: 'hi_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VidyaPath — Free Study Material',
    description:
      'Free NCERT chapters, notes, videos and PDFs in Hindi and English.',
    images: ['https://vidyapath.in/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.json',
}

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
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@vidyapath.in',
        contactType: 'customer support',
      },
    },
  ],
}

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
      <body className="min-h-[100dvh]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Suspense fallback={null}>
          <LanguageHtmlSync />
        </Suspense>

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
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <main className="flex-1 min-w-0">{children}</main>
                  <div className="hidden md:block md:w-64 flex-shrink-0">
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