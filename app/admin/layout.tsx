import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import AdminShell from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin — VidyaPath',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ GAP 5 FIX: middleware ne x-pathname set kiya hai — usse padho
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''

  // ✅ GAP 1 FIX: login page ke liye shell wrap NAHI — warna loop
  if (pathname.startsWith('/admin/login')) {
    return <>{children}</>
  }

  let user = null
  let profile: { role: string | null; full_name: string | null; email: string | null } | null = null

  // ✅ GAP 3 FIX: Supabase crash-safe
  try {
    const supabase = createServerClientWithCookies()

    const { data: { user: u } } = await supabase.auth.getUser()
    user = u

    if (user) {
      const { data: p } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .maybeSingle()
      profile = p
    }
  } catch (err) {
    console.error('[admin/layout] auth failed:', err)
  }

  // Middleware already logged-out users ko handle karta hai
  // Yahan sirf fallback (defense in depth)
  if (!user) {
    redirect('/admin/login')
  }

  // ✅ GAP 2 FIX: role check — student ko admin panel access na do
  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login?error=not_admin')
  }

  return (
    <AdminShell
      user={{
        email: profile.email || user.email || undefined,
        name: profile.full_name || undefined,
      }}
    >
      {children}
    </AdminShell>
  )
}