// lib/avatar-figures.tsx
// 8 SVG portrait figures — 2 gender × 4 roles.
// Geometric style, tuned for small sizes (24px+).
// Figure occupies ~78% of viewBox; gradient shows as backdrop.
// No external deps, tree-shakeable, dark-mode neutral.

import type { ComponentType } from 'react'

export interface FigureProps {
  className?: string
  skinTone?: string
}

// ─────────────────────────────────────────────────────────────
// Shared palette (works on light + dark)
// ─────────────────────────────────────────────────────────────
const HAIR_DARK = '#1F2937'
const HAIR_BROWN = '#78350F'
const HAIR_BLACK = '#0F172A'
const EYE_COLOR = '#111827'
const MOUTH_COLOR = '#7F1D1D'

// ─────────────────────────────────────────────────────────────
// Common sub-shapes (reduced, tested proportions)
// Figure normalized: head cy=38, r=16; body from y=62
// ─────────────────────────────────────────────────────────────
function Eyes() {
  return (
    <>
      <circle cx="44" cy="40" r="1.6" fill={EYE_COLOR} />
      <circle cx="56" cy="40" r="1.6" fill={EYE_COLOR} />
    </>
  )
}

function Smile() {
  return (
    <path
      d="M 45 47 Q 50 51 55 47"
      stroke={MOUTH_COLOR}
      strokeWidth="1.4"
      strokeLinecap="round"
      fill="none"
    />
  )
}

// ═══════════════════════════════════════════════════════════════
// BOY STUDENT
// ═══════════════════════════════════════════════════════════════
export function BoyStudent({
  className = '',
  skinTone = '#F5C9A0',
}: FigureProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Body */}
      <path
        d="M 32 72 Q 32 62 40 60 L 60 60 Q 68 62 68 72 L 68 92 L 32 92 Z"
        fill="#3B82F6"
      />
      {/* Collar V */}
      <path d="M 43 60 L 50 70 L 57 60 L 53 61 L 50 66 L 47 61 Z" fill="#1D4ED8" />
      {/* Backpack straps */}
      <rect x="40" y="64" width="2.5" height="28" fill="#DC2626" />
      <rect x="57.5" y="64" width="2.5" height="28" fill="#DC2626" />
      {/* Neck */}
      <rect x="45" y="52" width="10" height="10" rx="2" fill={skinTone} />
      {/* Head */}
      <circle cx="50" cy="38" r="16" fill={skinTone} />
      {/* Hair — short side-parted */}
      <path
        d="M 34 38 Q 34 22 50 22 Q 66 22 66 38 Q 63 30 50 28 Q 37 30 34 38 Z"
        fill={HAIR_DARK}
      />
      <Eyes />
      <Smile />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// GIRL STUDENT
// ═══════════════════════════════════════════════════════════════
export function GirlStudent({
  className = '',
  skinTone = '#F5C9A0',
}: FigureProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Body */}
      <path
        d="M 32 72 Q 32 62 40 60 L 60 60 Q 68 62 68 72 L 68 92 L 32 92 Z"
        fill="#EC4899"
      />
      <path d="M 43 60 L 50 70 L 57 60 L 53 61 L 50 66 L 47 61 Z" fill="#BE185D" />
      {/* Straps */}
      <rect x="40" y="64" width="2.5" height="28" fill="#7C3AED" />
      <rect x="57.5" y="64" width="2.5" height="28" fill="#7C3AED" />
      {/* Neck */}
      <rect x="45" y="52" width="10" height="10" rx="2" fill={skinTone} />
      {/* Head */}
      <circle cx="50" cy="38" r="16" fill={skinTone} />
      {/* Hair — long side-swept */}
      <path
        d="M 34 38 Q 34 22 50 22 Q 66 22 66 38 Q 63 30 50 28 Q 37 30 34 38 Z"
        fill={HAIR_BROWN}
      />
      <path d="M 34 36 L 33 58 Q 33 62 37 61 L 38 58 L 38 40 Z" fill={HAIR_BROWN} />
      <path d="M 66 36 L 67 58 Q 67 62 63 61 L 62 58 L 62 40 Z" fill={HAIR_BROWN} />
      <Eyes />
      <Smile />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// BOY SCIENTIST
