'use client'

import { AdminHeader } from '@/components/AdminHeader'
import Link from 'next/link'
import { BookOpen, FileText, Briefcase, Newspaper, Video } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminHeader title="🛠️ Admin Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* NCERT */}
        <AdminCard
          icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
          title="NCERT"
          description="Manage chapters & books"
          href="/admin/ncert"
        />

        {/* Notes */}
        <AdminCard
          icon={<FileText className="w-8 h-8 text-green-600" />}
          title="Notes"
          description="Upload chapter notes"
          href="/admin/notes"
        />

        {/* ⚠️ NEW: Videos */}
        <AdminCard
          icon={<Video className="w-8 h-8 text-red-600" />}
          title="Videos"
          description="Add YouTube videos to chapters"
          href="/admin/videos"
        />

        {/* Rojgar Samachar */}
        <AdminCard
          icon={<Newspaper className="w-8 h-8 text-blue-600" />}
          title="Rojgar Samachar"
          description="Add/Edit employment news"
          href="/admin/rojgar-samachar"
        />

        {/* Competitive Exams */}
        <AdminCard
          icon={<Briefcase className="w-8 h-8 text-purple-600" />}
          title="Competitive Exams"
          description="SSC, Railway, Bank content"
          href="/admin/competitive-exams"
        />
      </div>

      <div className="mt-8 p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the cards above to manage content. Changes appear instantly on the website.
        </p>
      </div>
    </div>
  )
}

function AdminCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition p-6 hover:scale-[1.02]"
    >
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      <span className="inline-block mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
        Manage →
      </span>
    </Link>
  )
}