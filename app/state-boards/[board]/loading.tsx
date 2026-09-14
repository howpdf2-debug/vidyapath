export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Board header */}
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-72" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-96" />
      </div>

      {/* Class grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center space-y-3"
          >
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}