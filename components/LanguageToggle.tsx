'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'

export function LanguageToggle() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const currentLang = searchParams.get('lang') === 'hi' ? 'hi' : 'en'

  const setLang = (newLang: 'en' | 'hi') => {
    const params = new URLSearchParams(searchParams.toString())
    if (newLang === 'en') {
      params.delete('lang')
    } else {
      params.set('lang', newLang)
    }
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
  }

  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
      <button
        onClick={() => setLang('en')}
        aria-label="Switch to English"
        aria-pressed={currentLang === 'en'}
        className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition ${
          currentLang === 'en'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-white/80 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('hi')}
        aria-label="हिंदी में बदलें"
        aria-pressed={currentLang === 'hi'}
        className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition ${
          currentLang === 'hi'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-white/80 hover:text-white'
        }`}
      >
        हिं
      </button>
    </div>
  )
}