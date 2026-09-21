import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * Catch-all for unmatched /admin/* routes.
 * Next.js 14 mein nested not-found sirf notFound() call se trigger hota hai.
 * Ye file usi ke liye hai — /admin/xyz123 → notFound() → app/admin/not-found.tsx render
 */
export default function AdminCatchAll(): never {
  notFound()
}