import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'My Profile – VidyaPath',
  description: 'Manage your VidyaPath account settings, preferences, and personal information.',
  path: '/profile',
  noIndex: true,
})

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}