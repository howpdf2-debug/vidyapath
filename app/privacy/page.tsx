import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Lock, Eye, Cookie, UserCheck, Mail } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy – VidyaPath',
  description:
    'Read VidyaPath privacy policy. We respect your data and use it only to improve your learning experience. Learn how we collect, use, and protect your information.',
  path: '/privacy',
  keywords: ['privacy policy', 'vidyapath privacy', 'data protection'],
})

const sections = [
  {
    icon: Eye,
    title: '1. Information We Collect',
    content: [
      'Account information: Naam, email address, aur password (encrypted) jab aap signup karte ho.',
      'Usage data: Kaunse pages visit kiye, kitni der ruke, kaunsa content download kiya.',
      'Device info: Browser type, IP address, operating system — for analytics.',
      'Bookmarks aur preferences jo aap save karte ho.',
    ],
  },
  {
    icon: Cookie,
    title: '2. Cookies & Tracking',
    content: [
      'Essential cookies: Login session aur preferences ke liye zaroori.',
      'Analytics cookies: PostHog ke through anonymous usage data — kaunsa content popular hai.',
      'Aap browser settings se cookies disable kar sakte ho, lekin kuch features kaam nahi karenge.',
      'Hum third-party ad networks ko personal data sell nahi karte.',
    ],
  },
  {
    icon: UserCheck,
    title: '3. How We Use Your Information',
    content: [
      'Aapka learning experience personalize karne ke liye.',
      'Content recommend karne ke liye jo aapko relevant lage.',
      'Account security aur password reset ke liye.',
      'Platform improvements aur bug fixes ke liye.',
      'Government job notifications bhejne ke liye (agar aap subscribe karo).',
    ],
  },
  {
    icon: Lock,
    title: '4. Data Security',
    content: [
      'Saara data Supabase (PostgreSQL) pe encrypted form me store hota hai.',
      'Passwords bcrypt se hash hote hain — plain text kabhi store nahi hota.',
      'HTTPS encryption har request pe — data transit me safe rehta hai.',
      'Row Level Security (RLS) enabled hai — koi unauthorized access nahi kar sakta.',
    ],
  },
  {
    icon: Shield,
    title: '5. Data Sharing',
    content: [
      'Hum aapka personal data kisi third party ko sell nahi karte.',
      'Sirf trusted services ke saath share karte hain — Supabase (database), Vercel (hosting), PostHog (analytics).',
      'Legal requirements: Agar government ya court order aaye, to comply karte hain.',
      'Aapki explicit permission ke bina kuch share nahi hota.',
    ],
  },
  {
    icon: Mail,
    title: '6. Your Rights',
    content: [
      'Access: Aap apna saara data dekh sakte ho profile page se.',
      'Correction: Galat info ko update kar sakte ho.',
      'Deletion: Account delete karne ke liye email karo — 30 din me data remove ho jayega.',
      'Portability: Apna data export karne ka request kar sakte ho.',
      'Objection: Analytics tracking ko opt-out kar sakte ho.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-medium mb-4">
          <Shield className="w-4 h-4" />
          <span>Your privacy matters</span>
        </div>

        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          VidyaPath me hum aapki privacy ko seriously lete hain. Ye policy
          batati hai ki hum kya data collect karte hain, kaise use karte hain,
          aur aapke kya rights hain.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated: <strong>11 September 2026</strong>
        </p>
      </section>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <section
              key={section.title}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      {/* Contact */}
      <section className="bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 p-6 text-center">
        <h2 className="text-lg font-bold">Questions about privacy?</h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          Email karo:{' '}
          <a
            href="mailto:privacy@vidyapath.in"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            privacy@vidyapath.in
          </a>
        </p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Related:{' '}
          <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Terms
          </Link>
          {' · '}
          <Link href="/dmca" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            DMCA
          </Link>
        </p>
      </section>
    </div>
  )
}