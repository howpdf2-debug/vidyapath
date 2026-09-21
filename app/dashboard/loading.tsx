export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading dashboard"
      className="space-y-8 animate-pulse"
    >
      <span className="sr-only">Loading dashboard…</span>

      <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />

      <div>
        <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />

      <div>
        <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-800 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  )
}