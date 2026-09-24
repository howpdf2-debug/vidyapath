'use client'

import {
  getTheme,
  getStyle,
  getDisplayString,
  getFigure,
  DEFAULT_STYLE,
  DEFAULT_THEME,
  type AvatarStyle,
} from '@/lib/avatar'
import { FIGURE_MAP, type FigureId } from '@/lib/avatar-figures'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface UserAvatarProps {
  name?: string | null
  email?: string | null
  style?: AvatarStyle | null
  themeId?: string | null
  figure?: string | null
  skinTone?: string
  size?: AvatarSize
  className?: string
  ariaLabel?: string
}

const SIZES: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px] rounded-md',
  sm: 'w-8 h-8 text-xs rounded-lg',
  md: 'w-12 h-12 text-base rounded-xl',
  lg: 'w-16 h-16 text-xl rounded-2xl',
  xl: 'w-20 h-20 text-3xl rounded-2xl',
}

export function UserAvatar({
  name,
  email,
  style,
  themeId,
  figure,
  skinTone = '#F5C9A0',
  size = 'md',
  className = '',
  ariaLabel,
}: UserAvatarProps) {
  const resolvedStyle = getStyle(style ?? DEFAULT_STYLE)
  const theme = getTheme(themeId ?? DEFAULT_THEME)
  const label = ariaLabel ?? `Avatar for ${name || email || 'user'}`

  // ─── Figure mode
  if (resolvedStyle === 'figure') {
    const figureId = getFigure(figure)
    const Fig = FIGURE_MAP[figureId].Component

    return (
      <div
        className={`inline-flex items-center justify-center bg-gradient-to-br ${theme.gradient} overflow-hidden shadow-md flex-shrink-0 select-none ${SIZES[size]} ${className}`}
        role="img"
        aria-label={label}
      >
        <Fig className="w-full h-full" skinTone={skinTone} />
      </div>
    )
  }

  // ─── Text mode
  const display = getDisplayString(
    name,
    email,
    resolvedStyle as Exclude<AvatarStyle, 'figure'>
  )

  return (
    <div
      className={`inline-flex items-center justify-center bg-gradient-to-br ${theme.gradient} text-white font-bold shadow-md flex-shrink-0 select-none ${SIZES[size]} ${className}`}
      role="img"
      aria-label={label}
    >
      {display}
    </div>
  )
}