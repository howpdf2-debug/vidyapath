import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, UserX } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions – VidyaPath',
  description:
    'Terms and conditions for using VidyaPath – free educational content portal for Indian students. Read rules, user responsibilities, and limitations.',
  path: '/terms',
  keywords: ['terms and conditions', 'vidyapath terms', 'user agreement'],
})

const sections = [
  {
    icon: CheckCircle,
    title: '1. Acceptance of Terms',
    content: [
      'VidyaPath use karne se aap in terms se agree karte ho.',
      'Agar aap agree nahi karte, to please platform use na karein.',
      'Hum kabhi bhi terms update kar sakte hain — continued use = acceptance.',
    ],
  },
  {
    icon: FileText,
    title: '2. Services Provided',
    content: [
      'NCERT solutions Class 1-12 ke liye — free of cost.',
      'State board notes aur study material.',
      'Competitive exam preparation content.',
      'Weekly Rojgar Samachar updates.',
      'Sab services "as-is" basis pe provided hain.',
    ],
  },
  {
    icon: XCircle,
    title: '3. Prohibited Activities',
    content: [
      'Content ko reproduce karna ya commercial use ke liye sell karna.',
      'Automated scraping, bots, ya crawlers.',
      'Platform ko hack karne ya disrupt karne ki koshish.',
      'Doosre users ke accounts access karna.',
      'Illegal ya harmful content upload karna.',
    ],
  },
  {
    icon: Scale,
    title: '4. Intellectual Property',
    content: [
      'NCERT content: Original NCERT books ka copyright NCERT ke paas hai.',
      'Hum sirf educational purpose ke liye solutions aur notes provide karte hain.',
      'VidyaPath branding, logo, aur code humara intellectual property hai.',
      'Fair use policy ke under educational content allowed hai.',
    ],
  },
  {
    icon: AlertTriangle,
    title: '5. Disclaimer',
    content: [
      'Hum content ki 100% accuracy guarantee nahi karte.',
      'Exam results ya job selection ki koi guarantee nahi.',
      'Third-party links pe hum responsible nahi hain.',
      'Technical issues ya downtime ke liye liable nahi.',
      'Use at your own risk.',
    ],
  },
  {
    icon: UserX,
    title: '6. Termination',
    content: [
      'Hum kabhi bhi account suspend ya delete kar sakte hain.',
      'Violation of terms = immediate termination.',
      'Aap bhi apna account delete kar sakte ho.',
      'Termination ke baad bhi ye terms applicable rehte hain.',
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
          <FileText className="w-4 h-4" />
          <span>Please read carefully</span>
        </div>

        <h1 className="text-4xl font-bold">Terms & Conditions</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Ye terms VidyaPath platform use karne ke rules hain. Platform use
          karne se pehle please inhe dhyan se padh lo.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated: <strong>11 September 2026</strong>
        </p>
      </section>

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <section
              key={section.title}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <section className="bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 p-6 text-center">
        <h2 className="text-lg font-bold">Questions about terms?</h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          Email karo:{' '}
          <a
            href="mailto:legal@vidyapath.in"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            legal@vidyapath.in
          </a>
        </p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Related:{' '}
          <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Privacy
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