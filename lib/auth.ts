import { createServerClient } from './supabase'

export async function getServerSession() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}