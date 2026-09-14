import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Login – VidyaPath',
  description: 'Login to your VidyaPath account to access bookmarks, saved notes, and personalized content.',
  path: '/login',
  noIndex: true,
})

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}