'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href?: string
  label?: string
  showLabel?: boolean
  className?: string
  language?: 'en' | 'hi'
}

const LABEL_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  'Back': { en: 'Back', hi: 'वापस' },
  'Back to chapters': { en: 'Back to chapters', hi: 'अध्यायों पर वापस' },
  'Back to Class': { en: 'Back to Class', hi: 'कक्षा पर वापस' },
  'Back to NCERT': { en: 'Back to NCERT', hi: 'NCERT पर वापस' },
  'Back to Home': { en: 'Back to Home', hi: 'होम पर वापस' },
}

export function BackButton({
  href = '/',
  label = 'Back',
  showLabel = true,
  className = '',
  language = 'en',
}: BackButtonProps) {
  const router = useRouter()

  const translatedLabel = LABEL_TRANSLATIONS[label]?.[language] || label

  const handleClick = () => {
    if (typeof window === 'undefined') {
      router.push(href)
      return
    }

    const hasInternalHistory =
      window.history.length > 1 &&
      (window.history.state?.idx > 0 ||
        document.referrer.includes(window.location.origin))

    if (hasInternalHistory) {
      router.back()
    } else {
      router.push(href)
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={translatedLabel}
      title={translatedLabel}
      className={`group inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition ${className}`}
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      {showLabel && <span>{translatedLabel}</span>}
    </button>
  )
}