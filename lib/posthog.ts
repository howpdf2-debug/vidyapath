// ==================== LAZY LOAD POSTHOG ====================
// posthog-js page load block nahi karega — sirf tab load hoga jab zaroorat padegi
// Ye 299 KB bundle size reduce karta hai

let posthog: any = null
let posthogLoading: Promise<any> | null = null

async function getPostHog(): Promise<any> {
  if (posthog) return posthog
  if (posthogLoading) return posthogLoading

  posthogLoading = import('posthog-js')
    .then((mod) => {
      posthog = mod.default
      return posthog
    })
    .catch((err) => {
      console.warn('[PostHog] Failed to lazy load:', err)
      posthogLoading = null
      return null
    })

  return posthogLoading
}

// ==================== CONFIG ====================
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

const IS_DEV = process.env.NODE_ENV === 'development'

// ==================== HELPERS ====================

/**
 * Check if PostHog is configured.
 * Returns false if key missing — caller can skip tracking silently.
 */
export const isPostHogEnabled = (): boolean => {
  return typeof POSTHOG_KEY === 'string' && POSTHOG_KEY.length > 0
}

/**
 * Initialize PostHog client-side only.
 * Lazy loads posthog-js module — no bundle impact on page load.
 */
export const initPostHog = async (): Promise<void> => {
  if (typeof window === 'undefined') return

  if (!isPostHogEnabled()) {
    if (IS_DEV) {
      console.log(
        '[PostHog] ⏭️ Skipped — NEXT_PUBLIC_POSTHOG_KEY not set in .env.local'
      )
    }
    return
  }

  const ph = await getPostHog()
  if (!ph) return

  // Already initialized?
  if (ph.__loaded) {
    if (IS_DEV) console.log('[PostHog] ✅ Already initialized')
    return
  }

  try {
    ph.init(POSTHOG_KEY!, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // Manual — we track via provider
      capture_pageleave: true,
      autocapture: true, // Auto-track clicks, form submits
      persistence: 'localStorage+cookie',
      loaded: (p: any) => {
        if (IS_DEV) {
          p.debug()
          console.log('[PostHog] ✅ Initialized successfully')
          console.log('[PostHog] Host:', POSTHOG_HOST)
        }
      },
    })
  } catch (err) {
    console.warn('[PostHog] ❌ Init failed:', err)
  }
}

/**
 * Manually capture a pageview.
 * Called from PostHogProvider on route change.
 */
export const capturePageview = async (url: string): Promise<void> => {
  if (typeof window === 'undefined') return
  if (!isPostHogEnabled()) return

  const ph = await getPostHog()
  if (!ph || !ph.__loaded) return

  try {
    ph.capture('$pageview', { $current_url: url })
    if (IS_DEV) console.log('[PostHog] 📄 Pageview:', url)
  } catch (err) {
    if (IS_DEV) console.warn('[PostHog] Pageview capture failed:', err)
  }
}

/**
 * Identify user after login/signup.
 */
export const identifyUser = async (
  userId: string,
  properties?: Record<string, any>
): Promise<void> => {
  if (typeof window === 'undefined') return
  if (!isPostHogEnabled()) return

  const ph = await getPostHog()
  if (!ph || !ph.__loaded) return

  try {
    ph.identify(userId, properties)
    if (IS_DEV) console.log('[PostHog] 👤 Identified:', userId, properties)
  } catch (err) {
    if (IS_DEV) console.warn('[PostHog] Identify failed:', err)
  }
}

/**
 * Reset user (on logout).
 */
export const resetUser = async (): Promise<void> => {
  if (typeof window === 'undefined') return
  if (!isPostHogEnabled()) return

  const ph = await getPostHog()
  if (!ph || !ph.__loaded) return

  try {
    ph.reset()
    if (IS_DEV) console.log('[PostHog] 🚪 User reset (logout)')
  } catch (err) {
    if (IS_DEV) console.warn('[PostHog] Reset failed:', err)
  }
}

/**
 * Custom event tracking (for buttons, actions etc).
 */
export const captureEvent = async (
  eventName: string,
  properties?: Record<string, any>
): Promise<void> => {
  if (typeof window === 'undefined') return
  if (!isPostHogEnabled()) return

  const ph = await getPostHog()
  if (!ph || !ph.__loaded) return

  try {
    ph.capture(eventName, properties)
    if (IS_DEV) console.log('[PostHog] 🎯 Event:', eventName, properties)
  } catch (err) {
    if (IS_DEV) console.warn('[PostHog] Event failed:', err)
  }
}