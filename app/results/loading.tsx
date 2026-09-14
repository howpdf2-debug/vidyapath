export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-64" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-96" />
      </div>

      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center gap-4"
          >
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}