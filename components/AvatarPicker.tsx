'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  Shuffle,
  Check,
  Save,
  Loader2,
  Type,
  User as UserIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { UserAvatar } from '@/components/UserAvatar'
import {
  AVATAR_THEMES,
  getTheme,
  getStyle,
  getFigure,
  randomTheme,
  randomStyle,
  randomFigure,
  DEFAULT_STYLE,
  DEFAULT_THEME,
  type AvatarStyle,
} from '@/lib/avatar'
import {
  FIGURES,
  FIGURE_MAP,
  type FigureId,
} from '@/lib/avatar-figures'

const TEXT_STYLES: {
  id: Exclude<AvatarStyle, 'figure'>
  labelEn: string
  labelHi: string
  example: string
}[] = [
  { id: 'initials', labelEn: 'Initials', labelHi: 'आद्याक्षर', example: 'RK' },
  { id: 'first_letter', labelEn: 'First letter', labelHi: 'पहला अक्षर', example: 'R' },
  { id: 'first_name', labelEn: 'First name', labelHi: 'पहला नाम', example: 'Raj' },
]

type Mode = 'text' | 'figure'

const ROLE_LABELS: Record<string, { en: string; hi: string }> = {
  student: { en: 'Student', hi: 'छात्र' },
  scientist: { en: 'Scientist', hi: 'वैज्ञानिक' },
  professor: { en: 'Professor', hi: 'प्रोफ़ेसर' },
  teacher: { en: 'Teacher', hi: 'शिक्षक' },
}

