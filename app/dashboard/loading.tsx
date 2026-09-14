export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome header */}
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-72" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-96" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-3"
          >
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Recent activity list */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}