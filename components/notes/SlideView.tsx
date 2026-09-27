'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Type,
  Clock,
  BookOpen,
  List,
  X,
  Volume2,
  VolumeX,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { LEVEL_META, type NoteLevel } from '@/lib/db-types'

interface Slide {
  id: number
  title: string
  subtitle?: string
  html: string
  plainText: string
  hasFigure: boolean
  wordCount: number
}

interface SlideViewProps {
  contentHtml: string
  title: string
  level: NoteLevel
  language: 'hi' | 'en'
  chapterId: number
  userId?: string | null
  onSwitchToScroll?: () => void
}

// ═══════════════════════════════════════════════════════════════
// HTML → Slides parser
// ═══════════════════════════════════════════════════════════════
function htmlToSlides(html: string): Slide[] {
  if (typeof window === 'undefined') return []
  if (!html || !html.trim()) return []

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')
    const root = doc.body.firstChild as HTMLElement
    if (!root) return []

    const slides: Slide[] = []
    let current: Slide | null = null
    let id = 0

    const pushCurrent = () => {
      if (!current) return
      const trimmed = current.html.trim()
      if (trimmed) {
        current.wordCount = current.plainText
          .split(/\s+/)
          .filter(Boolean).length
        slides.push(current)
      }
      current = null
    }

    const createSlide = (title: string): Slide => ({
      id: id++,
      title,
      html: '',
      plainText: '',
      hasFigure: false,
      wordCount: 0,
    })

    for (const el of Array.from(root.children)) {
      const tag = el.tagName.toLowerCase()

      if (tag === 'h2') {
        pushCurrent()
        current = createSlide(el.textContent?.trim() || `Section ${id + 1}`)
        continue
      }

      if (!current) {
        current = createSlide('परिचय')
      }

      if (tag === 'h3' && !current.subtitle) {
        current.subtitle = el.textContent?.trim() || ''
        continue
      }

      if (el.querySelector('svg') || tag === 'svg') {
        current.hasFigure = true
      }

      current.html += el.outerHTML
      current.plainText += ' ' + (el.textContent?.trim() || '')
    }

    pushCurrent()

    // Merge tiny slides (< 15 words)
    const merged: Slide[] = []
    for (const s of slides) {
      const last = merged[merged.length - 1]
      if (s.wordCount < 15 && last && last.wordCount < 250) {
        last.html += `<h3>${s.title}</h3>` + s.html
        last.plainText += ' ' + s.plainText
        last.hasFigure = last.hasFigure || s.hasFigure
        last.wordCount = last.plainText.split(/\s+/).filter(Boolean).length
      } else {
        merged.push(s)
      }
    }

    return merged
  } catch (err) {
    console.error('[SlideView] parse failed:', err)
    return []
  }
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function SlideView({
  contentHtml,
  title,
  level,
  language,
  chapterId,
  userId,
  onSwitchToScroll,
}: SlideViewProps) {
  const slides = useMemo(() => htmlToSlides(contentHtml), [contentHtml])
  const total = slides.length
  const levelMeta = LEVEL_META[level]

  const [idx, setIdx] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [narrating, setNarrating] = useState(false)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [showMenu, setShowMenu] = useState(false)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [savingProgress, setSavingProgress] = useState(false)
  const [mounted, setMounted] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const wakeLockRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
    try {
      const savedFont = localStorage.getItem('slide-font')
      if (savedFont === 'sm' || savedFont === 'md' || savedFont === 'lg') {
        setFontSize(savedFont)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!mounted || total === 0) return
    try {
      const saved = localStorage.getItem(
        `slide-progress-${chapterId}-${level}`
      )
      if (saved) {
        const n = parseInt(saved, 10)
        if (!isNaN(n) && n > 0 && n < total) {
          setIdx(n)
          setShowResumePrompt(true)
          setTimeout(() => setShowResumePrompt(false), 5000)
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, total])

  const wordsRemaining = useMemo(() => {
    return slides.slice(idx).reduce((s, sl) => s + sl.wordCount, 0)
  }, [slides, idx])
  const minutesLeft = Math.max(1, Math.ceil(wordsRemaining / 200))

  const stopNarration = useCallback(() => {
    setNarrating(false)
    try {
      window.speechSynthesis.cancel()
    } catch {}
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [])

  const goTo = useCallback(
    (n: number, save = true) => {
      if (n < 0 || n >= total || n === idx) return
      setAnimating(true)
      setIdx(n)

      if (save) {
        try {
          localStorage.setItem(
            `slide-progress-${chapterId}-${level}`,
            String(n)
          )
        } catch {}

        if (userId) {
          setSavingProgress(true)
          supabase
            .from('slide_progress')
            .upsert(
              {
                user_id: userId,
                ncert_id: chapterId,
                level,
                slide_index: n,
                total_slides: total,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,ncert_id,level' }
            )
            .then(
              () => setSavingProgress(false),
              () => setSavingProgress(false)
            )
        }
      }

      if (narrating) stopNarration()
      setTimeout(() => setAnimating(false), 250)
    },
    [idx, total, chapterId, level, userId, narrating, stopNarration]
  )

  const next = useCallback(() => goTo(idx + 1), [idx, goTo])
  const prev = useCallback(() => goTo(idx - 1), [idx, goTo])

  const startNarration = useCallback(async () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Voice narration is not supported in this browser')
      return
    }

    setNarrating(true)

    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
      }
    } catch {}

    const narrate = (i: number) => {
      if (i >= total || !window.speechSynthesis) {
        stopNarration()
        return
      }

      const slide = slides[i]
      const text = `${slide.title}. ${slide.plainText}`.slice(0, 2000)

      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      utt.rate = 0.95
      utt.pitch = 1.0
      utt.volume = muted ? 0 : 1

      const voices = window.speechSynthesis.getVoices()
      const preferred =
        language === 'hi'
          ? voices.find((v) => v.lang.startsWith('hi'))
          : voices.find((v) => v.lang === 'en-IN') ||
            voices.find((v) => v.lang.startsWith('en'))

      if (preferred) utt.voice = preferred

      utt.onend = () => {
        if (i < total - 1) {
          goTo(i + 1, true)
          setTimeout(() => narrate(i + 1), 400)
        } else {
          stopNarration()
        }
      }
      utt.onerror = () => stopNarration()

      try {
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utt)
      } catch {
        stopNarration()
      }
    }

    narrate(idx)
  }, [idx, slides, total, language, muted, goTo, stopNarration])

  const toggleNarration = useCallback(() => {
    if (narrating) stopNarration()
    else startNarration()
  }, [narrating, startNarration, stopNarration])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {}
  }

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (
        t.tagName === 'INPUT' ||
        t.tagName === 'TEXTAREA' ||
        t.isContentEditable
      )
        return

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          prev()
          break
        case 'Home':
          e.preventDefault()
          goTo(0)
          break
        case 'End':
          e.preventDefault()
          goTo(total - 1)
          break
        case 'Escape':
          if (showMenu) setShowMenu(false)
          else if (fullscreen) document.exitFullscreen?.()
          break
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) toggleFullscreen()
          break
        case 'p':
        case 'P':
          if (!e.ctrlKey && !e.metaKey) toggleNarration()
          break
        case 'm':
        case 'M':
          setMuted((m) => !m)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, goTo, total, toggleNarration, showMenu, fullscreen])

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next()
      else prev()
    }
  }

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('slide-font', fontSize)
      } catch {}
    }
  }, [fontSize, mounted])

  useEffect(() => {
    return () => stopNarration()
  }, [stopNarration])

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          No slides found in this content
        </p>
        {onSwitchToScroll && (
          <button
            onClick={onSwitchToScroll}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
          >
            Switch to scroll mode
          </button>
        )}
      </div>
    )
  }

  const slide = slides[idx]
  const fontSizeCls = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }[fontSize]

  return (
    <div
      ref={containerRef}
      className={`${
        fullscreen
          ? 'fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 overflow-auto p-4 sm:p-8'
          : ''
      }`}
      role="region"
      aria-label="Notes slideshow"
    >
      {/* Resume Prompt */}
      {showResumePrompt && (
        <div
          role="status"
          className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3"
        >
          <p className="text-sm text-amber-800 dark:text-amber-300">
            📖 Resumed from slide {idx + 1}
          </p>
          <button
            onClick={() => setShowResumePrompt(false)}
            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header controls */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide ${levelMeta.bg} ${levelMeta.color}`}
          >
            {levelMeta.emoji} {levelMeta.label}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
            {title}
          </span>
          {savingProgress && (
            <Loader2
              className="w-3 h-3 animate-spin text-slate-400"
              aria-label="Saving progress"
            />
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Show all slides"
            title="Slide list"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label={muted ? 'Unmute' : 'Mute'}
            title={muted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() =>
              setFontSize((f) => (f === 'sm' ? 'md' : f === 'md' ? 'lg' : 'sm'))
            }
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label={`Font size: ${fontSize}`}
            title="Font size"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title="Fullscreen (F)"
          >
            {fullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          {onSwitchToScroll && !fullscreen && (
            <button
              onClick={onSwitchToScroll}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Scroll
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3"
        role="progressbar"
        aria-valuenow={idx + 1}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div
          className={`h-full bg-gradient-to-r ${levelMeta.gradient} transition-all duration-300`}
          style={{ width: `${((idx + 1) / total) * 100}%` }}
        />
      </div>

      {/* ═══════ SLIDE READING AREA (warm, eye-friendly) ═══════ */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`slide-reading-area min-h-[420px] flex flex-col transition-all duration-300 ${
          animating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-300/70 tabular-nums">
            Slide {idx + 1} / {total}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-800/70 dark:text-amber-300/70 tabular-nums">
            <Clock className="w-3 h-3" aria-hidden="true" />~{minutesLeft} min
          </span>
        </div>

        <h2 className="!mt-0">{slide.title}</h2>

        {slide.subtitle && (
          <p className="text-sm text-amber-700/80 dark:text-amber-300/70 italic !mb-4">
            {slide.subtitle}
          </p>
        )}

        <div
          className={`note-content ${fontSizeCls} flex-1 min-h-0 min-w-0 w-full`}
          dangerouslySetInnerHTML={{ __html: slide.html }}
        />

        {slide.hasFigure && (
          <p className="text-[11px] text-amber-700/60 dark:text-amber-300/50 mt-4 italic">
            💡 For a larger view, tap on the diagram
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between gap-2 sm:gap-4">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
          <button
            onClick={toggleNarration}
            className={`inline-flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              narrating
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg'
            }`}
            aria-label={narrating ? 'Stop narration' : 'Play narration'}
          >
            {narrating ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Listen</span>
              </>
            )}
          </button>

          <div
            className="hidden lg:flex items-center gap-1.5"
            role="tablist"
            aria-label="Slide navigation"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === idx}
                aria-label={`Slide ${i + 1}: ${slides[i].title}`}
                className={`transition-all ${
                  i === idx
                    ? `w-6 h-2 rounded-full bg-gradient-to-r ${levelMeta.gradient}`
                    : 'w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <span className="lg:hidden text-xs text-slate-500 tabular-nums font-medium">
            {idx + 1}/{total}
          </span>
        </div>

        <button
          onClick={next}
          disabled={idx === total - 1}
          className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Next slide"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-3 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 text-center">
        <span className="hidden sm:inline">
          ← → navigate · Space play/pause · F fullscreen · P narration · M mute
        </span>
        <span className="sm:hidden">Swipe ← → · Tap Listen</span>
      </p>

      {/* Slide menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[200] animate-fade-in"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="All slides"
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 z-[210] p-4 overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">
                All Slides
              </h3>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-1">
              {slides.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      goTo(i)
                      setShowMenu(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                      i === idx
                        ? `${levelMeta.bg} ${levelMeta.color} font-semibold`
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs text-slate-400 mr-2 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.title}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  )
}