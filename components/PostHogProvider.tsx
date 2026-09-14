'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  initPostHog,
  capturePageview,
  identifyUser,
  resetUser,
  isPostHogEnabled,
} from '@/lib/posthog'

export function PostHogProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstLoad = useRef(true)

  // ===== Init PostHog once =====
  useEffect(() => {
    initPostHog().catch((err) => {
      console.warn('[PostHog] Init error:', err)
    })
  }, [])

  // ===== Track pageviews on route change =====
  useEffect(() => {
    if (!isPostHogEnabled()) return

    // Build full URL with query params
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    // Skip first load (init already handles initial page)
    // PostHog's $pageview is auto-sent on init
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      return
    }

    capturePageview(url)
  }, [pathname, searchParams])

  // ===== Track auth state changes =====
  useEffect(() => {
    if (!isPostHogEnabled()) return

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        identifyUser(session.user.id, {
          email: session.user.email,
          created_at: session.user.created_at,
        })
      }
    })

    // Listen to future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        identifyUser(session.user.id, {
          email: session.user.email,
          created_at: session.user.created_at,
        })
      } else if (event === 'SIGNED_OUT') {
        resetUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}