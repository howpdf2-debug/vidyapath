export function ProgressTracker({ completed, total }: { completed: number; total: number }) {
  const percentage = total ? Math.round((completed / total) * 100) : 0
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }} />
    </div>
  )
}