import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Mail, FileWarning, Clock, CheckCircle } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'DMCA & Copyright Policy – VidyaPath',
  description:
    'VidyaPath DMCA policy. Report copyright infringement. We comply with DMCA takedown notices and act within 24 hours.',
  path: '/dmca',
  keywords: ['dmca', 'copyright policy', 'content removal', 'takedown notice'],
})

const reportSteps = [
  'Aapki physical ya electronic signature.',
  'Copyrighted work ki description jo infringed hui hai.',
  'Infringing content ka URL (VidyaPath pe exact link).',
  'Aapka contact info — naam, address, phone, email.',
  'Statement ki aap good-faith me believe karte ho ki use unauthorized hai.',
  'Statement ki information accurate hai aur aap copyright owner ya authorized agent ho.',
]

const responseSteps = [
  { day: '0 hours', action: 'Aapka email received — acknowledgment sent.' },
  { day: '24 hours', action: 'Content reviewed aur verified.' },
  { day: '48 hours', action: 'Valid claims pe content removed.' },
  { day: '72 hours', action: 'Confirmation email with action taken.' },
]

export default function DMCAPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-sm font-medium mb-4">
          <FileWarning className="w-4 h-4" />
          <span>Copyright compliance</span>
        </div>

        <h1 className="text-4xl font-bold">DMCA & Copyright Policy</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          VidyaPath Digital Millennium Copyright Act (DMCA) ka full compliance
          karta hai. Agar aapko lagta hai ki aapka copyrighted content humari
          site pe unauthorized hai, to humein batao — hum 24-48 hours me action
          lenge.
        </p>
      </section>

      {/* Takedown Request */}
      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold">File a DMCA Takedown Notice</h2>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Aapka DMCA notice me ye information honi chahiye:
        </p>

        <ol className="space-y-3 mb-6">
          {reportSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-gray-700 dark:text-gray-300">{step}</span>
            </li>
          ))}
        </ol>

        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-900/40 p-4">
          <p className="text-sm text-orange-900 dark:text-orange-300">
            <strong>Send to:</strong>{' '}
            <a
              href="mailto:dmca@vidyapath.in"
              className="text-orange-700 dark:text-orange-400 hover:underline font-medium"
            >
              dmca@vidyapath.in
            </a>
          </p>
          <p className="text-xs text-orange-800 dark:text-orange-400 mt-2">
            Subject line: <strong>"DMCA Takedown Request – [Content URL]"</strong>
          </p>
        </div>
      </section>

      {/* Response Timeline */}
      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/40">
            <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold">Our Response Timeline</h2>
        </div>

        <div className="space-y-4">
          {responseSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-24 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {step.day}
                </div>
              </div>
              <div className="flex-1 pb-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                <p className="text-gray-700 dark:text-gray-300">{step.action}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Counter Notice */}
      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold">Counter-Notice</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          Agar aapka content galat taur pe remove ho gaya hai, to aap
          counter-notice file kar sakte ho. Isme ye include karo:
        </p>
        <ul className="mt-3 space-y-2 text-gray-700 dark:text-gray-300">
          <li>• Aapka contact info</li>
          <li>• Removed content ka description aur URL</li>
          <li>• Statement ki content galat taur pe remove hua tha</li>
          <li>• Consent to jurisdiction</li>
          <li>• Physical signature</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Counter-notice bhi{' '}
          <a
            href="mailto:dmca@vidyapath.in"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            dmca@vidyapath.in
          </a>{' '}
          pe bhejo.
        </p>
      </section>

      {/* Contact */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/40 rounded-2xl border border-orange-100 dark:border-orange-900/40 p-6 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h2 className="text-lg font-bold">DMCA Contact</h2>
        </div>
        <a
          href="mailto:dmca@vidyapath.in"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-orange-600 dark:text-orange-400 hover:border-orange-300 dark:hover:border-orange-700 transition"
        >
          dmca@vidyapath.in
        </a>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Response time: <strong>24-48 hours</strong>
        </p>
      </section>

      {/* Related */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Related:{' '}
        <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Privacy
        </Link>
        {' · '}
        <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Terms
        </Link>
        {' · '}
        <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Contact
        </Link>
      </div>
    </div>
  )
}