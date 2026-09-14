'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true'

export function AdBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const closed = localStorage.getItem('adBannerClosed')
    if (closed === 'true') setIsVisible(false)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('adBannerClosed', 'true')
  }

  if (!ADS_ENABLED || !mounted || !isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 p-3 shadow-lg">
        <div className="flex items-center justify-between gap-3 max-w-screen-xl mx-auto">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">📢 Support VidyaPath</p>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Learn more about our mission</p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}