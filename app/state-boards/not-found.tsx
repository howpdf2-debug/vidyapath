import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4" lang="hi">
      <div className="text-center max-w-md">
        <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 items-center justify-center mb-6 shadow-2xl">
          <SearchX className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">
          पृष्ठ नहीं मिला
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          आप जिस बोर्ड, कक्षा या अध्याय की तलाश कर रहे हैं वह उपलब्ध नहीं है।
        </p>
        <Link
          href="/state-boards"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold hover:shadow-2xl transition hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          राज्य बोर्ड देखें
        </Link>
      </div>
    </div>
  )
}