export function AvatarPicker() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [mode, setMode] = useState<Mode>('text')
  const [style, setStyle] = useState<Exclude<AvatarStyle, 'figure'>>(
    DEFAULT_STYLE as Exclude<AvatarStyle, 'figure'>
  )
  const [figure, setFigure] = useState<FigureId>(getFigure(null))
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME)

  const [savedMode, setSavedMode] = useState<Mode>('text')
  const [savedStyle, setSavedStyle] = useState<Exclude<AvatarStyle, 'figure'>>(
    DEFAULT_STYLE as Exclude<AvatarStyle, 'figure'>
  )
  const [savedFigure, setSavedFigure] = useState<FigureId>(getFigure(null))
  const [savedThemeId, setSavedThemeId] = useState<string>(DEFAULT_THEME)

  useEffect(() => {
    let active = true

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!active) return

      setUser(user)

      const meta = (user?.user_metadata ?? {}) as Record<string, unknown>
      const rawStyle =
        typeof meta.avatar_style === 'string' ? meta.avatar_style : null
      const s = getStyle(rawStyle)
      const f = getFigure(
        typeof meta.avatar_figure === 'string' ? meta.avatar_figure : null
      )
      const t =
        typeof meta.avatar_theme === 'string'
          ? meta.avatar_theme
          : DEFAULT_THEME

      const isFigure = s === 'figure'
      const safeStyle: Exclude<AvatarStyle, 'figure'> = isFigure
        ? ('initials' as Exclude<AvatarStyle, 'figure'>)
        : (s as Exclude<AvatarStyle, 'figure'>)

      setStyle(safeStyle)
      setFigure(f)
      setThemeId(t)
      setMode(isFigure ? 'figure' : 'text')

      setSavedStyle(safeStyle)
      setSavedFigure(f)
      setSavedThemeId(t)
      setSavedMode(isFigure ? 'figure' : 'text')

      setLoading(false)
    }

    load()

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (active) setUser(session?.user ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const isDirty =
    mode !== savedMode ||
    (mode === 'text' ? style !== savedStyle : figure !== savedFigure) ||
    themeId !== savedThemeId

  const handleModeChange = (m: Mode) => setMode(m)

  const handleShuffle = () => {
    setThemeId(randomTheme().id)
    if (mode === 'figure') {
      setFigure(randomFigure())
    } else {
      setStyle(randomStyle())
    }
  }

  const handleReset = () => {
    // Reset current mode's content but keep mode
    if (mode === 'figure') {
      setFigure(getFigure(null))
      setThemeId(DEFAULT_THEME)
    } else {
      setStyle(DEFAULT_STYLE as Exclude<AvatarStyle, 'figure'>)
      setThemeId(DEFAULT_THEME)
    }
  }

  const handleSave = async () => {
    if (!user || !isDirty || saving) return
    setSaving(true)
    try {
      const payload =
        mode === 'figure'
          ? {
              avatar_style: 'figure' as const,
              avatar_figure: figure,
              avatar_theme: themeId,
            }
          : {
              avatar_style: style,
              avatar_figure: figure,
              avatar_theme: themeId,
            }

      const { error } = await supabase.auth.updateUser({ data: payload })
      if (error) {
        console.error('[avatar] save failed:', error)
        toast.error('Save nahi hua. Dobara try karo')
        return
      }
      setSavedMode(mode)
      setSavedStyle(style)
      setSavedFigure(figure)
      setSavedThemeId(themeId)
      toast.success('Avatar save ho gaya 🎨')
    } catch (err) {
      console.error('[avatar] unexpected:', err)
      toast.error('Network error. Dobara try karo')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!user) return null

  const name =
    (typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : null) ?? null
  const email = user.email ?? null
  const theme = getTheme(themeId)

  const previewStyle: AvatarStyle = mode === 'figure' ? 'figure' : style
  const currentFigureLabel = FIGURE_MAP[figure].labelEn
  const currentTextLabel =
    TEXT_STYLES.find((s) => s.id === style)?.labelEn ?? ''

  return (
    <section
      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 space-y-6"
      aria-labelledby="avatar-picker-heading"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2
            id="avatar-picker-heading"
            className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
          >
            🎨 Apna Avatar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Text ya figure — jaise tum chaaho
          </p>
        </div>
        <button
          type="button"
          onClick={handleShuffle}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
          Surprise me
        </button>
      </div>

      {/* Live preview */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex-shrink-0">
          <UserAvatar
            name={name}
            email={email}
            style={previewStyle}
            figure={figure}
            themeId={themeId}
            size="xl"
            ariaLabel={`Preview: ${name || email || 'avatar'}`}
          />
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {name || email?.split('@')[0] || 'Your Name'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {theme.name}
            {' · '}
            {mode === 'figure' ? currentFigureLabel : currentTextLabel}
          </p>
        </div>
      </div>

      {/* Mode toggle */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
          Avatar type
        </label>
        <div
          role="tablist"
          aria-label="Avatar type"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-700"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'text'}
            onClick={() => handleModeChange('text')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              mode === 'text'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" aria-hidden="true" />
            Text
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'figure'}
            onClick={() => handleModeChange('figure')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              mode === 'figure'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" aria-hidden="true" />
            Figure
          </button>
        </div>
      </div>

      {/* Text mode */}
      {mode === 'text' && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
            Naam kaise dikhe
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TEXT_STYLES.map((opt) => {
              const active = style === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStyle(opt.id)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    active
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/60 dark:bg-slate-800/60'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} text-white font-bold text-sm`}
                    aria-hidden="true"
                  >
                    {opt.example}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold ${
                      active
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {opt.labelEn}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Figure mode — grouped by role */}
      {mode === 'figure' && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
            Character choose karo
          </label>
          <div
            role="radiogroup"
            aria-label="Choose avatar figure"
            className="grid grid-cols-4 sm:grid-cols-8 gap-2"
          >
            {FIGURES.map((fig) => {
              const active = figure === fig.id
              const Fig = fig.Component
              return (
                <button
                  key={fig.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`${fig.labelEn} — ${fig.labelHi}`}
                  title={`${fig.labelEn} · ${fig.labelHi}`}
                  onClick={() => setFigure(fig.id)}
                  className={`relative aspect-square rounded-xl border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                    active
                      ? 'border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-800'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-[10px] overflow-hidden bg-gradient-to-br ${theme.gradient}`}
                  >
                    <Fig className="w-full h-full" />
                  </div>
                  {active && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg"
                      aria-hidden="true"
                    >
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {/* Selected label */}
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 text-center">
            <span className="font-semibold">{FIGURE_MAP[figure].labelEn}</span>
            {' · '}
            <span lang="hi">{FIGURE_MAP[figure].labelHi}</span>
          </p>
        </div>
      )}

      {/* Theme picker */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
          Background color
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {AVATAR_THEMES.map((t) => {
            const active = themeId === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setThemeId(t.id)}
                aria-pressed={active}
                aria-label={`Theme: ${t.name}`}
                title={t.name}
                className={`relative aspect-square rounded-xl bg-gradient-to-br ${t.gradient} transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
                  active
                    ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105'
                    : 'hover:scale-105'
                }`}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check
                      className="w-5 h-5 text-white drop-shadow-md"
                      aria-hidden="true"
                    />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Save ho raha...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" aria-hidden="true" />
              {isDirty ? 'Save changes' : 'Saved'}
            </>
          )}
        </button>
        {isDirty && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Reset
          </button>
        )}
        {isDirty && (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium ml-auto">
            ● Unsaved changes
          </span>
        )}
      </div>
    </section>
  )
}