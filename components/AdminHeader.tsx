'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface AdminHeaderProps {
  title?: string
}

export function AdminHeader({ title = 'Admin Panel' }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
        {title}
      </h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
      >
        <LogOut className="w-5 h-5" /> Logout
      </button>
    </div>
  )
}