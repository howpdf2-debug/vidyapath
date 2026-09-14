export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Profile header */}
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-64" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-48" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-32" />
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
          </div>
        ))}
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-40" />
      </div>
    </div>
  )
}