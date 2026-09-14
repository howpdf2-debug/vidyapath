'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="hi">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#f9fafb',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              width: '100%',
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>
              Kuch galat ho gaya
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px' }}>
              Something went wrong. Please try again.
            </p>

            {error.digest && (
              <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '16px' }}>
                Error ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              style={{
                padding: '10px 20px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}