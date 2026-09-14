import Link from 'next/link'

export function DifficultyFilter({ currentLevel }: { currentLevel: string }) {
  const levels = ['all', 'easy', 'medium', 'hard']
  return (
    <div className="flex gap-2 flex-wrap">
      {levels.map((level) => (
        <Link
          key={level}
          href={`?level=${level}`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            currentLevel === level
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
        </Link>
      ))}
    </div>
  )
}