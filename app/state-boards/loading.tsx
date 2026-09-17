export default function Loading() {
  return (
    <div className="space-y-16 sm:space-y-20 pb-16 animate-pulse">
      <div className="rounded-3xl bg-slate-200 dark:bg-slate-800 h-80 sm:h-96" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 sm:-mt-16 relative z-20">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-40" />
        ))}
      </div>
    </div>
  )
}