 
export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-64" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-48" />
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full w-32" />
      </div>

      {/* Content cards */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}