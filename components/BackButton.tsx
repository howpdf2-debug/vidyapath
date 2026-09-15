'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  /** Fallback route if no browser history */
  href?: string
  /** Button label (auto-translates for Hindi if language='hi') */
  label?: string
  /** Show or hide the label text */
  showLabel?: boolean
  /** Additional CSS classes */
  className?: string
  /** Language for auto-translation: 'en' | 'hi' */
  language?: 'en' | 'hi'
}

// ⚠️ Auto-translate common labels
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

  // ⚠️ Auto-translate label based on language
  const translatedLabel =
    LABEL_TRANSLATIONS[label]?.[language] || label

  const handleClick = () => {
    if (typeof window === 'undefined') {
      router.push(href)
      return
    }

    // ⚠️ Better check: only use router.back() if we have internal history
    // window.history.state gives us Next.js internal state
    const hasInternalHistory =
      window.history.length > 1 &&
      (window.history.state?.idx > 0 || document.referrer.includes(window.location.origin))

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