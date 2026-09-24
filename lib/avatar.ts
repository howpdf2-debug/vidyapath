// lib/avatar.ts
// Avatar theme + style constants.
// Single source of truth for both UserAvatar and AvatarPicker.

export type AvatarStyle = 'initials' | 'first_letter' | 'first_name'

export interface AvatarTheme {
  id: string
  name: string
  gradient: string  // Tailwind gradient classes
  group: 'brand' | 'nature' | 'warm' | 'cool'
}

// ═══════════════════════════════════════════════════════════════
// 12 gradients in 4 mood groups
// ═══════════════════════════════════════════════════════════════
export const AVATAR_THEMES: AvatarTheme[] = [
  // Brand
  { id: 'indigo',   name: 'Indigo',   gradient: 'from-indigo-500 to-purple-500', group: 'brand' },
  { id: 'violet',   name: 'Violet',   gradient: 'from-violet-500 to-fuchsia-500', group: 'brand' },
  { id: 'midnight', name: 'Midnight', gradient: 'from-slate-700 to-indigo-700',   group: 'brand' },
  // Nature
  { id: 'ocean',    name: 'Ocean',    gradient: 'from-sky-500 to-blue-600',       group: 'nature' },
  { id: 'forest',   name: 'Forest',   gradient: 'from-emerald-500 to-green-600',  group: 'nature' },
  { id: 'mint',     name: 'Mint',     gradient: 'from-teal-400 to-emerald-500',   group: 'nature' },
  // Warm
  { id: 'sunset',   name: 'Sunset',   gradient: 'from-orange-500 to-pink-500',    group: 'warm' },
  { id: 'fire',     name: 'Fire',     gradient: 'from-red-500 to-orange-500',     group: 'warm' },
  { id: 'amber',    name: 'Amber',    gradient: 'from-amber-500 to-yellow-500',   group: 'warm' },
  // Cool
  { id: 'rose',     name: 'Rose',     gradient: 'from-rose-500 to-pink-600',      group: 'cool' },
  { id: 'candy',    name: 'Candy',    gradient: 'from-pink-500 to-fuchsia-500',   group: 'cool' },
  { id: 'slate',    name: 'Slate',    gradient: 'from-slate-500 to-gray-600',     group: 'cool' },
]

export const DEFAULT_STYLE: AvatarStyle = 'initials'
export const DEFAULT_THEME = 'indigo'

// ═══════════════════════════════════════════════════════════════
// Theme lookup helpers
// ═══════════════════════════════════════════════════════════════
export function getTheme(id: string | undefined | null): AvatarTheme {
  if (!id) return AVATAR_THEMES[0]
  return AVATAR_THEMES.find((t) => t.id === id) ?? AVATAR_THEMES[0]
}

export function getStyle(id: string | undefined | null): AvatarStyle {
  if (id === 'first_letter' || id === 'first_name' || id === 'initials') {
    return id
  }
  return DEFAULT_STYLE
}

// ═══════════════════════════════════════════════════════════════
// Display name → display string (with Unicode safety)
// ═══════════════════════════════════════════════════════════════
export function getDisplayString(
  name: string | null | undefined,
  email: string | null | undefined,
  style: AvatarStyle
): string {
  // Fallback name source
  const source =
    (name && name.trim()) ||
    (email && email.split('@')[0]) ||
    'User'

  const clean = source.trim()
  if (!clean) return '?'

  const words = clean.split(/\s+/).filter(Boolean)

  switch (style) {
    case 'first_letter': {
      return words[0]?.charAt(0)?.toUpperCase() || '?'
    }
    case 'first_name': {
      const first = words[0] ?? ''
      // Take up to 3 chars (works for Hindi too — uses Array.from for surrogate pairs)
      const chars = Array.from(first).slice(0, 3).join('')
      return chars || '?'
    }
    case 'initials':
    default: {
      if (words.length >= 2) {
        const first = words[0]?.charAt(0) ?? ''
        const last = words[words.length - 1]?.charAt(0) ?? ''
        return (first + last).toUpperCase() || '?'
      }
      // Single word → first char
      return words[0]?.charAt(0)?.toUpperCase() || '?'
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Random for shuffle
// ═══════════════════════════════════════════════════════════════
export function randomTheme(): AvatarTheme {
  return AVATAR_THEMES[Math.floor(Math.random() * AVATAR_THEMES.length)]
}

export function randomStyle(): AvatarStyle {
  const styles: AvatarStyle[] = ['initials', 'first_letter', 'first_name']
  return styles[Math.floor(Math.random() * styles.length)]
}