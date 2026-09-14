import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'My Bookmarks – VidyaPath',
  description:
    'Access your saved NCERT chapters, notes, and study material. Your personal bookmarks in one place.',
  path: '/bookmarks',
  noIndex: true,
})

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}