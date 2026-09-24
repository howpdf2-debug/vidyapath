// lib/streak.ts
// Server-side streak computation from timestamps.
// Rule: consecutive days count. Grace: today OR yesterday as anchor.
// Timezone: UTC (approximation — VidyaPath is India-only).

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Compute current streak from a list of ISO timestamps.
 * Returns 0 if no activity in the last 2 days (today or yesterday).
 */
export function computeStreak(timestamps: (string | null | undefined)[]): number {
  const days = new Set<string>()

  for (const ts of timestamps) {
    if (!ts) continue
    const d = new Date(ts)
    if (Number.isNaN(d.getTime())) continue
    days.add(d.toISOString().split('T')[0])
  }

  if (days.size === 0) return 0

  const sorted = [...days].sort().reverse() // newest first

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  const yesterdayStr = new Date(today.getTime() - DAY_MS)
    .toISOString()
    .split('T')[0]

  const first = sorted[0]
  // Grace: today OR yesterday must be present
  if (first !== todayStr && first !== yesterdayStr) return 0

  let streak = 1
  let expectedMs =
    new Date(`${first}T00:00:00Z`).getTime() - DAY_MS

  for (let i = 1; i < sorted.length; i++) {
    const expectedStr = new Date(expectedMs).toISOString().split('T')[0]
    if (sorted[i] === expectedStr) {
      streak++
      expectedMs -= DAY_MS
    } else {
      break
    }
  }

  return streak
}