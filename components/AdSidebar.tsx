'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true'

export function AdSidebar({
  position = 'right',
}: {
  position?: 'right' | 'left'
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    const closed = localStorage.getItem('adSidebarClosed')
    if (closed === 'true') setIsVisible(false)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('adSidebarClosed', 'true')
  }

  // Ads globally disabled → no space reserved at all
  if (!ADS_ENABLED) return null

  // ✅ P2 FIX: server + first client render = placeholder with SAME dimensions
  // as the real card. Prevents xl-column CLS on hydration.
  if (!hydrated) {
    return (
      <div
        className={`sticky top-24 ${
          position === 'left' ? 'mr-4' : 'ml-4'
        } w-64 flex-shrink-0 hidden lg:block`}
        aria-hidden="true"
      >
        <div className="min-h-[320px]" />
      </div>
    )
  }

  // User closed it — collapse space (their explicit choice)
  if (!isVisible) return null

  return (
    <div
      className={`sticky top-24 ${
        position === 'left' ? 'mr-4' : 'ml-4'
      } w-64 flex-shrink-0 hidden lg:block`}
    >
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg min-h-[320px]">
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Close sponsored sidebar"
        >
          <X className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
        </button>
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Sponsored
          </p>
          <div className="bg-gradient-to-br from-indigo-50 to-orange-50 dark:from-indigo-950/30 dark:to-orange-950/30 rounded-xl p-4 min-h-[200px] flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">📢 Ad Space</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Your ad here
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Help us keep VidyaPath free
          </p>
        </div>
      </div>
    </div>
  )
}