import type { Metadata } from 'next'
import Link from 'next/link'
import { Trophy, Calendar, ExternalLink, Bell } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Exam Results 2026 – Latest Board & Competitive Exam Updates | VidyaPath',
  description:
    'Latest exam results for UP Board, Bihar Board, MP Board, Rajasthan Board, CBSE, and competitive exams. Real-time updates and direct result links.',
  path: '/results',
  keywords: [
    'exam results 2026',
    'board results',
    'sarkari result',
    '10th 12th result',
    'up board result',
    'bihar board result',
    'cbse result',
  ],
})

const boards = [
  { name: 'CBSE', class: '10th & 12th', url: 'https://results.cbse.nic.in', status: 'available' },
  { name: 'UP Board', class: '10th & 12th', url: 'https://upresults.nic.in', status: 'available' },
  { name: 'Bihar Board', class: '10th & 12th', url: 'https://biharboardonline.bihar.gov.in', status: 'available' },
  { name: 'MP Board', class: '10th & 12th', url: 'https://mpbse.nic.in', status: 'available' },
  { name: 'Rajasthan Board', class: '10th & 12th', url: 'https://rajresults.nic.in', status: 'available' },
  { name: 'Maharashtra Board', class: '10th & 12th', url: 'https://mahresult.nic.in', status: 'available' },
]

export default function ResultsPage() {
  return (
    <div className="space-y-8">
      <section className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-sm font-medium mb-4">
          <Trophy className="w-4 h-4" />
          <span>Live exam results 2026</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold">
          Exam <span className="text-indigo-600 dark:text-indigo-400">Results</span>
        </h1>

        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Latest board results, competitive exam results, aur updates — sab ek
          jagah. Direct official links ke saath.
        </p>
      </section>

      {/* Board Results Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Board Results 2026</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <a
              key={board.name}
              href={board.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                  <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              </div>

              <h3 className="text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                {board.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {board.class}
              </p>

              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                Check Result <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold">Coming Soon</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          NEET, JEE, UPSC, SSC, Railway, aur banking exam results ke direct
          links jald hi add honge. Bookmark karke rakho.
        </p>
        <Link
          href="/rojgar-samachar"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
        >
          <Calendar className="w-4 h-4" />
          Rojgar Samachar Dekho
        </Link>
      </section>

      {/* Disclaimer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
        <strong>Note:</strong> Ye page official result links provide karta hai.
        Hum koi result data store ya cache nahi karte. Verification ke liye
        always official website check karo.
      </div>
    </div>
  )
}