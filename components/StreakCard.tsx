'use client'

import { Flame } from 'lucide-react'

interface StreakCardProps {
  streak: number
}

export function StreakCard({ streak }: StreakCardProps) {
  const isActive = streak > 0
  const isNew = streak === 0

  const message = isNew
    ? 'Aaj se shuru karo — streak banao 🔥'
    : streak === 1
      ? 'Shuruaat ho gayi! Kal bhi aana 🔥'
      : streak < 7
        ? 'Consistent ho! Kal bhi aana 🔥'
        : streak < 30
          ? 'Zabardast! Streak jaari rakho 🔥'
          : 'Legend! Streak toh next level hai 🏆'

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-orange-50 via-red-50 to-rose-50 dark:from-orange-950/40 dark:via-red-950/40 dark:to-rose-950/40 border-orange-200 dark:border-orange-900/40 p-4 sm:p-5">
      {/* Decorative blob */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 bg-orange-400/20 dark:bg-orange-500/15 rounded-full blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex items-center gap-4">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-lg flex-shrink-0 ${
            isActive
              ? 'bg-gradient-to-br from-orange-500 to-red-500 motion-safe:animate-pulse'
              : 'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800'
          }`}
        >
          <Flame className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
            {streak}
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1.5">
              {streak === 1 ? 'day' : 'days'}
            </span>
          </p>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1.5 font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}