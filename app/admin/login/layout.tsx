import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login — VidyaPath',
  description: 'VidyaPath admin panel login',
  robots: { index: false, follow: false },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}