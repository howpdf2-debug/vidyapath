'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Shuffle, Check, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { UserAvatar } from '@/components/UserAvatar'
import {
  AVATAR_THEMES,
  getTheme,
  getStyle,
  randomTheme,
  randomStyle,
  DEFAULT_STYLE,
  DEFAULT_THEME,
  type AvatarStyle,
} from '@/lib/avatar'

// ─────────────────────────────────────────────────────────────
// Style option pills
// ─────────────────────────────────────────────────────────────
const STYLE_OPTIONS: { id: AvatarStyle; label: string; example: string }[] = [
  { id: 'initials', label: 'Initials', example: 'RK' },
  { id: 'first_letter', label: 'First letter', example: 'R' },
  { id: 'first_name', label: 'First name', example: 'Raj' },
]

export function AvatarPicker() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Draft state (not yet saved)
  const [style, setStyle] = useState<AvatarStyle>(DEFAULT_STYLE)
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME)

  // Saved state (from server)
  const [savedStyle, setSavedStyle] = useState<AvatarStyle>(DEFAULT_STYLE)
  const [savedThemeId, setSavedThemeId] = useState<string>(DEFAULT_THEME)

  // ─── Load user + prefs
  useEffect(() => {
    let active = true

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!active) return

      setUser(user)

      const meta = (user?.user_metadata ?? {}) as Record<string, unknown>
      const s = getStyle(
        typeof meta.avatar_style === 'string' ? meta.avatar_style : null
      )
      const t =
        typeof meta.avatar_theme === 'string' ? meta.avatar_theme : DEFAULT_THEME

      setStyle(s)
      setThemeId(t)
      setSavedStyle(s)
      setSavedThemeId(t)
      setLoading(false)
    }

    load()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e, session) => {
        if (active) setUser(session?.user ?? null)
      }
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const isDirty = style !== savedStyle || themeId !== savedThemeId

  const handleShuffle = () => {
    const rt = randomTheme()
    const rs = randomStyle()
    setThemeId(rt.id)
    setStyle(rs)
  }

  const handleReset = () => {
    setStyle(DEFAULT_STYLE)
    setThemeId(DEFAULT_THEME)
  }

  const handleSave = async () => {
    if (!user || !isDirty || saving) return
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_style: style,
          avatar_theme: themeId,
        },
      })
      if (error) {
        console.error('[avatar] save failed:', error)
        toast.error('Save nahi hua. Dobara try karo')
        return
      }
      setSavedStyle(style)
      setSavedThemeId(themeId)
      toast.success('Avatar save ho gaya 🎨')
    } catch (err) {
      console.error('[avatar] unexpected:', err)
      toast.error('Network error. Dobara try karo')
    } finally {
      setSaving(false)
    }
  }

  // ─── Loading skeleton
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
            Naam aur color choose karo — jaise tum chaaho
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

      {/* Live preview (main) */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex-shrink-0">
          <UserAvatar
            name={name}
            email={email}
            style={style}
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
            {theme.name} · {STYLE_OPTIONS.find((s) => s.id === style)?.label}
          </p>
        </div>
      </div>

      {/* Style picker */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
          Naam kaise dikhe
        </label>
        <div className="grid grid-cols-3 gap-2">
          {STYLE_OPTIONS.map((opt) => {
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
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Theme picker (12 gradients) */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
          Color theme
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

      {/* Multi-context preview */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
          Kaise dikhega
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Header preview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
              Header
            </p>
            <div className="flex items-center gap-2">
              <UserAvatar
                name={name}
                email={email}
                style={style}
                themeId={themeId}
                size="sm"
                ariaLabel=""
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                {name || 'You'}
              </span>
            </div>
          </div>

          {/* Comment preview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
              Comment
            </p>
            <div className="flex items-start gap-2">
              <UserAvatar
                name={name}
                email={email}
                style={style}
                themeId={themeId}
                size="sm"
                ariaLabel=""
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {name || 'You'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Great chapter! 👍
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
              Dashboard
            </p>
            <div className="flex items-center gap-2">
              <UserAvatar
                name={name}
                email={email}
                style={style}
                themeId={themeId}
                size="md"
                ariaLabel=""
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Namaste, {name?.split(' ')[0] || 'You'} 👋
                </p>
              </div>
            </div>
          </div>
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
            Reset to default
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