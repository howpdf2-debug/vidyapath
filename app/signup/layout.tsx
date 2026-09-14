import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Sign Up – VidyaPath',
  description: 'Create a free VidyaPath account. Access NCERT solutions, state board notes, and government job updates.',
  path: '/signup',
  noIndex: true,
})

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}