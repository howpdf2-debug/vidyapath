import Link from 'next/link'

export default function CompetitiveExamsPage() {
  const exams = [
    { name: 'SSC', slug: 'ssc', icon: '📘', color: 'from-blue-500 to-indigo-600' },
    { name: 'Railway', slug: 'railway', icon: '🚆', color: 'from-red-500 to-orange-600' },
    { name: 'Bank', slug: 'bank', icon: '🏦', color: 'from-green-500 to-teal-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">📚 Competitive Exams</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          SSC, Railway, Bank – notes and practice questions in Hindi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Link
            key={exam.slug}
            href={`/competitive-exams/${exam.slug}`}
            className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition hover:scale-[1.02] p-6"
          >
            <div className={`text-4xl bg-gradient-to-r ${exam.color} bg-clip-text text-transparent`}>
              {exam.icon}
            </div>
            <h2 className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{exam.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View subjects →</p>
          </Link>
        ))}
      </div>
    </div>
  )
}