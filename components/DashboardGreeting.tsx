'use client'

import { useEffect, useState } from 'react'

interface DashboardGreetingProps {
  name: string
  email?: string
}

interface TimeState {
  greeting: string
  emoji: string
}

// Server + first client render use this (no hydration mismatch)
const FALLBACK: TimeState = { greeting: 'Welcome back', emoji: '👋' }

function getTimeGreeting(hour: number): TimeState {
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning', emoji: '☀️' }
  }
  if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon', emoji: '🌤️' }
  }
  if (hour >= 17 && hour < 21) {
    return { greeting: 'Good evening', emoji: '🌆' }
  }
  return { greeting: 'Late night grind', emoji: '🌙' }
}

export function DashboardGreeting({ name, email }: DashboardGreetingProps) {
  const [time, setTime] = useState<TimeState>(FALLBACK)

  useEffect(() => {
    const update = () => {
      setTime(getTimeGreeting(new Date().getHours()))
    }
    update()

    // Optional: refresh greeting if user keeps tab open across time boundary
    const interval = window.setInterval(update, 60 * 60 * 1000) // 1 hour
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="min-w-0">
      <p className="text-white/80 text-sm" suppressHydrationWarning>
        {time.greeting},
      </p>
      <h1 className="text-2xl md:text-3xl font-bold truncate">
        {name}! <span suppressHydrationWarning>{time.emoji}</span>
      </h1>
      {email && (
        <p className="text-white/70 text-xs md:text-sm truncate mt-1">
          {email}
        </p>
      )}
    </div>
  )
}