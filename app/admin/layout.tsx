import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

// ═══════════════════════════════════════════════════════
// ADMIN LAYOUT — Cookie-Based Auth (custom password system)
// ═══════════════════════════════════════════════════════
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''

  // ✅ Login page bypasses auth
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // ✅ Check admin_session cookie
  try {
    const cookieStore = cookies()
    const session = cookieStore.get('admin_session')?.value

    if (!session) {
      const nextParam = pathname
        ? `?next=${encodeURIComponent(pathname)}`
        : ''
      redirect(`/admin/login${nextParam}`)
    }
  } catch (err) {
    console.error('[admin layout] Cookie check failed:', err)
    redirect('/admin/login?error=session_error')
  }

  return <>{children}</>
}