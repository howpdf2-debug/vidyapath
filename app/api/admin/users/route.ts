// app/api/admin/users/route.ts
// Server-side admin user management. Service role stays server-side.

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-api'
import { getServerSession } from '@/lib/auth-server'
import { ok, validationError, serverError } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/admin/users?page=1&perPage=200
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.response

  const url = new URL(req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(
    200,
    Math.max(1, Number(url.searchParams.get('perPage')) || 50)
  )

  const { data, error } = await adminClient().auth.admin.listUsers({
    page,
    perPage,
  })

  if (error) return serverError('Could not load users')

  const rawUsers = data?.users ?? []
  const userIds = rawUsers.map((u) => u.id)

  // Merge profiles (role + full_name)
  const profilesMap: Record<
    string,
    { role: string | null; full_name: string | null }
  > = {}

  if (userIds.length > 0) {
    const { data: profiles } = await adminClient()
      .from('profiles')
      .select('id, role, full_name')
      .in('id', userIds)

    for (const p of profiles ?? []) {
      profilesMap[p.id] = { role: p.role, full_name: p.full_name }
    }
  }

  const users = rawUsers.map((u) => ({
    id: u.id,
    email: u.email ?? '',
    created_at: u.created_at ?? null,
    last_sign_in_at: u.last_sign_in_at ?? null,
    email_confirmed_at: u.email_confirmed_at ?? null,
    role: profilesMap[u.id]?.role ?? 'user',
    full_name: profilesMap[u.id]?.full_name ?? null,
  }))

  return ok({ users, total: users.length, page, perPage })
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/users?id=<uuid>
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.response

  const id = new URL(req.url).searchParams.get('id')
  if (!id || id.length < 10) {
    return validationError({ id: 'Invalid user id' })
  }

  // Block self-delete
  const session = await getServerSession()
  if (session?.user?.id === id) {
    return validationError({ id: 'Cannot delete your own account' })
  }

  const { error } = await adminClient().auth.admin.deleteUser(id)
  if (error) return serverError('Could not delete user')
  return ok({ id })
}