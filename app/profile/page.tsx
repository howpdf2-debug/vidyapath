'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  Mail,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Save,
  Shield,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { UserAvatar } from '@/components/UserAvatar'
import { AvatarPicker } from '@/components/AvatarPicker'
import { getStyle } from '@/lib/avatar'

// ═══════════════════════════════════════════════════════════════
// Password strength (mirrors signup page)
// ═══════════════════════════════════════════════════════════════
function validatePasswordStrength(pw: string) {
  const checks = {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
  }
  const valid = Object.values(checks).every(Boolean)
  return { valid, checks }
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [fetching, setFetching] = useState(true)

  // ─── Form state
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // ─── UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const router = useRouter()

  // ─── Auth listener + initial fetch
  useEffect(() => {
    let active = true

    const load = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (!active) return

      if (error || !data.user) {
        router.replace('/login?next=/profile')
        return
      }

      setUser(data.user)
      setName(
        typeof data.user.user_metadata?.full_name === 'string'
          ? data.user.user_metadata.full_name
          : ''
      )
      setFetching(false)
    }

    load()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return
        if (!session?.user) {
          router.replace('/login?next=/profile')
          return
        }
        setUser(session.user)
      }
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [router])

  // ─── Derived values
  const isVerified = Boolean(
    user?.email_confirmed_at || user?.confirmed_at
  )
  const savedName =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : ''
  const nameChanged = name.trim() !== savedName.trim()

  const pwValidation = validatePasswordStrength(password)
  const pwMismatch = password.length > 0 && password !== confirm
  const passwordFormVisible = password.length > 0

  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>
  const avatarStyle = getStyle(
    typeof meta.avatar_style === 'string' ? meta.avatar_style : null
  )
  const avatarTheme =
    typeof meta.avatar_theme === 'string' ? meta.avatar_theme : null
  const displayName = savedName || user?.email?.split('@')[0] || 'User'

  // ─── Handlers
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !nameChanged || savingName) return

    const trimmed = name.trim()
    if (trimmed.length < 2) {
      toast.error('Naam kam se kam 2 character ka hona chahiye')
      return
    }
    if (trimmed.length > 80) {
      toast.error('Naam 80 character se chhota rakho')
      return
    }

    setSavingName(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      })
      if (error) {
        console.error('[profile] name update:', error)
        toast.error('Naam save nahi hua. Dobara try karo')
        return
      }
      toast.success('Naam update ho gaya ✓')

      // Refresh user to get new metadata
      const { data } = await supabase.auth.getUser()
      if (data.user) setUser(data.user)
    } catch (err) {
      console.error('[profile] name unexpected:', err)
      toast.error('Network error. Dobara try karo')
    } finally {
      setSavingName(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || savingPassword) return

    if (!pwValidation.valid) {
      toast.error('Password strong nahi hai — sabhi conditions poori karo')
      return
    }
    if (pwMismatch) {
      toast.error('Passwords match nahi kar rahe')
      return
    }

    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        console.error('[profile] password update:', error)
        // Check specific error cases
        const msg = error.message.toLowerCase()
        if (msg.includes('same') || msg.includes('recent')) {
          toast.error('Yeh password pehle use ho chuka hai')
        } else {
          toast.error('Password update nahi hua. Dobara try karo')
        }
        return
      }
      toast.success('Password update ho gaya 🔒')
      setPassword('')
      setConfirm('')
      setShowPassword(false)
      setShowConfirm(false)
    } catch (err) {
      console.error('[profile] password unexpected:', err)
      toast.error('Network error. Dobara try karo')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await supabase.auth.signOut()
      toast.success('Logout ho gaya')
      router.replace('/')
    } catch {
      setLoggingOut(false)
      toast.error('Logout fail hua')
    }
  }

  // ─── Loading skeleton
  if (fetching || !user) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-16">
      {/* ═══════ PAGE HEADER ═══════ */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-fuchsia-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-center gap-4">
          <div className="flex-shrink-0 rounded-2xl border-2 border-white/30 overflow-hidden shadow-lg">
            <UserAvatar
              name={displayName}
              email={user.email ?? undefined}
              style={avatarStyle}
              themeId={avatarTheme}
              size="xl"
              ariaLabel={`Avatar for ${displayName}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">
              {displayName}
            </h1>
            <p className="text-white/80 text-sm truncate mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              {user.email}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-400/20 backdrop-blur-sm text-xs font-semibold border border-emerald-300/40">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  Email verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 backdrop-blur-sm text-xs font-semibold border border-amber-300/40">
                  <AlertCircle className="w-3 h-3" aria-hidden="true" />
                  Email unverified
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-medium hover:bg-white/30 transition disabled:opacity-50 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="w-4 h-4" aria-hidden="true" />
            )}
            Logout
          </button>
        </div>
      </header>

      {/* ═══════ AVATAR PICKER ═══════ */}
      <AvatarPicker />

      {/* ═══════ NAME SECTION ═══════ */}
      <section
        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6"
        aria-labelledby="name-section-heading"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Mail className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2
            id="name-section-heading"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            Naam
          </h2>
        </div>

        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label
              htmlFor="profile-email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user.email ?? ''}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed text-sm"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">
              Email change nahi ho sakta
            </p>
          </div>

          <div>
            <label
              htmlFor="profile-name"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Raj Kumar"
              autoComplete="name"
              maxLength={80}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={!nameChanged || savingName}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {savingName ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Save ho raha...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" aria-hidden="true" />
                  {nameChanged ? 'Save naam' : 'Saved'}
                </>
              )}
            </button>
            {nameChanged && (
              <button
                type="button"
                onClick={() => setName(savedName)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Cancel
              </button>
            )}
            {nameChanged && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium ml-auto">
                ● Unsaved
              </span>
            )}
          </div>
        </form>
      </section>

      {/* ═══════ PASSWORD SECTION ═══════ */}
      <section
        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6"
        aria-labelledby="password-section-heading"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Shield className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2
            id="password-section-heading"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            Password
          </h2>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-4">
          <div>
            <label
              htmlFor="profile-password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="profile-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Password strength indicators */}
          {passwordFormVisible && (
            <div className="space-y-1.5 text-xs">
              <Requirement met={pwValidation.checks.length} label="At least 8 characters" />
              <Requirement
                met={pwValidation.checks.uppercase}
                label="At least 1 uppercase letter (A-Z)"
              />
              <Requirement
                met={pwValidation.checks.lowercase}
                label="At least 1 lowercase letter (a-z)"
              />
              <Requirement met={pwValidation.checks.number} label="At least 1 number (0-9)" />
            </div>
          )}

          {/* Confirm password (only when password typed) */}
          {passwordFormVisible && (
            <div>
              <label
                htmlFor="profile-confirm"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="profile-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border bg-white/60 dark:bg-slate-900/60 focus:ring-2 focus:ring-indigo-500 outline-none text-sm ${
                    pwMismatch
                      ? 'border-rose-300 dark:border-rose-700'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {pwMismatch && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                  Passwords match nahi kar rahe
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={
                !pwValidation.valid ||
                pwMismatch ||
                password.length === 0 ||
                savingPassword
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {savingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Update ho raha...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  Update password
                </>
              )}
            </button>
            {passwordFormVisible && (
              <button
                type="button"
                onClick={() => {
                  setPassword('')
                  setConfirm('')
                  setShowPassword(false)
                  setShowConfirm(false)
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Requirement indicator (reused from signup)
// ═══════════════════════════════════════════════════════════════
function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2
          className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0"
          aria-hidden="true"
        />
      ) : (
        <XCircle
          className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0"
          aria-hidden="true"
        />
      )}
      <span
        className={
          met
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-slate-500 dark:text-slate-400'
        }
      >
        {label}
      </span>
    </div>
  )
}