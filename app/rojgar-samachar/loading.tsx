 
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-72" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-56" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-40" />
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full w-40" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full w-20" />
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full w-28" />
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full w-28" />
        </div>
        <div className="flex-1 max-w-md ml-auto">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
        </div>
      </div>

      {/* News list */}
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-28 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full"
          />
        ))}
      </div>
    </div>
  )
}