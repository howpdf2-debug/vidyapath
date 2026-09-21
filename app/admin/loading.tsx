export default function AdminLoading() {
  return (
    <div
      // ✅ GAP 12 FIX: accessibility
      role="status"
      aria-live="polite"
      aria-label="Loading dashboard"
      className="space-y-6 animate-pulse"
    >
      <span className="sr-only">Loading…</span>

      {/* Hero */}
      <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 h-72 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-72 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* ✅ GAP 11 FIX: quick actions skeleton */}
      <div className="h-40 rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
  )
}