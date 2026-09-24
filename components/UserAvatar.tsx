// components/UserAvatar.tsx
// Reusable avatar with initials + customizable gradient.
// Reads style/theme from user_metadata or explicit props.

import {
  getTheme,
  getStyle,
  getDisplayString,
  DEFAULT_STYLE,
  DEFAULT_THEME,
  type AvatarStyle,
} from '@/lib/avatar'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface UserAvatarProps {
  name?: string | null
  email?: string | null
  /** Override style (else reads from user_metadata via parent) */
  style?: AvatarStyle | null
  /** Override theme id (else reads from user_metadata via parent) */
  themeId?: string | null
  size?: AvatarSize
  className?: string
  /** For a11y — usually "Avatar for [name]" */
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
  size = 'md',
  className = '',
  ariaLabel,
}: UserAvatarProps) {
  const resolvedStyle = getStyle(style ?? DEFAULT_STYLE)
  const theme = getTheme(themeId ?? DEFAULT_THEME)
  const display = getDisplayString(name, email, resolvedStyle)
  const label = ariaLabel ?? `Avatar for ${name || email || 'user'}`

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