// ═══════════════════════════════════════════════════════════════
export function BoyScientist({
  className = '',
  skinTone = '#F5C9A0',
}: FigureProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Lab coat */}
      <path
        d="M 30 72 Q 30 60 40 58 L 60 58 Q 70 60 70 72 L 70 92 L 30 92 Z"
        fill="#F8FAFC"
      />
      <path d="M 43 58 L 50 74 L 57 58 L 53 60 L 50 68 L 47 60 Z" fill="#CBD5E1" />
      <line x1="50" y1="74" x2="50" y2="92" stroke="#CBD5E1" strokeWidth="0.8" />
      {/* Neck */}
      <rect x="45" y="52" width="10" height="10" rx="2" fill={skinTone} />
      {/* Head */}
      <circle cx="50" cy="38" r="16" fill={skinTone} />
      {/* Hair */}
      <path
        d="M 34 38 Q 34 22 50 22 Q 66 22 66 38 Q 63 30 50 28 Q 37 30 34 38 Z"
        fill={HAIR_DARK}
      />
      {/* Goggles on forehead */}
      <circle cx="43" cy="28" r="5" fill="#94A3B8" stroke="#334155" strokeWidth="1.2" />
      <circle cx="57" cy="28" r="5" fill="#94A3B8" stroke="#334155" strokeWidth="1.2" />
      <line x1="48" y1="28" x2="52" y2="28" stroke="#334155" strokeWidth="1.2" />
      <Eyes />
      <Smile />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// GIRL SCIENTIST
// ═══════════════════════════════════════════════════════════════
export function GirlScientist({
  className = '',
  skinTone = '#F5C9A0',
}: FigureProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Lab coat */}
      <path
        d="M 30 72 Q 30 60 40 58 L 60 58 Q 70 60 70 72 L 70 92 L 30 92 Z"
        fill="#F8FAFC"
      />
      <path d="M 43 58 L 50 74 L 57 58 L 53 60 L 50 68 L 47 60 Z" fill="#CBD5E1" />
      <line x1="50" y1="74" x2="50" y2="92" stroke="#CBD5E1" strokeWidth="0.8" />
      {/* Neck */}
      <rect x="45" y="52" width="10" height="10" rx="2" fill={skinTone} />
      {/* Bun */}
      <circle cx="50" cy="20" r="5.5" fill={HAIR_BROWN} />
      {/* Head */}
      <circle cx="50" cy="38" r="16" fill={skinTone} />
      {/* Hair */}
      <path
        d="M 34 38 Q 34 22 50 22 Q 66 22 66 38 Q 63 30 50 28 Q 37 30 34 38 Z"
        fill={HAIR_BROWN}
      />
      <path d="M 34 36 L 33 52 Q 33 56 37 55 L 38 52 L 38 40 Z" fill={HAIR_BROWN} />
      <path d="M 66 36 L 67 52 Q 67 56 63 55 L 62 52 L 62 40 Z" fill={HAIR_BROWN} />
      {/* Goggles */}
      <circle cx="43" cy="28" r="5" fill="#94A3B8" stroke="#334155" strokeWidth="1.2" />
      <circle cx="57" cy="28" r="5" fill="#94A3B8" stroke="#334155" strokeWidth="1.2" />
      <line x1="48" y1="28" x2="52" y2="28" stroke="#334155" strokeWidth="1.2" />
      <Eyes />
      <Smile />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// BOY PROFESSOR
// ═══════════════════════════════════════════════════════════════
export function BoyProfessor({
  className = '',
  skinTone = '#F5C9A0',
}: FigureProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Suit */}
      <path
        d="M 30 72 Q 30 60 40 58 L 60 58 Q 70 60 70 72 L 70 92 L 30 92 Z"
        fill="#1E293B"
      />
      {/* Shirt V */}
      <path d="M 43 58 L 50 74 L 57 58 Z" fill="#F1F5F9" />
      {/* Tie */}
      <path d="M 48 62 L 52 62 L 52.5 68 L 50 84 L 47.5 68 Z" fill="#B91C1C" />
      {/* Lapels */}
      <path d="M 43 58 L 47 60 L 48 62 L 45 68 L 42 60 Z" fill="#334155" />
      <path d="M 57 58 L 53 60 L 52 62 L 55 68 L 58 60 Z" fill="#334155" />
      {/* Neck */}
      <rect x="45" y="52" width="10" height="10" rx="2" fill={skinTone} />
      {/* Head */}
      <circle cx="50" cy="38" r="16" fill={skinTone} />
      {/* Hair */}
      <path
        d="M 34 38 Q 34 22 50 22 Q 66 22 66 38 Q 63 30 50 28 Q 37 30 34 38 Z"
        fill={HAIR_DARK}
      />
      {/* Glasses */}
      <rect x="40" y="37" width="8" height="6.5" rx="1.5" fill="none" stroke="#0F172A" strokeWidth="1.3" />
      <rect x="52" y="37" width="8" height="6.5" rx="1.5" fill="none" stroke="#0F172A" strokeWidth="1.3" />
      <line x1="48" y1="40" x2="52" y2="40" stroke="#0F172A" strokeWidth="1.3" />
      <Eyes />
      <Smile />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// GIRL PROFESSOR
