export function ProgressBar({
  completed,
  total,
}: {
  completed: number
  total: number
}) {
  const percentage = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>Your Progress</span>
        <span className="tabular-nums font-medium">{percentage}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress ${completed} of ${total} chapters`}
        className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden"
      >
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}