export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="space-y-4">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  )
}