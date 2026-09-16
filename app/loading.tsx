export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-3xl bg-slate-200 dark:bg-slate-800 h-[280px]" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-24" />
        ))}
      </div>

      {/* Section header */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-48" />
        ))}
      </div>
    </div>
  )
}