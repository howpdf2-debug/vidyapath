'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // ✅ 'hi' ya 'en' — short codes
  const currentLang = searchParams.get('lang') === 'hi' ? 'hi' : 'en'

  const switchTo = (lang: 'hi' | 'en') => {
    if (lang === currentLang) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('lang', lang)
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-1">
      <Globe className="w-4 h-4 text-gray-400 ml-2" />
      <button
        onClick={() => switchTo('en')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition ${
          currentLang === 'en'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        English
      </button>
      <button
        onClick={() => switchTo('hi')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition ${
          currentLang === 'hi'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        हिंदी
      </button>
    </div>
  )
}