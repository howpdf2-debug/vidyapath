'use client'

import { useEffect } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'

export function LanguageHtmlSync() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'hi'
    document.documentElement.lang = lang
  }, [searchParams, pathname])

  return null
}