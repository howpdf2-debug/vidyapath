'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import nProgress from 'nprogress'
import 'nprogress/nprogress.css'

nProgress.configure({
  minimum: 0.2,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
})

export function NprogressProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    nProgress.start()
    const timer = setTimeout(() => nProgress.done(), 500)
    return () => {
      clearTimeout(timer)
      nProgress.done()
    }
  }, [pathname, searchParams])

  return null
}