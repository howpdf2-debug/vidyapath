import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Mail,
  Clock,
  MessageSquare,
  HelpCircle,
  Send,
  AlertCircle,
  Bug,
  Lightbulb,
} from 'lucide-react'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us – VidyaPath',
  description:
    'Get in touch with the VidyaPath team for feedback, queries, content removal requests, or partnership opportunities. We respond within 24-48 hours.',
  path: '/contact',
  keywords: [
    'contact vidyapath',
    'vidyapath support',
    'feedback',
    'dmca request',
    'study portal contact',
  ],
})

const contactReasons = [
  {
    icon: MessageSquare,
    title: 'General Queries',
    description: 'Platform, content, ya features ke baare me koi sawaal ho to batao.',
    email: 'support@vidyapath.in',
    color: 'indigo',
  },
  {
    icon: Bug,
    title: 'Report a Bug',
    description: 'Koi page kaam nahi kar raha? Broken link ya error mila? Batao.',
    email: 'bugs@vidyapath.in',
    color: 'red',
  },
  {
    icon: Lightbulb,
    title: 'Suggestions',
    description: 'Naya feature ya improvement ka idea hai? Hum sunna chahte hain.',
    email: 'feedback@vidyapath.in',
    color: 'yellow',
  },
  {
    icon: AlertCircle,
    title: 'DMCA / Copyright',
    description: 'Copyright issue ya content removal request ke liye.',
    email: 'dmca@vidyapath.in',
    color: 'orange',
  },
]

const faqs = [
  {
    q: 'VidyaPath free hai?',
    a: 'Haan! VidyaPath 100% free hai. Koi subscription, paywall, ya hidden charges nahi hain. Sab content openly available hai.',
  },
  {
    q: 'Kitne time me reply milta hai?',
    a: 'Usually 24-48 hours ke andar. Urgent issues (DMCA, security) priority pe handle hote hain.',
  },
  {
    q: 'Naya content kab add hota hai?',
    a: 'NCERT aur notes weekly update hote hain. Rojgar Samachar roz subah 6 baje auto-update hota hai.',
  },
  {
    q: 'Koi content remove karwana hai?',
    a: 'DMCA email pe bhejo — 24 hours ke andar action liya jayega.',
  },
  {
    q: 'Kya main contribute kar sakta hoon?',
    a: 'Bilkul! Notes, questions, ya translations contribute kar sakte ho. "Suggestions" wale email pe likho.',
  },
]

const colorMap: Record<string, string> = {
  indigo:
    'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  red: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  yellow:
    'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400',
  orange:
    'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
}

export default function ContactPage() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* ===== Hero ===== */}
      <section className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
          <Mail className="w-4 h-4" />
          <span>We'd love to hear from you</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Get in <span className="text-indigo-600 dark:text-indigo-400">Touch</span>
        </h1>

        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Koi sawaal, feedback, ya suggestion? Humein message bhejo — hum
          jaldi reply karte hain.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>Average response time: 24-48 hours</span>
        </div>
      </section>

      {/* ===== Contact Reasons Grid ===== */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-6">
          How Can We Help?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contactReasons.map((reason) => {
            const Icon = reason.icon
            return (
              <a
                key={reason.title}
                href={`mailto:${reason.email}`}
                className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${colorMap[reason.color]}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {reason.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {reason.description}
                    </p>
                    <p className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                      {reason.email}
                    </p>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      {/* ===== Contact Form (UI only) ===== */}
      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex-shrink-0">
            <Send className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Send Us a Message</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Fill the form below — hum 24-48 hours me reply karenge.
            </p>
          </div>
        </div>

        <form
          className="space-y-4"
          action="mailto:support@vidyapath.in"
          method="post"
          encType="text/plain"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
              >
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Rahul Kumar"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="What is this about?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Write your message here..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30"
          >
            <Send className="w-4 h-4" />
            Send Message
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <strong>Note:</strong> Ye form aapke default email client ko
            open karega. Direct email ke liye{' '}
            <a
              href="mailto:support@vidyapath.in"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              support@vidyapath.in
            </a>{' '}
            use karo.
          </p>
        </form>
      </section>

      {/* ===== FAQ Section ===== */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
            <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <summary className="cursor-pointer p-5 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/80 transition flex items-center justify-between gap-4 list-none">
                <span>{faq.q}</span>
                <svg
                  className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ===== Direct Contact ===== */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 p-8 text-center">
        <h2 className="text-xl font-bold">Prefer direct email?</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Humein directly email karo:
        </p>
        <a
          href="mailto:support@vidyapath.in"
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-indigo-600 dark:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-sm"
        >
          <Mail className="w-4 h-4" />
          support@vidyapath.in
        </a>
      </section>

      {/* ===== Related Links ===== */}
      <section className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aur bhi jaanna hai?{' '}
          <Link href="/about" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            About Us
          </Link>
          {' · '}
          <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Privacy
          </Link>
          {' · '}
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