'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// ─────────────────────────────────────────────────────────────
// P2: posthog-js is ~104KB. Never let it block first paint.
// Strategy:
//   1. No top-level `import 'posthog-js'` — dynamic import only.
//   2. Load after first user interaction OR 3s idle.
//   3. Disable autocapture + session recording (big perf win).
//   4. Only in production.
// ─────────────────────────────────────────────────────────────

type PostHogClient = typeof import('posthog-js').default

let phSingleton: PostHogClient | null = null
let phLoading: Promise<PostHogClient | null> | null = null

async function loadPostHog(): Promise<PostHogClient | null> {
  if (phSingleton) return phSingleton
  if (phLoading) return phLoading

  phLoading = (async () => {
    if (process.env.NODE_ENV !== 'production') return null

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return null

    try {
      const mod = await import('posthog-js')
      const posthog = mod.default

      posthog.init(key, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
        capture_pageview: false, // we fire manually on route change
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        autocapture: false, // opt-in only
        disable_session_recording: true, // flip if you use replays
      })

      phSingleton = posthog
      return posthog
    } catch {
      return null
    }
  })()

  return phLoading
}

export function PostHogProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const triggered = useRef(false)

  // Deferred load trigger
  useEffect(() => {
    if (triggered.current) return
    triggered.current = true

    let fired = false
    const trigger = () => {
      if (fired) return
      fired = true
      void loadPostHog()
    }

    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'keydown',
      'scroll',
      'touchstart',
    ]
    events.forEach((e) =>
      window.addEventListener(e, trigger, { once: true, passive: true }),
    )
    const timer = window.setTimeout(trigger, 3000)

    return () => {
      events.forEach((e) => window.removeEventListener(e, trigger))
      window.clearTimeout(timer)
    }
  }, [])

  // Manual pageview on route change (only after PostHog ready)
  useEffect(() => {
    if (!phSingleton) return
    const qs = searchParams.toString()
    const url = pathname + (qs ? `?${qs}` : '')
    phSingleton.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

export default PostHogProvider