import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen,
  Users,
  Target,
  Sparkles,
  GraduationCap,
  Briefcase,
  Heart,
  ArrowRight,
} from 'lucide-react'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'About VidyaPath – Free Study Portal for Indian Students',
  description:
    'Learn about VidyaPath – a free platform offering NCERT solutions, state board notes, competitive exam material, and government job updates for Indian students.',
  path: '/about',
  keywords: [
    'about vidyapath',
    'free study portal',
    'indian students',
    'ncert solutions free',
    'sarkari naukri updates',
    'competitive exam preparation',
  ],
})

const features = [
  {
    icon: BookOpen,
    title: 'NCERT Solutions',
    description:
      'Class 1-12 ke saare subjects ke chapter-wise solutions, notes, aur PDF downloads — bilkul free.',
  },
  {
    icon: GraduationCap,
    title: 'State Boards',
    description:
      'UP, Bihar, MP, Rajasthan aur baaki state boards ke syllabus-aligned notes aur study material.',
  },
  {
    icon: Briefcase,
    title: 'Rojgar Samachar',
    description:
      'Weekly government job updates — Railway, SSC, Bank, State Government vacancies ki latest news.',
  },
  {
    icon: Target,
    title: 'Competitive Exams',
    description:
      'SSC, Railway, Banking, UPSC jaise exams ke liye topic-wise notes aur practice material.',
  },
  {
    icon: Users,
    title: 'Free Forever',
    description:
      'Koi subscription nahi, koi hidden charge nahi. Sab kuch free — kyunki education sabka haq hai.',
  },
  {
    icon: Sparkles,
    title: 'Always Updated',
    description:
      'Regular updates — naye chapters, latest exam patterns, aur fresh job notifications.',
  },
]

export default function AboutPage() {
  return (
    <div className="space-y-12">
      {/* ===== Hero Section ===== */}
      <section className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
          <Heart className="w-4 h-4" />
          <span>Made with ❤️ for Indian Students</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          About <span className="text-indigo-600 dark:text-indigo-400">VidyaPath</span>
        </h1>

        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          VidyaPath ek <strong>free study portal</strong> hai jo Indian students ko
          quality education material provide karta hai — NCERT solutions se lekar
          government job updates tak, sab kuch ek hi jagah.
        </p>
      </section>

      {/* ===== Mission Section ===== */}
      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-10">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex-shrink-0">
            <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
              Har Indian student ko <strong>free, high-quality study material</strong>{' '}
              milna chahiye — chahe wo kisi bhi sheher, gaon, ya school se ho.
              VidyaPath ka mission hai education ko accessible, affordable, aur
              effective banana. Hum chahte hain ki koi bhi student sirf paison ki
              kami ki wajah se peeche na rahe.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Features Grid ===== */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">
          What We Offer
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition"
              >
                <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 w-fit mb-4">
                  <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== Story Section ===== */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 p-8 md:p-10">
        <h2 className="text-2xl font-bold">Our Story</h2>
        <div className="mt-4 space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            VidyaPath ki shuruaat is simple soch se hui — <em>"Agar kisi ko
            padhna hai, to koi bhi rukavat nahi honi chahiye."</em>
          </p>
          <p>
            India me crore bachche har saal board exams dete hain, competitive
            exams ki taiyari karte hain, aur sarkari naukri ki talash me rehte
            hain. Lekin quality study material aksar mehenga hota hai, aur
            authentic job updates dhundhna mushkil.
          </p>
          <p>
            VidyaPath isi gap ko bharta hai — <strong>free NCERT solutions,
            state board notes, competitive exam material, aur weekly Rojgar
            Samachar</strong> — sab ek jagah, bina kisi shart ke.
          </p>
        </div>
      </section>

      {/* ===== What Makes Us Different ===== */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Why Students Trust VidyaPath</h2>
        <ul className="space-y-3">
          {[
            '100% free — no paywall, no subscription, no hidden charges',
            'Curriculum-aligned content — CBSE, UP Board, Bihar Board, MP Board, Rajasthan Board',
            'Real-time government job updates from verified sources',
            'Chapter-wise organized — dhundhna easy, padhna easy',
            'Mobile-friendly — kahin bhi padho, kabhi bhi padho',
            'Dark mode support — raat me aankhon pe zor nahi',
          ].map((point, i) => (
            <li
              key={i}
              className="flex items-start gap-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="mt-0.5 p-1 rounded-full bg-green-100 dark:bg-green-900/40 flex-shrink-0">
                <svg
                  className="w-3 h-3 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-300">{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="text-center bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 rounded-2xl p-8 md:p-12 text-white">
        <h2 className="text-2xl md:text-3xl font-bold">
          Ready to start learning?
        </h2>
        <p className="mt-3 text-indigo-100 max-w-xl mx-auto">
          Explore free NCERT solutions, state board notes, aur latest government
          job updates — sab kuch VidyaPath pe.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-medium hover:bg-indigo-50 transition shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            Explore NCERT
          </Link>
          <Link
            href="/rojgar-samachar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-medium hover:bg-white/20 transition"
          >
            <Briefcase className="w-4 h-4" />
            Latest Jobs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===== Contact Section ===== */}
      <section className="text-center py-6">
        <p className="text-gray-600 dark:text-gray-300">
          Koi sawaal, feedback, ya suggestion hai?{' '}
          <Link
            href="/contact"
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Contact us
          </Link>
        </p>
      </section>
    </div>
  )
}