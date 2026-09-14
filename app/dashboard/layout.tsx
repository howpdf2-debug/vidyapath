import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Dashboard – VidyaPath',
  description: 'Your personal learning dashboard with progress, recent activity, and saved content.',
  path: '/dashboard',
  noIndex: true,
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}