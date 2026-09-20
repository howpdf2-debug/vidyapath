import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClientWithCookies } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''

  // Login page bypass
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  try {
    const supabase = createServerClientWithCookies()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const nextParam = pathname
        ? `?next=${encodeURIComponent(pathname)}`
        : ''
      redirect(`/admin/login${nextParam}`)
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      redirect('/admin/login?error=not_admin')
    }
  } catch (err) {
    console.error('[admin layout] Auth check failed:', err)
    redirect('/admin/login?error=session_error')
  }

  return <>{children}</>
}