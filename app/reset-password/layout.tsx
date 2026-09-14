import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Reset Password – VidyaPath',
  description: 'Set a new password for your VidyaPath account.',
  path: '/reset-password',
  noIndex: true,
})

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}