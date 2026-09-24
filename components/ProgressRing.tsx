'use client'

import { useEffect, useState } from 'react'

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function ProgressRing({
  percentage,
  size = 180,
  strokeWidth = 14,
  label,
}: ProgressRingProps) {
  const [animatedPct, setAnimatedPct] = useState(0)

  // ✅ Animate on mount: start at 0, transition to target
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnimatedPct(Math.max(0, Math.min(100, percentage)))
    }, 100)
    return () => window.clearTimeout(timer)
  }, [percentage])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedPct / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-indigo-500 dark:stroke-indigo-400 transition-[stroke-dashoffset] duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.35))',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
          {Math.round(animatedPct)}%
        </span>
        {label && (
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}