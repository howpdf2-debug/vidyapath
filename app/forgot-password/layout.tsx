import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Forgot Password – VidyaPath',
  description: 'Reset your VidyaPath account password via email link.',
  path: '/forgot-password',
  noIndex: true,
})

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}