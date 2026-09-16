'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ExamGroup } from '@/lib/exams'

interface GroupTabsProps {
  groups: ExamGroup[]
  currentGroup: string
}

export function GroupTabs({ groups, currentGroup }: GroupTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('group', slug)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div
      role="tablist"
      aria-label="Group selection"
      className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 overflow-x-auto scrollbar-none max-w-full"
    >
      {groups.map((group) => {
        const active = group.slug === currentGroup
        return (
          <button
            key={group.slug}
            role="tab"
            aria-selected={active}
            onClick={() => handleChange(group.slug)}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
              active
                ? 'bg-white text-slate-900 shadow-lg'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{group.name_hi}</span>
            <span
              className={`text-[10px] font-medium ${
                active ? 'text-slate-500' : 'text-white/60'
              }`}
            >
              ({group.name_en})
            </span>
          </button>
        )
      })}
    </div>
  )
}