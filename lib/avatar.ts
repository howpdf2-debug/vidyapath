// lib/avatar.ts
// Avatar constants + helpers. Single source for picker + display.

import {
  FIGURE_LIST,
  DEFAULT_FIGURE,
  isFigureId,
  type FigureId,
} from './avatar-figures'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
export type AvatarStyle =
  | 'initials'
  | 'first_letter'
  | 'first_name'
  | 'figure'

export interface AvatarTheme {
  id: string
  name: string
  gradient: string
  group: 'brand' | 'nature' | 'warm' | 'cool'
}

// ═══════════════════════════════════════════════════════════════
// 12 gradients in 4 groups
// ═══════════════════════════════════════════════════════════════
export const AVATAR_THEMES: AvatarTheme[] = [
  { id: 'indigo',   name: 'Indigo',   gradient: 'from-indigo-500 to-purple-500', group: 'brand' },
  { id: 'violet',   name: 'Violet',   gradient: 'from-violet-500 to-fuchsia-500', group: 'brand' },
  { id: 'midnight', name: 'Midnight', gradient: 'from-slate-700 to-indigo-700',   group: 'brand' },
  { id: 'ocean',    name: 'Ocean',    gradient: 'from-sky-500 to-blue-600',       group: 'nature' },
  { id: 'forest',   name: 'Forest',   gradient: 'from-emerald-500 to-green-600',  group: 'nature' },
  { id: 'mint',     name: 'Mint',     gradient: 'from-teal-400 to-emerald-500',   group: 'nature' },
  { id: 'sunset',   name: 'Sunset',   gradient: 'from-orange-500 to-pink-500',    group: 'warm' },
  { id: 'fire',     name: 'Fire',     gradient: 'from-red-500 to-orange-500',     group: 'warm' },
  { id: 'amber',    name: 'Amber',    gradient: 'from-amber-500 to-yellow-500',   group: 'warm' },
  { id: 'rose',     name: 'Rose',     gradient: 'from-rose-500 to-pink-600',      group: 'cool' },
  { id: 'candy',    name: 'Candy',    gradient: 'from-pink-500 to-fuchsia-500',   group: 'cool' },
  { id: 'slate',    name: 'Slate',    gradient: 'from-slate-500 to-gray-600',     group: 'cool' },
]

export const DEFAULT_STYLE: AvatarStyle = 'initials'
export const DEFAULT_THEME = 'indigo'
export { DEFAULT_FIGURE }

// ═══════════════════════════════════════════════════════════════
// Lookups
// ═══════════════════════════════════════════════════════════════
export function getTheme(id: string | undefined | null): AvatarTheme {
  if (!id) return AVATAR_THEMES[0]
  return AVATAR_THEMES.find((t) => t.id === id) ?? AVATAR_THEMES[0]
}

export function getStyle(id: string | undefined | null): AvatarStyle {
  if (
    id === 'first_letter' ||
    id === 'first_name' ||
    id === 'initials' ||
    id === 'figure'
  ) {
    return id
  }
  return DEFAULT_STYLE
}

export function getFigure(id: string | undefined | null): FigureId {
  return isFigureId(id) ? id : DEFAULT_FIGURE
}

// ═══════════════════════════════════════════════════════════════
// Text display string (for text-based styles)
// ═══════════════════════════════════════════════════════════════
export function getDisplayString(
  name: string | null | undefined,
  email: string | null | undefined,
  style: Exclude<AvatarStyle, 'figure'>
): string {
  const source =
    (name && name.trim()) || (email && email.split('@')[0]) || 'User'
  const clean = source.trim()
  if (!clean) return '?'

  const words = clean.split(/\s+/).filter(Boolean)

  switch (style) {
    case 'first_letter':
      return words[0]?.charAt(0)?.toUpperCase() || '?'
    case 'first_name': {
      const first = words[0] ?? ''
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
      return words[0]?.charAt(0)?.toUpperCase() || '?'
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Random helpers (for shuffle)
// ═══════════════════════════════════════════════════════════════
export function randomTheme(): AvatarTheme {
  return AVATAR_THEMES[Math.floor(Math.random() * AVATAR_THEMES.length)]
}

export function randomStyle(): Exclude<AvatarStyle, 'figure'> {
  const styles: Exclude<AvatarStyle, 'figure'>[] = [
    'initials',
    'first_letter',
    'first_name',
  ]
  return styles[Math.floor(Math.random() * styles.length)]
}

export function randomFigure(): FigureId {
  return FIGURE_LIST[
    Math.floor(Math.random() * FIGURE_LIST.length)
  ] as FigureId
}