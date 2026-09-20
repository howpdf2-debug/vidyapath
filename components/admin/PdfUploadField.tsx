'use client'

import { useEffect, useRef, useState } from 'react'
import {
  FileText, Upload, X, Loader2, CheckCircle2,
  Eye, Download, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PdfUploadFieldProps {
  value: {
    pdf_url: string | null
    pdf_size_kb: number | null
  }
  onChange: (value: {
    pdf_url: string | null
    pdf_size_kb: number | null
  }) => void
}

const MAX_SIZE = 20 * 1024 * 1024

export default function PdfUploadField({ value, onChange }: PdfUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(true)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // ✅ Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [])

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const handleFile = async (file: File) => {
    // Reset state
    setError(null)

    // ✅ Validate extension (lenient on MIME)
    const nameLower = file.name.toLowerCase()
    const hasExt = nameLower.endsWith('.pdf')
    const hasMime = file.type === 'application/pdf'
    if (!hasExt && !hasMime) {
      toast.error('सिर्फ PDF files allowed हैं')
      return
    }
    if (file.size > MAX_SIZE) {
      toast.error('File 20 MB से बड़ी है')
      return
    }
    if (file.size === 0) {
      toast.error('File खाली है')
      return
    }
    // ✅ Prevent concurrent uploads
    if (uploading) {
      toast.error('पहले वाला upload पूरा होने दें')
      return
    }

    setUploading(true)
    setProgress(10)

    // ✅ AbortController for cancellation
    abortRef.current = new AbortController()

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulated progress (since fetch doesn't support upload progress)
      progressIntervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          setProgress((p) => Math.min(p + 8, 85))
        }
      }, 200)

      const res = await fetch('/api/admin/notes/upload-pdf', {
        method: 'POST',
        body: formData,
        signal: abortRef.current.signal,
      })

      clearProgressInterval()

      if (!mountedRef.current) return

      setProgress(95)
      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Upload fail')
        toast.error(result.error || 'Upload fail')
        setUploading(false)
        setProgress(0)
        return
      }

      if (mountedRef.current) {
        setProgress(100)
        onChange({
          pdf_url: result.pdf_url,
          pdf_size_kb: result.pdf_size_kb,
        })

        setTimeout(() => {
          if (mountedRef.current) {
            toast.success('PDF upload हो गया!')
            setUploading(false)
            setProgress(0)
          }
        }, 500)
      }
    } catch (err: any) {
      clearProgressInterval()
      if (err?.name === 'AbortError') return
      if (mountedRef.current) {
        toast.error('Network error')
        setUploading(false)
        setProgress(0)
      }
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!uploading) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    onChange({ pdf_url: null, pdf_size_kb: null })
    toast.success('PDF हटा दिया')
  }

  // ═══════════════════════════════════════════════════════
  // UPLOADED STATE
  // ═══════════════════════════════════════════════════════
  if (value.pdf_url) {
    const sizeMB = value.pdf_size_kb
      ? Math.round((value.pdf_size_kb / 1024) * 10) / 10
      : 0
    const fileName = value.pdf_url.split('/').pop() || 'notes.pdf'

    // ✅ Better filename display — strip only first 2 segments (timestamp-uuid)
    const segments = fileName.split('-')
    const displayName =
      segments.length >= 3
        ? segments.slice(2).join('-')
        : fileName

    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4">
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
          <CheckCircle2 className="w-3 h-3" />
          UPLOADED
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/30">
            <FileText className="w-7 h-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
              {displayName}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-mono">
                {sizeMB > 0 ? `${sizeMB} MB` : '< 0.1 MB'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span>PDF Document</span>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={value.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition"
              title="Preview"
              aria-label="Preview PDF"
            >
              <Eye className="w-4 h-4" />
            </a>
            <a
              href={value.pdf_url}
              download
              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition"
              title="Download"
              aria-label="Download PDF"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-950/50 transition"
              title="Remove"
              aria-label="Remove PDF"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // UPLOAD STATE
  // ═══════════════════════════════════════════════════════
  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all overflow-hidden ${
          isDragging
            ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-950/40 dark:to-purple-950/40 scale-[1.02]'
            : uploading
            ? 'border-brand-400 bg-brand-50/30 dark:bg-brand-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 bg-slate-50/50 dark:bg-slate-900/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleSelect}
          disabled={uploading}
          aria-label="Upload PDF file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />

        <div className="p-6 sm:p-8 text-center pointer-events-none">
          {uploading ? (
            <div className="space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Uploading...
                </p>
                <p className="text-xs text-slate-500 mt-1">{progress}%</p>
              </div>
              {/* ✅ ARIA-labeled progress bar */}
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Upload progress"
                className="max-w-xs mx-auto bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden"
              >
                <div
                  className="bg-gradient-to-r from-brand-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 transition-transform ${
                  isDragging ? 'scale-110 rotate-3' : ''
                }`}
              >
                <Upload
                  className={`w-7 h-7 transition-colors ${
                    isDragging ? 'text-brand-600' : 'text-slate-400'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isDragging ? 'छोड़ दें यहाँ!' : 'PDF upload करें'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Drag & drop करें या click करें
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                  <FileText className="w-3 h-3" /> PDF
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                  Max 20 MB
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Error banner */}
      {error && (
        <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-300 flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}