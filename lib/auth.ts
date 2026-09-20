// lib/auth.ts
// ═══════════════════════════════════════════════════════
// CLIENT-SAFE HELPERS ONLY
// ⚠️ NO next/headers imports — safe for client components
// For server-side session, use @/lib/auth-server
// ═══════════════════════════════════════════════════════

// ==================== VALIDATION ====================

export type PasswordValidationResult = {
  valid: boolean
  errors: string[]
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
  }
}

export function validatePasswordStrength(
  password: string
): PasswordValidationResult {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }

  const errors: string[] = []
  if (!checks.length) errors.push('At least 8 characters required')
  if (!checks.uppercase) errors.push('At least 1 uppercase letter required (A-Z)')
  if (!checks.lowercase) errors.push('At least 1 lowercase letter required (a-z)')
  if (!checks.number) errors.push('At least 1 number required (0-9)')

  return {
    valid: Object.values(checks).every(Boolean),
    errors,
    checks,
  }
}

export function validateEmail(email: string): {
  valid: boolean
  error?: string
} {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  return { valid: true }
}

export function validateName(name: string): {
  valid: boolean
  error?: string
} {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' }
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' }
  }
  if (name.trim().length > 100) {
    return { valid: false, error: 'Name is too long' }
  }
  return { valid: true }
}

export function validatePasswordMatch(
  password: string,
  confirm: string
): { valid: boolean; error?: string } {
  if (password !== confirm) {
    return { valid: false, error: 'Passwords do not match' }
  }
  return { valid: true }
}

// ==================== HELPERS ====================

export function isEmailAlreadyRegistered(user: any): boolean {
  if (!user) return false
  if (!user.identities) return false
  return Array.isArray(user.identities) && user.identities.length === 0
}

export function parseAuthError(message: string): {
  type: 'email_exists' | 'weak_password' | 'rate_limit' | 'invalid_email' | 'unknown'
  friendlyMessage: string
} {
  const msg = message.toLowerCase()

  if (
    msg.includes('already registered') ||
    msg.includes('already exists') ||
    msg.includes('user already')
  ) {
    return {
      type: 'email_exists',
      friendlyMessage: 'This email is already registered',
    }
  }

  if (msg.includes('password') && msg.includes('weak')) {
    return {
      type: 'weak_password',
      friendlyMessage: 'Password is too weak. Use a stronger one.',
    }
  }

  if (msg.includes('rate limit') || msg.includes('too many')) {
    return {
      type: 'rate_limit',
      friendlyMessage: 'Too many attempts. Please try again later.',
    }
  }

  if (msg.includes('invalid email') || msg.includes('valid email')) {
    return {
      type: 'invalid_email',
      friendlyMessage: 'Please enter a valid email address',
    }
  }

  return {
    type: 'unknown',
    friendlyMessage: message,
  }
}

// ==================== DISPLAY HELPERS ====================

export function getUserDisplayName(user: any): string {
  if (!user) return 'User'

  const firstName = user.user_metadata?.first_name?.trim()
  if (firstName) return firstName

  const fullName = user.user_metadata?.full_name?.trim()
  if (fullName) {
    const parts = fullName.split(/\s+/)
    return parts[0] || fullName
  }

  const email = user.email || ''
  const prefix = email.split('@')[0]
  if (prefix) {
    return prefix.charAt(0).toUpperCase() + prefix.slice(1)
  }

  return 'User'
}

export function getUserFullName(user: any): string {
  if (!user) return 'User'

  const fullName = user.user_metadata?.full_name?.trim()
  if (fullName) return fullName

  const firstName = user.user_metadata?.first_name?.trim()
  if (firstName) return firstName

  const email = user.email || ''
  const prefix = email.split('@')[0]
  if (prefix) {
    return prefix.charAt(0).toUpperCase() + prefix.slice(1)
  }

  return 'User'
}

export function getUserInitial(user: any): string {
  if (!user) return 'U'
  const name = getUserDisplayName(user)
  return name.charAt(0).toUpperCase() || 'U'
}

export function isUserConfirmed(user: any): boolean {
  if (!user) return false
  return Boolean(user.email_confirmed_at || user.confirmed_at)
}