'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AdminHeader } from '@/components/AdminHeader'
import { ArrowLeft, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) toast.error(error.message)
    else setUsers(data.users || [])
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) toast.error(error.message)
    else {
      toast.success('User deleted')
      fetchUsers()
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <AdminHeader title="👥 Manage Users" />
      <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="p-2">Email</th>
                <th className="p-2">Created</th>
                <th className="p-2">Confirmed</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-2">{u.confirmed_at ? '✅' : '❌'}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}