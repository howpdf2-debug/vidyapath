'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSafeNext } from '@/lib/next-param'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Verifying your email...')

  useEffect(() => {
    async function handleCallback() {
      // ✅ FIX C1+C3: Read `next` from search OR hash (magic link vs OAuth)
      const searchParams = new URLSearchParams(window.location.search)
      let rawNext = searchParams.get('next')
      if (!rawNext && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1))
        rawNext = hashParams.get('next')
      }
      const safeNext = getSafeNext(rawNext, '/dashboard')

      try {
        console.log('[auth/callback] URL:', window.location.href)
        console.log('[auth/callback] safeNext:', safeNext)

        // 1. Check if Supabase auto-detected session from URL
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[auth/callback] Session error:', sessionError)
          setStatus('Error: ' + sessionError.message)
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        if (session) {
          console.log('[auth/callback] Session found:', session.user.email)
          setStatus('Success! Redirecting...')
          router.push(safeNext)
          return
        }

        // 2. No session yet — check URL for code (PKCE flow)
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')

        if (code) {
          console.log('[auth/callback] Exchanging code for session...')
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('[auth/callback] Exchange failed:', exchangeError)
            setStatus('Verification failed: ' + exchangeError.message)
            setTimeout(() => router.push('/login'), 2000)
            return
          }

          console.log('[auth/callback] Code exchanged')
          setStatus('Success! Redirecting...')
          router.push(safeNext)
          return
        }

        // 3. No session, no code — wait for Supabase to process
        console.log('[auth/callback] Waiting for Supabase...')
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const {
          data: { session: retrySession },
        } = await supabase.auth.getSession()

        if (retrySession) {
          console.log('[auth/callback] Session found on retry')
          router.push(safeNext)
          return
        }

        // 4. Nothing worked
        console.error('[auth/callback] No session after retry')
        setStatus('Could not verify. Redirecting to login...')
        setTimeout(() => router.push('/login'), 2000)
      } catch (err) {
        console.error('[auth/callback] Unexpected error:', err)
        setStatus('Something went wrong')
        setTimeout(() => router.push('/login'), 2000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-indigo-950 p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">{status}</p>
      </div>
    </div>
  )
}