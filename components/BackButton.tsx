'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  /** Fallback route if no browser history */
  href?: string
  /** Button label */
  label?: string
  /** Show or hide the label text */
  showLabel?: boolean
  /** Additional CSS classes */
  className?: string
}

export function BackButton({
  href = '/',
  label = 'Back',
  showLabel = true,
  className = '',
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (typeof window === 'undefined') {
      router.push(href)
      return
    }

    // Check if user came from within our app
    const referrer = document.referrer
    const isSameOrigin =
      referrer && referrer.startsWith(window.location.origin)

    if (isSameOrigin && window.history.length > 1) {
      router.back()
    } else {
      router.push(href)
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      className={`group inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition ${className}`}
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      {showLabel && <span>{label}</span>}
    </button>
  )
}