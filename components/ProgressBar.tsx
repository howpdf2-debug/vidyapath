export function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const percentage = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Your Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}