

import './globals.css'
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VidyaPath — Free NCERT, CBSE, Sarkari Naukri | India ka Study Portal',
  description: 'NCERT Solutions, CBSE Papers, State Boards, Sarkari Naukri — sab free, Hindi + English.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi">
      <head>
        {/* Google Search Console verification meta tag */}
        <meta name="google-site-verification" content="115l3tNyRiX3r1IlsP732O7joUZQ2Ia4fWxtF-SW21o" />

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TQSV7ZEW3T"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TQSV7ZEW3T');
          `}
        </Script>
      </head>
      <body className={dmSans.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}