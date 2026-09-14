export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-56" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-72" />
      </div>

      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex gap-4"
          >
            <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}