// ═══════════════════════════════════════════════════════════════
export function GirlProfessor({
  className = '',
  skinTone = '#F5C9A0',
}: FigureProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Blazer */}
      <path
        d="M 30 72 Q 30 60 40 58 L 60 58 Q 70 60 70 72 L 70 92 L 30 92 Z"
        fill="#1E293B"
      />
      {/* Blouse V */}
      <path d="M 43 58 L 50 74 L 57 58 Z" fill="#F1F5F9" />
      {/* Lapels */}
      <path d="M 43 58 L 47 60 L 48 62 L 45 68 L 42 60 Z" fill="#334155" />
      <path d="M 57 58 L 53 60 L 52 62 L 55 68 L 58 60 Z" fill="#334155" />
      {/* Neck */}
      <rect x="45" y="52" width="10" height="10" rx="2" fill={skinTone} />
      {/* Bun */}
      <circle cx="50" cy="20" r="5.5" fill={HAIR_BROWN} />
      {/* Head */}
      <circle cx="50" cy="38" r="16" fill={skinTone} />
      {/* Hair */}
      <path
        d="M 34 38 Q 34 22 50 22 Q 66 22 66 38 Q 63 30 50 28 Q 37 30 34 38 Z"
        fill={HAIR_BROWN}
      />
      <path d="M 34 36 L 33 50 Q 33 54 37 53 L 38 50 L 38 40 Z" fill={HAIR_BROWN} />
      <path d="M 66 36 L 67 50 Q 67 54 63 53 L 62 50 L 62 40 Z" fill={HAIR_BROWN} />
      {/* Glasses */}
      <rect x="40" y="37" width="8" height="6.5" rx="1.5" fill="none" stroke="#0F172A" strokeWidth="1.3" />
      <rect x="52" y="37" width="8" height="6.5" rx="1.5" fill="none" stroke="#0F172A" strokeWidth="1.3" />
      <line x1="48" y1="40" x2="52" y2="40" stroke="#0F172A" strokeWidth="1.3" />
      <Eyes />
      <Smile />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// BOY TEACHER
// ═══════════════════════════════════════════════════════════════
export function BoyTeacher({
  className = '',
  skinTone = '#F5C9A0',
}: FigureProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Shirt */}
      <path
        d="M 32 72 Q 32 62 40 60 L 60 60 Q 68 62 68 72 L 68 92 L 32 92 Z"
        fill="#10B981"
      />
      <path d="M 43 60 L 50 70 L 57 60 L 53 61 L 50 66 L 47 61 Z" fill="#047857" />
      <line x1="50" y1="72" x2="50" y2="92" stroke="#047857" strokeWidth="0.7" />
      {/* Neck */}
      <rect x="45" y="52" width="10" height="10" rx="2" fill={skinTone} />
      {/* Head */}
      <circle cx="50" cy="38" r="16" fill={skinTone} />
      {/* Hair */}
      <path
        d="M 34 38 Q 34 22 50 22 Q 66 22 66 38 Q 63 30 50 28 Q 37 30 34 38 Z"
        fill={HAIR_BLACK}
      />
      <Eyes />
      {/* Bigger smile */}
      <path
        d="M 44 46 Q 50 52 56 46"
        stroke={MOUTH_COLOR}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// GIRL TEACHER
