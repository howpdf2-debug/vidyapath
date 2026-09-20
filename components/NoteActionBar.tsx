'use client'

import { useState, useMemo, useCallback } from 'react'
import { FileText, Download, Printer, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { ShareButton } from './ShareButton'
import PrintDialog from './PrintDialog'

interface NoteActionBarProps {
  pdfUrl: string | null
  pdfSizeKb: number | null
  noteTitle: string
  noteContent: string
  shareUrl: string
}

export default function NoteActionBar({
  pdfUrl,
  pdfSizeKb,
  noteTitle,
  noteContent,
  shareUrl,
}: NoteActionBarProps) {
  const [showPrint, setShowPrint] = useState(false)

  // ✅ Memoized size formatting
  const sizeLabel = useMemo(() => {
    if (!pdfSizeKb || pdfSizeKb <= 0) return null
    const mb = pdfSizeKb / 1024
    if (mb < 0.1) return '< 0.1 MB'
    return `${Math.round(mb * 10) / 10} MB`
  }, [pdfSizeKb])

  // ✅ Safe filename (Devanagari support)
  const safeFilename = useMemo(() => {
    const cleaned = noteTitle
      .replace(/[^\w\s\u0900-\u097F-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    return (cleaned || 'note') + '.pdf'
  }, [noteTitle])

  const handleDownload = useCallback(() => {
    if (!pdfUrl) return
    try {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = safeFilename
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download शुरू हो गया')
    } catch {
      toast.error('Download fail')
    }
  }, [pdfUrl, safeFilename])

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* View PDF */}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="PDF देखें"
            className="group inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm font-semibold"
          >
            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden xs:inline">PDF देखें</span>
            <span className="xs:hidden">देखें</span>
          </a>
        )}

        {/* Download */}
        {pdfUrl && (
          <button
            onClick={handleDownload}
            aria-label="PDF डाउनलोड करें"
            className="group inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all text-sm font-semibold"
          >
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden xs:inline">डाउनलोड</span>
            <span className="xs:hidden">DL</span>
            {sizeLabel && (
              <span className="hidden sm:inline text-[10px] opacity-80 font-mono">
                ({sizeLabel})
              </span>
            )}
          </button>
        )}

        {/* Share */}
        <ShareButton
          title={noteTitle}
          url={shareUrl}
          pdfUrl={pdfUrl}
          variant="default"
        />

        {/* Print */}
        <button
          onClick={() => setShowPrint(true)}
          aria-label="Note प्रिंट करें"
          className="group inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl hover:shadow-lg hover:shadow-slate-500/30 transition-all text-sm font-semibold"
        >
          <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
          प्रिंट
        </button>
      </div>

      {showPrint && (
        <PrintDialog
          onClose={() => setShowPrint(false)}
          pdfUrl={pdfUrl}
          noteContent={noteContent}
          noteTitle={noteTitle}
        />
      )}
    </>
  )
}