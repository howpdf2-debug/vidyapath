// lib/subject-order.ts

/**
 * Logical display order for subjects.
 * Mathematics first, then Science, then language subjects.
 * Unknown subjects go last, alphabetically.
 */
const SUBJECT_ORDER: Record<string, number> = {
  Mathematics: 1,
  Math: 1,
  Science: 2,
  Physics: 3,
  Chemistry: 4,
  Biology: 5,
  'Social Science': 6,
  English: 7,
  Hindi: 8,
  Sanskrit: 9,
}

export function sortSubjects(entries: [string, number][]): [string, number][] {
  return [...entries].sort((a, b) => {
    const orderA = SUBJECT_ORDER[a[0]] ?? 999
    const orderB = SUBJECT_ORDER[b[0]] ?? 999
    if (orderA !== orderB) return orderA - orderB
    return a[0].localeCompare(b[0])
  })
}