// ═══════════════════════════════════════════════════════════════
export function GirlTeacher({
  className = '',
  skinTone = '#F5C9A0',
}: FigureProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Shirt */}
      <path
        d="M 32 72 Q 32 62 40 60 L 60 60 Q 68 62 68 72 L 68 92 L 32 92 Z"
        fill="#14B8A6"
      />
      <path d="M 43 60 L 50 70 L 57 60 L 53 61 L 50 66 L 47 61 Z" fill="#0F766E" />
      <line x1="50" y1="72" x2="50" y2="92" stroke="#0F766E" strokeWidth="0.7" />
      {/* Neck */}
      <rect x="45" y="52" width="10" height="10" rx="2" fill={skinTone} />
      {/* Head */}
      <circle cx="50" cy="38" r="16" fill={skinTone} />
      {/* Hair — medium */}
      <path
        d="M 34 38 Q 34 22 50 22 Q 66 22 66 38 Q 63 30 50 28 Q 37 30 34 38 Z"
        fill={HAIR_BROWN}
      />
      <path d="M 34 36 L 33 54 Q 33 58 37 57 L 38 54 L 38 40 Z" fill={HAIR_BROWN} />
      <path d="M 66 36 L 67 54 Q 67 58 63 57 L 62 54 L 62 40 Z" fill={HAIR_BROWN} />
      <Eyes />
      <path
        d="M 44 46 Q 50 52 56 46"
        stroke={MOUTH_COLOR}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// Registry + labels (bilingual)
// ═══════════════════════════════════════════════════════════════
export type FigureId =
  | 'boy_student'
  | 'girl_student'
  | 'boy_scientist'
  | 'girl_scientist'
  | 'boy_professor'
  | 'girl_professor'
  | 'boy_teacher'
  | 'girl_teacher'

export type FigureRole = 'student' | 'scientist' | 'professor' | 'teacher'
export type FigureGender = 'boy' | 'girl'

export interface FigureMeta {
  id: FigureId
  gender: FigureGender
  role: FigureRole
  labelEn: string
  labelHi: string
  Component: ComponentType<FigureProps>
}

export const FIGURES: FigureMeta[] = [
  {
    id: 'boy_student',
    gender: 'boy',
    role: 'student',
    labelEn: 'Boy Student',
    labelHi: 'छात्र',
    Component: BoyStudent,
  },
  {
    id: 'girl_student',
    gender: 'girl',
    role: 'student',
    labelEn: 'Girl Student',
    labelHi: 'छात्रा',
    Component: GirlStudent,
  },
  {
    id: 'boy_scientist',
    gender: 'boy',
    role: 'scientist',
    labelEn: 'Boy Scientist',
    labelHi: 'वैज्ञानिक',
    Component: BoyScientist,
  },
  {
    id: 'girl_scientist',
    gender: 'girl',
    role: 'scientist',
    labelEn: 'Girl Scientist',
    labelHi: 'वैज्ञानिक',
    Component: GirlScientist,
  },
  {
    id: 'boy_professor',
    gender: 'boy',
    role: 'professor',
    labelEn: 'Boy Professor',
    labelHi: 'प्रोफ़ेसर',
    Component: BoyProfessor,
  },
  {
    id: 'girl_professor',
    gender: 'girl',
    role: 'professor',
    labelEn: 'Girl Professor',
    labelHi: 'प्रोफ़ेसर',
    Component: GirlProfessor,
  },
  {
    id: 'boy_teacher',
    gender: 'boy',
    role: 'teacher',
    labelEn: 'Boy Teacher',
    labelHi: 'शिक्षक',
    Component: BoyTeacher,
  },
  {
    id: 'girl_teacher',
    gender: 'girl',
    role: 'teacher',
    labelEn: 'Girl Teacher',
    labelHi: 'शिक्षिका',
    Component: GirlTeacher,
  },
]

export const FIGURE_LIST: FigureId[] = FIGURES.map((f) => f.id)

export const FIGURE_MAP: Record<FigureId, FigureMeta> = FIGURES.reduce(
  (acc, fig) => {
    acc[fig.id] = fig
    return acc
  },
  {} as Record<FigureId, FigureMeta>
)

export function isFigureId(value: unknown): value is FigureId {
  return typeof value === 'string' && (FIGURE_LIST as string[]).includes(value)
}

export const DEFAULT_FIGURE: FigureId = 'boy_student'