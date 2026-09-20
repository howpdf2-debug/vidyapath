'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Printer, X, FileText, Code, Layers, Check, AlertCircle, Loader2,
} from 'lucide-react'

interface PrintDialogProps {
  onClose: () => void
  pdfUrl: string | null
  noteContent: string
  noteTitle: string
}

type PrintMode = 'pdf' | 'html' | 'both'

export default function PrintDialog({
  onClose,
  pdfUrl,
  noteContent,
  noteTitle,
}: PrintDialogProps) {
  const [mode, setMode] = useState<PrintMode>(pdfUrl ? 'pdf' : 'html')
  const [printing, setPrinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Escape key + focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !printing) onClose()
    }
    window.addEventListener('keydown', handler)
    closeButtonRef.current?.focus()
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, printing])

  // ✅ Body scroll lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // ✅ Safe filename
  const getSafeFilename = (title: string) =>
    title.replace(/[^\w\s\u0900-\u097F-]/g, '').trim() || 'note'

  // ✅ HTML Print
  const printHtml = (): boolean => {
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) {
      setError('Popup blocked — browser में popups allow करें')
      return false
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${noteTitle}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 800px; margin: auto; color: #1a1a1a; line-height: 1.6; }
          h1 { font-size: 22px; margin: 0 0 8px 0; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; }
          h2 { font-size: 18px; margin: 20px 0 10px; }
          h3 { font-size: 16px; margin: 16px 0 8px; }
          p { margin: 8px 0; }
          ul, ol { padding-left: 24px; margin: 8px 0; }
          li { margin: 4px 0; }
          svg { max-width: 100%; height: auto; display: block; margin: 16px auto; }
          img { max-width: 100%; height: auto; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f3f4f6; font-weight: 600; }
          blockquote { border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 12px 0; color: #6b7280; font-style: italic; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
          pre { background: #f3f4f6; padding: 12px; border-radius: 8px; overflow-x: auto; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
          @media print {
            body { padding: 0; }
            @page { margin: 15mm; }
            h2, h3 { page-break-after: avoid; }
            svg, table, blockquote { page-break-inside: avoid; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        <h1>${noteTitle}</h1>
        ${noteContent}
        <div class="footer">स्रोत: VidyaPath</div>
      </body>
      </html>
    `
    win.document.write(html)
    win.document.close()

    // ✅ Safe print with timeout
    const printTimer = setTimeout(() => {
      try {
        win.focus()
        win.print()
        win.onafterprint = () => win.close()
      } catch (err) {
        console.error('[print-html]', err)
      }
    }, 400)

    // Cleanup on close
    win.addEventListener('beforeunload', () => clearTimeout(printTimer))
    return true
  }

  // ✅ PDF Print via iframe (with timeout fallback)
  const printPdf = (): void => {
    const iframe = document.createElement('iframe')
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'
    iframe.src = pdfUrl!
    document.body.appendChild(iframe)

    let loaded = false
    const cleanup = () => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    }

    // ✅ Timeout fallback — if load doesn't fire in 5s
    const timeout = setTimeout(() => {
      if (!loaded) {
        cleanup()
        // Fallback: open in new tab
        window.open(pdfUrl!, '_blank', 'noopener,noreferrer')
      }
    }, 5000)

    iframe.onload = () => {
      loaded = true
      clearTimeout(timeout)
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
        } catch {
          // Safari & Firefox may block — fallback
          window.open(pdfUrl!, '_blank', 'noopener,noreferrer')
        }
        // Cleanup after print dialog
        setTimeout(cleanup, 3000)
      }, 600)
    }
  }

  // ✅ Both mode — HTML first, then PDF (proper sequencing)
  const handlePrint = async () => {
    setError(null)
    setPrinting(true)

    try {
      if (mode === 'pdf' && pdfUrl) {
        printPdf()
        setTimeout(() => onClose(), 500)
        return
      }

      if (mode === 'html') {
        const ok = printHtml()
        if (ok) setTimeout(() => onClose(), 300)
        return
      }

      if (mode === 'both') {
        const ok = printHtml()
        if (!ok) {
          setPrinting(false)
          return
        }
        // PDF को अलग iframe में print — HTML print dialog के बाद
        if (pdfUrl) {
          setTimeout(() => printPdf(), 5000)
        }
        setTimeout(() => onClose(), 500)
        return
      }
    } catch (err) {
      console.error('[print]', err)
      setError('Print fail — कृपया दोबारा try करें')
    } finally {
      setPrinting(false)
    }
  }

  const options: Array<{
    value: PrintMode
    icon: React.ReactNode
    title: string
    desc: string
    disabled?: boolean
  }> = [
    { value: 'pdf', icon: <FileText className="w-5 h-5" />, title: 'सिर्फ PDF', desc: 'PDF file print होगी', disabled: !pdfUrl },
    { value: 'html', icon: <Code className="w-5 h-5" />, title: 'सिर्फ Web Page', desc: 'Colors, diagrams समेत' },
    { value: 'both', icon: <Layers className="w-5 h-5" />, title: 'दोनों', desc: 'HTML + PDF दोनों', disabled: !pdfUrl },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && !printing && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Print dialog"
    >
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base">प्रिंट करें</h3>
                <p className="text-[10px] opacity-80 truncate max-w-[180px]">
                  {noteTitle}
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              disabled={printing}
              aria-label="Close print dialog"
              className="p-1.5 rounded-lg hover:bg-white/20 transition disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Error banner */}
          {error && (
            <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300 flex-1">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded p-0.5"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Options */}
          <div
            className="p-5 space-y-2"
            role="radiogroup"
            aria-label="Print options"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              क्या print करना है?
            </p>

            {options.map((opt) => {
              const isSelected = mode === opt.value
              const isDisabled = opt.disabled

              return (
                <button
                  key={opt.value}
                  onClick={() => !isDisabled && !printing && setMode(opt.value)}
                  disabled={isDisabled || printing}
                  role="radio"
                  aria-checked={isSelected}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-brand-500 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950/40 dark:to-purple-950/40 shadow-md'
                      : isDisabled
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 opacity-50 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-br from-brand-600 to-purple-600 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isSelected ? <Check className="w-5 h-5" /> : opt.icon}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-bold text-sm ${
                        isSelected
                          ? 'text-brand-900 dark:text-brand-100'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {opt.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 flex-shrink-0 bg-white dark:bg-slate-900">
          <button
            onClick={onClose}
            disabled={printing}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            disabled={printing}
            aria-busy={printing}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-60"
          >
            {printing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Printing...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                Print
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}