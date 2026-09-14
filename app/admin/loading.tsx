export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Admin header */}
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-64" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-80" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-3"
          >
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
          >
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}