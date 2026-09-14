'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export function RefreshButton({
  label = 'Fetch Latest News',
  className = '',
}: {
  label?: string
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFetch = async () => {
    setLoading(true)
    const toastId = toast.loading('Fetching latest news...')
    try {
      const res = await fetch('/api/rojgar-samachar/update', {
        cache: 'no-store',
      })
      const data = await res.json()

      if (data.inserted > 0) {
        toast.success(`${data.inserted} new items added!`, { id: toastId })
        router.refresh()
      } else if (data.errorCount > 0 && data.inserted === 0) {
        toast.error('Source sites unavailable. Try later.', { id: toastId })
      } else {
        toast.success('Already up to date.', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleFetch}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition ${className}`}
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Fetching...' : label}
    </button>
  )
}