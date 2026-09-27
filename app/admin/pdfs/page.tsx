import Link from 'next/link'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import PdfLibrary, { type PdfItem } from '@/components/admin/PdfLibrary'
import { Layers } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Note PDFs — VidyaPath Admin',
  description:
    'PDFs attached to individual chapter notes. For level-wise chapter PDFs, see Chapter PDFs.',
  robots: { index: false, follow: false },
}

const MAX_ROWS = 500

export default async function NotePdfsPage() {
  let pdfs: PdfItem[] = []
  let errorMsg: string | null = null

  try {
    const supabase = createServerClientWithCookies()

    const { data, error } = await supabase
      .from('chapter_notes')
      .select(
        'id, topic, pdf_url, pdf_size_kb, pdf_uploaded_at, created_at, status, ncert:ncert_id(id, class, subject, chapter_num, chapter_title, language)'
      )
      .not('pdf_url', 'is', null)
      .neq('pdf_url', '')
      .eq('status', 'published')
      .order('pdf_uploaded_at', { ascending: false, nullsFirst: false })
      .limit(MAX_ROWS)

    if (error) {
      console.error('[admin/note-pdfs] query failed:', error)
      errorMsg = 'PDFs load नहीं हो पाए। कुछ देर बाद refresh करें।'
    } else {
      pdfs = (data ?? []) as unknown as PdfItem[]
    }
  } catch (err) {
    console.error('[admin/note-pdfs] unexpected:', err)
    errorMsg = 'PDFs load नहीं हो पाए। कुछ देर बाद refresh करें।'
  }

  return (
    <>
      {/* Cross-link banner to Chapter PDFs */}
      <div className="px-4 sm:px-6 pt-4">
        <Link
          href="/admin/chapter-pdfs"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition"
        >
          <Layers className="w-4 h-4" aria-hidden="true" />
          <span>
            Looking for <strong>level-wise chapter PDFs</strong>? Open Chapter
            PDFs
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <PdfLibrary initialPdfs={pdfs} error={errorMsg} />
    </>
  )
}