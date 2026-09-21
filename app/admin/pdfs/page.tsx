import { createServerClientWithCookies } from '@/lib/supabase-server'
import PdfLibrary, { type PdfItem } from '@/components/admin/PdfLibrary'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'PDF Library — VidyaPath Admin',
}

export default async function PdfsPage() {
  let pdfs: PdfItem[] = []
  let errorMsg: string | null = null

  try {
    const supabase = createServerClientWithCookies()

    const { data, error } = await supabase
      .from('chapter_notes')
      .select(
        'id, topic, pdf_url, pdf_size_kb, pdf_uploaded_at, created_at, ncert:ncert_id(id, class, subject, chapter_num, chapter_title, language)'
      )
      .not('pdf_url', 'is', null)
      .neq('pdf_url', '')
      .order('pdf_uploaded_at', { ascending: false, nullsFirst: false })

    if (error) {
      // ✅ GAP 1 FIX: log server-side, generic message to client
      console.error('[admin/pdfs] query failed:', error)
      errorMsg = 'PDFs load नहीं हो पाए। कुछ देर बाद refresh करें।'
    } else {
      pdfs = (data ?? []) as unknown as PdfItem[]
    }
  } catch (err) {
    console.error('[admin/pdfs] unexpected:', err)
    errorMsg = 'PDFs load नहीं हो पाए। कुछ देर बाद refresh करें।'
  }

  return <PdfLibrary initialPdfs={pdfs} error={errorMsg} />
}