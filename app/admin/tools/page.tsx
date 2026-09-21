import { createServerClientWithCookies } from '@/lib/supabase-server'
import ToolsPanel, { type ToolsStats } from '@/components/admin/ToolsPanel'

export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  let stats: ToolsStats = {
    totalNotes: 0,
    notesWithoutPdf: 0,
    totalPdfs: 0,
    totalUsers: 0,
  }
  let error: string | null = null

  try {
    const supabase = createServerClientWithCookies()

    const [
      { count: totalNotes },
      { count: notesWithoutPdf },
      { count: totalPdfs },
      { count: totalUsers },
    ] = await Promise.all([
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true }),
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true }).is('pdf_url', null),
      supabase.from('chapter_notes').select('*', { count: 'exact', head: true }).not('pdf_url', 'is', null),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])

    stats = {
      totalNotes: totalNotes ?? 0,
      notesWithoutPdf: notesWithoutPdf ?? 0,
      totalPdfs: totalPdfs ?? 0,
      totalUsers: totalUsers ?? 0,
    }
  } catch (err) {
    console.error('[admin/tools]', err)
    error = 'Stats load नहीं हो पाए।'
  }

  return <ToolsPanel initialStats={stats} error={error} />
}