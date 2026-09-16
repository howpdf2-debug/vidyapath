import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ═══════════════════════════════════════════════════════
// ADMIN LAYOUT — Full Auth Check
// ═══════════════════════════════════════════════════════
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read pathname from middleware-propagated header
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''

  // ✅ Login page bypasses auth check
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // ─── Full Auth Check ───
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      // ✅ Preserve original URL for post-login redirect
      const nextParam = pathname ? `?next=${encodeURIComponent(pathname)}` : ''
      redirect(`/admin/login${nextParam}`)
    }

    // Optional: role-based access
    // const isAdmin =
    //   user.user_metadata?.role === 'admin' ||
    //   user.user_metadata?.is_admin === true
    // if (!isAdmin) {
    //   redirect('/admin/login?error=not_admin')
    // }
  } catch (err) {
    // ✅ Prevent 500 errors if Supabase is unreachable
    console.error('[admin layout] Auth check failed:', err)
    redirect('/admin/login?error=auth_failed')
  }

  return <>{children}</>
}