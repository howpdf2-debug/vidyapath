import Link from 'next/link'
import { LayoutDashboard, Search, ArrowLeft } from 'lucide-react'

export default function AdminNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="surface-card p-8 max-w-md w-full text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 items-center justify-center mb-4">
          <Search className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <p className="text-5xl font-black text-slate-300 dark:text-slate-700 mb-2">
          404
        </p>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Page नहीं मिला
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          यह admin page exist नहीं करता या हटा दिया गया है।
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/admin"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/admin/notes"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Notes
          </Link>
        </div>
      </div>
    </div>
  )
}