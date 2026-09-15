'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bookmark, BookOpen, ChevronRight, Home, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BackButton } from '@/components/BackButton'

interface BookmarkItem {
  ncert_id: number
  created_at: string
  ncert: {
    id: number
    class: number
    subject: string
    chapter_num: number
    chapter_title: string
    language: string
  }
}

export default function BookmarksPage() {
  const router = useRouter()
  const [items, setItems] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/login')
          return
        }

        const isConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at)
        if (!isConfirmed) {
          const email = user.email
          if (email) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`)
          } else {
            router.push('/verify-email')
          }
          return
        }

        // ✅ Fetch bookmarks with joined ncert data
        const { data, error } = await supabase
          .from('bookmarks')
          .select(
            'ncert_id, created_at, ncert!inner(id, class, subject, chapter_num, chapter_title, language)'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[bookmarks] Error:', error)
          setItems([])
        } else {
          setItems((data as any) || [])
        }
        setLoading(false)
      } catch (err) {
        console.error('[bookmarks] Unexpected:', err)
        router.push('/login')
      }
    }

    load()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading bookmarks...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <BackButton href="/dashboard" label="Back to Dashboard" />

      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">Bookmarks</span>
      </nav>

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 p-6 md:p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Bookmark className="w-8 h-8 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">My Bookmarks</h1>
            <p className="mt-1 text-white/90">
              {items.length} saved {items.length === 1 ? 'chapter' : 'chapters'}
            </p>
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/40 mb-4">
            <Bookmark className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            No bookmarks yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Jab aap koi chapter bookmark karoge, wo yahan dikhega.
          </p>
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 font-medium"
          >
            <BookOpen className="w-4 h-4" />
            Explore NCERT
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const ch = item.ncert
            const href = `/ncert/${ch.class}/${encodeURIComponent(ch.subject)}/${ch.chapter_num}?lang=${ch.language}`

            return (
              <Link
                key={item.ncert_id}
                href={href}
                className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-medium">
                      Class {ch.class}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-xs font-medium">
                      {ch.subject}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-md group-hover:scale-105 transition">
                      {ch.chapter_num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        Chapter {ch.chapter_num}
                      </p>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 mt-0.5">
                        {ch.chapter_title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Bookmarked
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                    Open <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}